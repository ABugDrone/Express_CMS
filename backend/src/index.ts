import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { env, isDevelopment } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger, errorLogger } from './middleware/logger.js';
import { securityHeaders, sanitizeRequest } from './middleware/security.js';
import { wsManager } from './lib/websocket.js';
import { generateSitemapXml } from './utils/seo.js';
import { prisma } from './lib/prisma.js';

import authRoutes from './routes/auth.js';
import articleRoutes from './routes/articles.js';
import commentRoutes from './routes/comments.js';
import staffRoutes from './routes/staff.js';
import adRoutes from './routes/ads.js';
import dashboardRoutes from './routes/dashboard.js';
import settingsRoutes from './routes/settings.js';
import bannedRoutes from './routes/banned.js';
import uploadRoutes from './routes/upload.js';
import rssRoutes from './routes/rss.js';
import schemaRoutes from './routes/schema.js';
import themeRoutes from './routes/themes.js';
import newsTypeRoutes from './routes/newsTypes.js';
import siteSettingRoutes from './routes/siteSettings.js';
import socialRoutes from './routes/socials.js';
import quickLinkRoutes from './routes/quickLinks.js';
import legalPageRoutes from './routes/legalPages.js';
import contactInfoRoutes from './routes/contactInfo.js';
import configRoutes from './routes/config.js';
import ctaElementRoutes from './routes/ctaElements.js';
import pageElementRoutes from './routes/pageElements.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const httpServer = createServer(app);

// ── Security & Logging Middleware ────────────────────────────────────────────
app.use(securityHeaders);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:5173', env.APP_URL], credentials: true }));
app.use(requestLogger);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(sanitizeRequest);

// ── Rate Limiting ────────────────────────────────────────────────────────────
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', generalLimiter);



// ── Static Files ─────────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads'), {
  maxAge: '7d',
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'public, max-age=604800');
  },
}));

// In production, serve the built frontend
if (!isDevelopment) {
  const publicPath = path.resolve(process.cwd(), 'public');
  app.use(express.static(publicPath, { maxAge: '1y' }));
}

// ── API Routes ───────────────────────────────────────────────────────────────

app.use('/api', authRoutes);
app.use('/api', articleRoutes);
app.use('/api', commentRoutes);
app.use('/api', staffRoutes);
app.use('/api', adRoutes);
app.use('/api', dashboardRoutes);
app.use('/api', settingsRoutes);
app.use('/api', bannedRoutes);
app.use('/api', uploadRoutes);
app.use('/api', rssRoutes);
app.use('/api', schemaRoutes);
app.use('/api', themeRoutes);
app.use('/api', newsTypeRoutes);
app.use('/api', siteSettingRoutes);
app.use('/api', socialRoutes);
app.use('/api', quickLinkRoutes);
app.use('/api', legalPageRoutes);
app.use('/api', configRoutes);
app.use('/api', contactInfoRoutes);
app.use('/api', ctaElementRoutes);
app.use('/api', pageElementRoutes);

app.get('/api/sitemap.xml', async (_req, res) => {
  try {
    const xml = await generateSitemapXml();
    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    console.error('Sitemap error:', err);
    res.status(500).json({ error: 'Failed to generate sitemap' });
  }
});

app.get('/robots.txt', (_req, res) => {
  const baseUrl = env.APP_URL;
  res.type('text/plain');
  res.send(`User-agent: *
Allow: /
Disallow: /admin
Disallow: /staff
Disallow: /api

Sitemap: ${baseUrl}/api/sitemap.xml
`);
});

app.get('/api/health', (_req, res) => {
  const wsStats = wsManager.getStats();
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    websocket: env.WS_ENABLED ? wsStats : { enabled: false },
    environment: env.NODE_ENV,
  });
});

app.post('/api/stats/article/:id/views', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Valid article ID is required' });
      return;
    }
    const article = await prisma.article.update({
      where: { id },
      data: { views: { increment: 1 } },
      select: { views: true },
    });
    
    // Notify WebSocket clients about view update
    if (env.WS_ENABLED) {
      wsManager.notifyViewUpdate(id, article.views);
    }
    
    res.json({ views: article.views });
  } catch {
    res.status(404).json({ error: 'Article not found' });
  }
});

// ── SPA fallback (production) ───────────────────────────────────────────────
// Must come after all API routes so it only catches client-side routes
app.get('*', (_req, res) => {
  if (!isDevelopment) {
    res.sendFile(path.resolve(process.cwd(), 'public', 'index.html'));
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

// ── Error Handling ───────────────────────────────────────────────────────────
app.use(errorLogger);
app.use(errorHandler);

// ── Server Startup ───────────────────────────────────────────────────────────
const PORT = env.PORT;

httpServer.listen(PORT, () => {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║           🚀 JM News API Server Started                   ║');
  console.log('╠════════════════════════════════════════════════════════════╣');
  console.log(`║  📡 API URL:        ${env.APP_URL.padEnd(33)}║`);
  console.log(`║  🌍 Environment:    ${env.NODE_ENV.padEnd(33)}║`);
  console.log(`║  🔌 Port:           ${PORT.toString().padEnd(33)}║`);
  console.log(`║  🔐 Database:       ${env.DATABASE_URL.includes('mysql') ? 'MySQL/MariaDB'.padEnd(33) : 'Connected'.padEnd(33)}║`);
  console.log(`║  🌐 WebSocket:      ${(env.WS_ENABLED ? `Enabled (${env.APP_URL}/ws)` : 'Disabled').padEnd(33)}║`);
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  if (isDevelopment) {
    console.log('💡 Development mode tips:');
    console.log('   - API docs: http://localhost:8000/api/health');
    console.log('   - Database studio: npm run db:studio');
    console.log('   - WebSocket test: ws://localhost:8000/ws\n');
  }
});

// Initialize WebSocket server
wsManager.initialize(httpServer);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n⚠️  SIGTERM received, shutting down gracefully...');
  wsManager.shutdown();
  httpServer.close(() => {
    console.log('✓ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n⚠️  SIGINT received, shutting down gracefully...');
  wsManager.shutdown();
  httpServer.close(() => {
    console.log('✓ Server closed');
    process.exit(0);
  });
});

export default app;
