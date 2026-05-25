import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/rbac.js';

const router = Router();

function serializeContact(c: any) {
  return {
    id: c.id,
    type: c.type,
    label: c.label,
    value: c.value,
    icon: c.icon || '',
    sort_order: c.sortOrder,
    is_active: c.isActive ? 1 : 0,
    created_at: c.createdAt.toISOString(),
  };
}

function safeParseInt(value: string | undefined): number | null {
  if (!value) return null;
  const n = parseInt(value, 10);
  return isNaN(n) ? null : n;
}

router.get('/contact-info', async (_req: Request, res: Response) => {
  try {
    const contacts = await prisma.contactInfo.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { type: 'asc' }],
    });
    res.json(contacts.map(serializeContact));
  } catch (err) {
    console.error('Contact info error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/contact-info/all', authenticate, async (_req: Request, res: Response) => {
  try {
    const contacts = await prisma.contactInfo.findMany({
      orderBy: [{ sortOrder: 'asc' }, { type: 'asc' }],
    });
    res.json(contacts.map(serializeContact));
  } catch (err) {
    console.error('All contact info error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/contact-info', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { type, label, value, icon, sort_order, is_active } = req.body;
    if (!type || !label || !value) {
      res.status(400).json({ error: 'Type, label, and value are required' });
      return;
    }
    const contact = await prisma.contactInfo.create({
      data: {
        type,
        label,
        value,
        icon: icon || '',
        sortOrder: sort_order ?? 0,
        isActive: is_active !== undefined ? (is_active === 1 || is_active === true) : true,
      },
    });
    res.status(201).json({ id: contact.id });
  } catch (err) {
    console.error('Contact info create error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/contact-info', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const contactId = safeParseInt(req.query.id as string);
    if (!contactId) {
      res.status(400).json({ error: 'Valid contact info ID is required' });
      return;
    }
    const { type, label, value, icon, sort_order, is_active } = req.body;
    const data: any = {};
    if (type !== undefined) data.type = type;
    if (label !== undefined) data.label = label;
    if (value !== undefined) data.value = value;
    if (icon !== undefined) data.icon = icon;
    if (sort_order !== undefined) data.sortOrder = sort_order;
    if (is_active !== undefined) data.isActive = is_active === 1 || is_active === true;

    const contact = await prisma.contactInfo.update({ where: { id: contactId }, data });
    res.json(serializeContact(contact));
  } catch (err: any) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Contact info not found' });
      return;
    }
    console.error('Contact info update error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/contact-info', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const contactId = safeParseInt(req.query.id as string);
    if (!contactId) {
      res.status(400).json({ error: 'Valid contact info ID is required' });
      return;
    }
    await prisma.contactInfo.delete({ where: { id: contactId } });
    res.json({ message: 'Contact info deleted' });
  } catch (err: any) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Contact info not found' });
      return;
    }
    console.error('Contact info delete error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
