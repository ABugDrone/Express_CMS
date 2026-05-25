import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/rbac.js';

const router = Router();

const VALID_ROLES = ['editor', 'reporter', 'moderator'];

function safeParseInt(value: string | undefined): number | null {
  if (!value) return null;
  const n = parseInt(value, 10);
  return isNaN(n) ? null : n;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isStrongPassword(password: string): boolean {
  return password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password);
}

function serializeStaff(s: any) {
  return {
    id: s.id,
    username: s.username,
    email: s.email,
    full_name: s.fullName || '',
    display_name: s.displayName || s.username,
    bio: s.bio || '',
    avatar_url: s.avatarUrl || '',
    twitter_url: s.twitterUrl || '',
    linkedin_url: s.linkedinUrl || '',
    role: s.role,
    is_active: s.isActive ? 1 : 0,
    last_login: s.lastLogin?.toISOString() || null,
    created_at: s.createdAt.toISOString(),
  };
}

router.get('/staff', authenticate, async (_req: Request, res: Response) => {
  try {
    const staff = await prisma.user.findMany({
      where: { role: { not: 'admin' } },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        displayName: true,
        bio: true,
        avatarUrl: true,
        twitterUrl: true,
        linkedinUrl: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(staff.map(serializeStaff));
  } catch (err) {
    console.error('Staff list error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/staff', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { username, email, password, full_name, role } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({ error: 'username, email, and password are required' });
      return;
    }

    if (username.length < 3 || username.length > 50 || !/^[a-zA-Z0-9_]+$/.test(username)) {
      res.status(400).json({ error: 'Username must be 3-50 alphanumeric characters' });
      return;
    }

    if (!isValidEmail(email) || email.length > 255) {
      res.status(400).json({ error: 'Valid email is required' });
      return;
    }

    if (!isStrongPassword(password)) {
      res.status(400).json({ error: 'Password must be 8+ chars with uppercase, lowercase, and number' });
      return;
    }

    if (role && !VALID_ROLES.includes(role)) {
      res.status(400).json({ error: `Role must be one of: ${VALID_ROLES.join(', ')}` });
      return;
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ username }, { email }] },
    });
    if (existing) {
      res.status(409).json({ error: 'Username or email already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        fullName: full_name || null,
        displayName: full_name || username,
        role: role || 'reporter',
      },
    });

    res.status(201).json({ id: user.id });
  } catch (err) {
    console.error('Staff create error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/staff', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const staffId = safeParseInt(req.query.id as string);
    if (!staffId) {
      res.status(400).json({ error: 'Valid staff ID is required' });
      return;
    }

    const { username, email, password, full_name, display_name, bio, avatar_url, twitter_url, linkedin_url, role, is_active } = req.body;

    if (username !== undefined && (username.length < 3 || username.length > 50 || !/^[a-zA-Z0-9_]+$/.test(username))) {
      res.status(400).json({ error: 'Username must be 3-50 alphanumeric characters' });
      return;
    }

    if (email !== undefined && (!isValidEmail(email) || email.length > 255)) {
      res.status(400).json({ error: 'Valid email is required' });
      return;
    }

    if (password && !isStrongPassword(password)) {
      res.status(400).json({ error: 'Password must be 8+ chars with uppercase, lowercase, and number' });
      return;
    }

    if (role !== undefined && !VALID_ROLES.includes(role)) {
      res.status(400).json({ error: `Role must be one of: ${VALID_ROLES.join(', ')}` });
      return;
    }

    const data: any = {};
    if (username !== undefined) data.username = username;
    if (email !== undefined) data.email = email;
    if (password) data.password = await bcrypt.hash(password, 12);
    if (full_name !== undefined) data.fullName = full_name;
    if (display_name !== undefined) data.displayName = display_name;
    if (bio !== undefined) data.bio = bio;
    if (avatar_url !== undefined) data.avatarUrl = avatar_url;
    if (twitter_url !== undefined) data.twitterUrl = twitter_url;
    if (linkedin_url !== undefined) data.linkedinUrl = linkedin_url;
    if (role !== undefined) data.role = role;
    if (is_active !== undefined) data.isActive = is_active === 1 || is_active === true;

    const user = await prisma.user.update({
      where: { id: staffId },
      data,
    });

    res.json({ id: user.id });
  } catch (err) {
    console.error('Staff update error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/staff', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const staffId = safeParseInt(req.query.id as string);
    if (!staffId) {
      res.status(400).json({ error: 'Valid staff ID is required' });
      return;
    }

    await prisma.user.delete({ where: { id: staffId } });
    res.json({ message: 'Staff deleted' });
  } catch (err) {
    console.error('Staff delete error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
