import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import { signToken, verifyToken } from '../lib/jwt.js';
import { env } from '../config/env.js';

const router = Router();

function serializeUserResponse(user: any, role: string, staffRole: string | null) {
  return {
    token: signToken({ userId: user.id, role: user.role, username: user.username }),
    role,
    staff_role: staffRole,
    display_name: user.displayName || user.username,
    bio: user.bio || '',
    avatar_url: user.avatarUrl || '',
    twitter_url: user.twitterUrl || '',
    linkedin_url: user.linkedinUrl || '',
    expires: Date.now() + 86400000,
  };
}

router.all('/auth', async (req: Request, res: Response) => {
  try {
    const { action } = req.query as { action: string };

    switch (action) {
      case 'login': {
        const { username, password } = req.body;
        if (!password) {
          res.status(400).json({ error: 'Password is required' });
          return;
        }

        // Admin login: username='admin' or no username + password matches ADMIN_PASSWORD
        const isAdminLogin =
          (username === 'admin' && password === env.ADMIN_PASSWORD) ||
          (!username && password === env.ADMIN_PASSWORD);

        if (isAdminLogin) {
          let adminUser = await prisma.user.findUnique({ where: { username: 'admin' } });
          if (!adminUser) {
            const hashedPassword = await bcrypt.hash(env.ADMIN_PASSWORD, 12);
            adminUser = await prisma.user.create({
              data: {
                username: 'admin',
                email: 'admin@jmnews.com',
                password: hashedPassword,
                displayName: 'Administrator',
                role: 'admin',
              },
            });
          }

          if (!adminUser.isActive) {
            res.status(403).json({ error: 'Account is deactivated' });
            return;
          }

          await prisma.user.update({
            where: { id: adminUser.id },
            data: { lastLogin: new Date() },
          });

          res.json(serializeUserResponse(adminUser, 'admin', null));
          return;
        }

        // Staff login: password-only (matches env.STAFF_PASSWORD)
        if (password !== env.STAFF_PASSWORD) {
          res.status(401).json({ error: 'Invalid credentials' });
          return;
        }

        let staffUser = await prisma.user.findFirst({ where: { role: { not: 'admin' } } });
        if (!staffUser) {
          const hashedPassword = await bcrypt.hash(env.STAFF_PASSWORD, 12);
          staffUser = await prisma.user.create({
            data: {
              username: 'staff',
              email: 'staff@jmnews.com',
              password: hashedPassword,
              displayName: 'Staff',
              role: 'editor',
            },
          });
        }

        if (!staffUser.isActive) {
          res.status(403).json({ error: 'Account is deactivated' });
          return;
        }

        await prisma.user.update({
          where: { id: staffUser.id },
          data: { lastLogin: new Date() },
        });

        res.json(serializeUserResponse(staffUser, 'staff', staffUser.role));
        return;
      }

      case 'logout': {
        res.json({ message: 'Logged out successfully' });
        return;
      }

      case 'me': {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          res.status(401).json({ error: 'Authentication required' });
          return;
        }

        let payload;
        try {
          payload = verifyToken(authHeader.slice(7));
        } catch {
          res.status(401).json({ error: 'Invalid token' });
          return;
        }

        const user = await prisma.user.findUnique({
          where: { id: payload.userId },
          select: {
            id: true,
            username: true,
            email: true,
            displayName: true,
            bio: true,
            avatarUrl: true,
            twitterUrl: true,
            linkedinUrl: true,
            role: true,
            isActive: true,
            lastLogin: true,
          },
        });

        if (!user) {
          res.status(404).json({ error: 'User not found' });
          return;
        }

        if (!user.isActive) {
          res.status(403).json({ error: 'Account is deactivated' });
          return;
        }

        res.json({
          id: user.id,
          name: user.displayName || user.username,
          display_name: user.displayName || user.username,
          email: user.email,
          role: user.role === 'admin' ? 'admin' : 'staff',
          staffRole: user.role === 'admin' ? null : user.role,
          bio: user.bio || '',
          avatarUrl: user.avatarUrl || '',
          avatar_url: user.avatarUrl || '',
          twitterUrl: user.twitterUrl || '',
          twitter_url: user.twitterUrl || '',
          linkedinUrl: user.linkedinUrl || '',
          linkedin_url: user.linkedinUrl || '',
        });
        return;
      }

      case 'profile': {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          res.status(401).json({ error: 'Authentication required' });
          return;
        }

        let payload;
        try {
          payload = verifyToken(authHeader.slice(7));
        } catch {
          res.status(401).json({ error: 'Invalid token' });
          return;
        }

        if (req.method === 'PUT') {
          const { display_name, bio, avatar_url, twitter_url, linkedin_url } = req.body;
          const user = await prisma.user.update({
            where: { id: payload.userId },
            data: {
              displayName: display_name,
              bio,
              avatarUrl: avatar_url,
              twitterUrl: twitter_url,
              linkedinUrl: linkedin_url,
            },
            select: {
              id: true,
              username: true,
              displayName: true,
              bio: true,
              avatarUrl: true,
              twitterUrl: true,
              linkedinUrl: true,
              role: true,
            },
          });

          res.json({
            id: user.id,
            name: user.displayName || user.username,
            role: user.role === 'admin' ? 'admin' : 'staff',
            bio: user.bio || '',
            avatarUrl: user.avatarUrl || '',
            twitterUrl: user.twitterUrl || '',
            linkedinUrl: user.linkedinUrl || '',
          });
          return;
        }

        res.status(405).json({ error: 'Method not allowed' });
        return;
      }

      case 'journalists': {
        const journalists = await prisma.user.findMany({
          where: {
            isActive: true,
            role: { in: ['editor', 'reporter', 'moderator'] },
          },
          select: {
            displayName: true,
            role: true,
            bio: true,
            avatarUrl: true,
            twitterUrl: true,
            linkedinUrl: true,
          },
        });

        res.json(
          journalists.map((j) => ({
            display_name: j.displayName || 'Staff',
            role_label: j.role.charAt(0).toUpperCase() + j.role.slice(1),
            bio: j.bio || '',
            avatar_url: j.avatarUrl || '',
            twitter_url: j.twitterUrl || '',
            linkedin_url: j.linkedinUrl || '',
          }))
        );
        return;
      }

      default:
        res.status(400).json({ error: 'Invalid action' });
    }
  } catch (err) {
    console.error('Auth error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
