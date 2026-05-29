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

function parseRoles(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try { const parsed = JSON.parse(raw); return Array.isArray(parsed) ? parsed.filter((r: string) => VALID_ROLES.includes(r)) : []; }
  catch { return []; }
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
    roles: parseRoles(s.roles),
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
        roles: true,
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
    const { username, email, password, full_name, role, roles } = req.body;

    if (!password) {
      res.status(400).json({ error: 'password is required' });
      return;
    }

    let safeRoles: string[];
    if (Array.isArray(roles) && roles.length > 0) {
      safeRoles = roles.filter((r: string) => VALID_ROLES.includes(r));
      if (safeRoles.length === 0) {
        res.status(400).json({ error: `At least one valid role required: ${VALID_ROLES.join(', ')}` });
        return;
      }
    } else {
      safeRoles = role && VALID_ROLES.includes(role) ? [role] : ['reporter'];
    }

    const safeUsername = username || (full_name || 'staff').toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').slice(0, 30);
    const safeEmail = email || `${safeUsername}@staff.local`;

    if (safeUsername.length < 3 || safeUsername.length > 50 || !/^[a-zA-Z0-9_]+$/.test(safeUsername)) {
      res.status(400).json({ error: 'Username must be 3-50 alphanumeric characters' });
      return;
    }

    if (!isValidEmail(safeEmail) || safeEmail.length > 255) {
      res.status(400).json({ error: 'Valid email is required' });
      return;
    }

    if (!isStrongPassword(password)) {
      res.status(400).json({ error: 'Password must be 8+ chars with uppercase, lowercase, and number' });
      return;
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ username: safeUsername }, { email: safeEmail }] },
    });
    if (existing) {
      res.status(409).json({ error: 'Username or email already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        username: safeUsername,
        email: safeEmail,
        password: hashedPassword,
        fullName: full_name || null,
        displayName: full_name || safeUsername,
        role: safeRoles[0],
        roles: JSON.stringify(safeRoles),
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

    const { username, email, password, full_name, display_name, bio, avatar_url, twitter_url, linkedin_url, role, roles, is_active } = req.body;

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
    if (is_active !== undefined) data.isActive = is_active === 1 || is_active === true;

    if (Array.isArray(roles) && roles.length > 0) {
      const safeRoles = roles.filter((r: string) => VALID_ROLES.includes(r));
      if (safeRoles.length > 0) {
        data.role = safeRoles[0];
        data.roles = JSON.stringify(safeRoles);
      }
    } else if (role !== undefined) {
      if (!VALID_ROLES.includes(role)) {
        res.status(400).json({ error: `Role must be one of: ${VALID_ROLES.join(', ')}` });
        return;
      }
      data.role = role;
      data.roles = JSON.stringify([role]);
    }

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
