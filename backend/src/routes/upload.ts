import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { authenticate } from '../middleware/auth.js';
import { uploadToS3 } from '../utils/s3.js';
import { generateVariants } from '../utils/imageProcessor.js';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
  'video/mp4', 'video/webm', 'video/ogg',
  'application/pdf',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp']);

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.mp4', '.webm', '.ogg', '.pdf', '.doc', '.docx']);

const router = Router();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.resolve(process.cwd(), 'uploads'));
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = ALLOWED_EXTENSIONS.has(ext) ? ext : '.bin';
    cb(null, `${uuidv4()}${safeExt}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      cb(new Error('Invalid file type'));
      return;
    }
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(new Error('Invalid MIME type'));
      return;
    }
    cb(null, true);
  },
});

router.post('/upload', authenticate, (req: Request, res: Response) => {
  upload.single('file')(req, res, async (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          res.status(413).json({ error: 'File too large (max 50MB)' });
          return;
        }
        res.status(400).json({ error: `Upload error: ${err.message}` });
        return;
      }
      res.status(400).json({ error: err.message });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: 'No file provided' });
      return;
    }

    const context = (req.query.context as string) || 'news_image';
    const localUrl = `/uploads/${req.file.filename}`;
    const absolutePath = path.resolve(req.file.path);

    let url = localUrl;
    const variants: string[] = [];

    // Generate image variants (thumbnails, WebP) for image uploads
    if (IMAGE_MIME_TYPES.has(req.file.mimetype)) {
      try {
        await generateVariants(absolutePath);
      } catch (err) {
        console.error('Variant generation failed:', err);
      }
    }

    try {
      url = await uploadToS3(req.file.buffer || Buffer.from(''), req.file.filename, req.file.mimetype);
    } catch {
      // S3 not configured, use local fallback
    }

    res.json({
      url,
      filename: req.file.filename,
      size: req.file.size,
      mime: req.file.mimetype,
      context,
      hasVariants: variants.length > 0,
    });
  });
});

// On-the-fly image resize endpoint
import { transformImage } from '../utils/imageProcessor.js';

router.get('/images/resize', async (req: Request, res: Response) => {
  try {
    const { url: imgUrl, w, h, format } = req.query as Record<string, string>;
    if (!imgUrl) {
      res.status(400).json({ error: 'url parameter required' });
      return;
    }

    // Only allow local uploads
    const cleanPath = imgUrl.replace(/^\/uploads\//, '');
    const absolutePath = path.resolve(process.cwd(), 'uploads', cleanPath);

    // Security: ensure the resolved path is within uploads dir
    const uploadsDir = path.resolve(process.cwd(), 'uploads');
    if (!absolutePath.startsWith(uploadsDir)) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    if (!fs.existsSync(absolutePath)) {
      res.status(404).json({ error: 'Image not found' });
      return;
    }

    const width = w ? parseInt(w) : undefined;
    const height = h ? parseInt(h) : undefined;
    const fmt = (format === 'jpeg' || format === 'png') ? format : 'webp';

    const buffer = await transformImage(absolutePath, { width, height, format: fmt });

    const mimeMap: Record<string, string> = { webp: 'image/webp', jpeg: 'image/jpeg', png: 'image/png' };
    res.set('Content-Type', mimeMap[fmt] || 'image/webp');
    res.set('Cache-Control', 'public, max-age=86400');
    res.send(buffer);
  } catch (err) {
    console.error('Image resize error:', err);
    res.status(500).json({ error: 'Failed to process image' });
  }
});

export default router;
