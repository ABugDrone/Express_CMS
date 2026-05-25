import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/rbac.js';
import { uniqueSlug } from '../lib/slug.js';

const router = Router();

/** Parse cssContent JSON and spread onto the theme object */
function parseTheme(theme: any) {
  let result: any = {
    id: theme.id,
    name: theme.name,
    slug: theme.slug,
    description: theme.description,
    version: theme.version,
    isActive: theme.isActive,
    isPremium: theme.isPremium,
    previewUrl: theme.previewUrl,
    author: theme.author,
    createdAt: theme.createdAt,
    updatedAt: theme.updatedAt,
  };
  if (theme.cssContent && theme.cssContent.startsWith('{')) {
    try {
      const parsed = JSON.parse(theme.cssContent);
      result = { ...result, ...parsed };
    } catch (e) {
      console.error('Failed to parse cssContent JSON:', e);
    }
  } else {
    result.cssContent = theme.cssContent || '';
  }
  return result;
}

// Get all themes
router.get('/themes', async (_req: Request, res: Response) => {
  try {
    const raw = await prisma.theme.findMany({ 
      orderBy: { createdAt: 'desc' } 
    });
    res.json({ themes: raw.map(parseTheme), total: raw.length });
  } catch (err) {
    console.error('Themes list error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get active theme
router.get('/themes/active', async (_req: Request, res: Response) => {
  try {
    const active = await prisma.theme.findFirst({ where: { isActive: true } });
    
    if (!active) {
      res.status(404).json({ error: 'No active theme found' });
      return;
    }

    res.json({ theme: parseTheme(active) });
  } catch (err) {
    console.error('Active theme error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get theme by ID
router.get('/themes/:id', async (req: Request, res: Response) => {
  try {
    const raw = await prisma.theme.findUnique({ 
      where: { id: parseInt(req.params.id) } 
    });
    
    if (!raw) {
      res.status(404).json({ error: 'Theme not found' });
      return;
    }

    res.json({ theme: parseTheme(raw) });
  } catch (err) {
    console.error('Theme get error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new theme
router.post('/themes', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { 
      name, 
      description, 
      version,
      author,
      cssContent, 
      isPremium,
      previewUrl,
      colors,
      typography,
      layout,
      components,
    } = req.body;

    if (!name) {
      res.status(400).json({ error: 'name is required' });
      return;
    }

    const slug = await uniqueSlug(name, 'theme');

    // Store full theme configuration as JSON in cssContent
    const themeConfig = {
      colors,
      typography,
      layout,
      components,
      cssContent: cssContent || '',
    };

    const theme = await prisma.theme.create({
      data: {
        name,
        slug,
        description: description || '',
        version: version || '1.0.0',
        author: author || 'Admin',
        cssContent: JSON.stringify(themeConfig),
        isPremium: isPremium || false,
        previewUrl: previewUrl || null,
        isActive: false,
      },
    });

    res.status(201).json({ theme: parseTheme(theme) });
  } catch (err) {
    console.error('Theme create error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update theme
router.put('/themes/:id', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { 
      name, 
      description, 
      version,
      cssContent, 
      isPremium,
      previewUrl,
      colors,
      typography,
      layout,
      components,
    } = req.body;

    const data: any = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (version !== undefined) data.version = version;
    if (isPremium !== undefined) data.isPremium = isPremium;
    if (previewUrl !== undefined) data.previewUrl = previewUrl;

    // Update theme configuration
    if (colors || typography || layout || components || cssContent !== undefined) {
      const existing = await prisma.theme.findUnique({
        where: { id: parseInt(req.params.id) }
      });

      if (!existing) {
        res.status(404).json({ error: 'Theme not found' });
        return;
      }

      let existingConfig: any = {};
      try {
        if (existing.cssContent && existing.cssContent.startsWith('{')) {
          existingConfig = JSON.parse(existing.cssContent);
        }
      } catch (e) {
        // Existing cssContent is plain CSS
        existingConfig = { cssContent: existing.cssContent };
      }

      const updatedConfig = {
        ...existingConfig,
        ...(colors && { colors: { ...existingConfig.colors, ...colors } }),
        ...(typography && { typography: { ...existingConfig.typography, ...typography } }),
        ...(layout && { layout: { ...existingConfig.layout, ...layout } }),
        ...(components && { components: { ...existingConfig.components, ...components } }),
        ...(cssContent !== undefined && { cssContent }),
      };

      data.cssContent = JSON.stringify(updatedConfig);
    }

    const raw = await prisma.theme.update({
      where: { id: parseInt(req.params.id) },
      data,
    });

    res.json({ theme: parseTheme(raw) });
  } catch (err) {
    console.error('Theme update error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Activate theme
router.post('/themes/:id/activate', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const themeId = parseInt(req.params.id);

    // Deactivate all themes
    await prisma.theme.updateMany({ 
      where: { isActive: true }, 
      data: { isActive: false } 
    });

    // Activate selected theme
    const raw = await prisma.theme.update({ 
      where: { id: themeId }, 
      data: { isActive: true } 
    });

    res.json({ theme: parseTheme(raw), message: 'Theme activated successfully' });
  } catch (err) {
    console.error('Theme activate error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Duplicate theme
router.post('/themes/:id/duplicate', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const original = await prisma.theme.findUnique({ 
      where: { id: parseInt(req.params.id) } 
    });

    if (!original) {
      res.status(404).json({ error: 'Theme not found' });
      return;
    }

    const slug = await uniqueSlug(`${original.name} Copy`, 'theme');

    const duplicate = await prisma.theme.create({
      data: {
        name: `${original.name} (Copy)`,
        slug,
        description: original.description,
        version: original.version,
        author: original.author,
        cssContent: original.cssContent,
        isPremium: original.isPremium,
        previewUrl: original.previewUrl,
        isActive: false,
      },
    });

    res.status(201).json({ theme: parseTheme(duplicate) });
  } catch (err) {
    console.error('Theme duplicate error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Export theme
router.get('/themes/:id/export', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const theme = await prisma.theme.findUnique({ 
      where: { id: parseInt(req.params.id) } 
    });

    if (!theme) {
      res.status(404).json({ error: 'Theme not found' });
      return;
    }

    // Return theme as downloadable JSON
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${theme.slug}.json"`);
    res.json(theme);
  } catch (err) {
    console.error('Theme export error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Import theme
router.post('/themes/import', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { themeData } = req.body;

    if (!themeData || !themeData.name) {
      res.status(400).json({ error: 'Invalid theme data' });
      return;
    }

    const slug = await uniqueSlug(themeData.name, 'theme');

    const theme = await prisma.theme.create({
      data: {
        name: themeData.name,
        slug,
        description: themeData.description || '',
        version: themeData.version || '1.0.0',
        author: themeData.author || 'Imported',
        cssContent: themeData.cssContent || '',
        isPremium: themeData.isPremium || false,
        previewUrl: themeData.previewUrl || null,
        isActive: false,
      },
    });

    res.status(201).json({ theme: parseTheme(theme), message: 'Theme imported successfully' });
  } catch (err) {
    console.error('Theme import error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Preview theme (doesn't activate it)
router.post('/themes/:id/preview', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const raw = await prisma.theme.findUnique({ 
      where: { id: parseInt(req.params.id) } 
    });

    if (!raw) {
      res.status(404).json({ error: 'Theme not found' });
      return;
    }

    res.json({ theme: parseTheme(raw) });
  } catch (err) {
    console.error('Theme preview error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete theme
router.delete('/themes/:id', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const theme = await prisma.theme.findUnique({
      where: { id: parseInt(req.params.id) }
    });

    if (!theme) {
      res.status(404).json({ error: 'Theme not found' });
      return;
    }

    if (theme.isActive) {
      res.status(400).json({ error: 'Cannot delete active theme' });
      return;
    }

    await prisma.theme.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Theme deleted successfully' });
  } catch (err) {
    console.error('Theme delete error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
