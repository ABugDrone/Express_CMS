# JM News CMS

A **dynamic, schema-driven CMS platform** with 5 premium UI themes, full admin customization, and production-ready architecture.

**Status:** ~95% Complete — Core features production-ready

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│              UI THEME LAYER                      │
│  Classic News │ Minimal │ Editorial │ Bold Dark  │
│  Luxury       │ Custom Imports                   │
│              Token System (CSS Variables)        │
├─────────────────────────────────────────────────┤
│              SMART API LAYER                     │
│  REST API │ Auth/RBAC │ WebSocket │ Smart URLs  │
├─────────────────────────────────────────────────┤
│              CORE ENGINE                         │
│  Schema Builder │ Admin GUI │ Theme Import       │
├─────────────────────────────────────────────────┤
│              STORAGE LAYER                       │
│  MySQL/MariaDB │ File Upload │ Cache             │
└─────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19 + Vite + TailwindCSS 4 + React Router 7 |
| **Backend** | Node.js 18+ / Express.js + Prisma ORM |
| **Database** | MySQL 8+ / MariaDB 10+ |
| **Auth** | JWT + bcrypt (12 rounds) |
| **Real-time** | WebSocket (ws) |
| **Validation** | Zod |
| **Styling** | TailwindCSS 4 + CSS Custom Properties |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |

---

## Features

### Admin Panel (`/admin`)
| Module | Description |
|--------|------------|
| News Contents | Overview stats, article management |
| Post News | Create/edit/delete articles |
| Post Ads | Manage ad placements (top, sidebar, middle) |
| Comment Moderation | Flag spam, feature, ban users |
| Staff Management | CRUD editor/reporter/moderator accounts |
| Journalist Profile | Bio, avatar, social links |
| Site Settings | Name, tagline, contact info |
| **Branding** | Logo, favicon, copyright, newsletter, WhatsApp/paper edition links |
| **Social Links** | CRUD social platforms with icons & ordering |
| **News Types** | Dynamic categories with standalone flag support |
| **Quick Links** | Tabbed UI: footer links, legal pages, contact info |
| **CTA Elements** | Call-to-action banners with placement targeting |
| **Page Elements** | CMD-style generic elements (HTML, text, image, video, script) |
| **Theme Manager** | Gallery view, activate, duplicate, export, delete |
| **Theme Customizer** | Live color/typography/layout/component/CSS editing |
| **Theme Import** | JSON file upload |

### Public Site
- Responsive layout with ad placements
- Category/article pages with SEO metadata
- Live RSS wire from Punch & Daily Trust
- Breaking news + trending sections
- Search with live results
- Newsletter signup (WhatsApp + email)
- Paper edition download link
- Consent modal (cookie compliance)
- Comment system (threaded with voting)
- **Theme Switcher** — users can select from available themes

### Theme System (5 Premium Themes)
1. **Classic News** — Traditional newspaper, Playfair Display + Inter, amber/charcoal
2. **Minimal Blog** — Brutalist minimalism, Inter monochrome, center-aligned
3. **Editorial Magazine** — Bold magazine, Bebas Neue + Source Sans Pro, red/navy/gold
4. **Bold Dark** (Premium) — Cyberpunk, Orbitron + DM Sans, neon/purple, glassmorphism
5. **Luxury Editorial** (Premium) — High-fashion, Cormorant Garamond + Crimson Pro, gold/ivory

All themes use CSS Custom Properties injected at runtime. No page reload required on switch.

### Backend Highlights
- **WebSocket manager** — room-based broadcasting for real-time updates (comments, breaking news, view counters)
- **Security middleware** — Helmet headers, CORS, rate limiting, XSS sanitization
- **Request logging** — color-coded console with performance tracking
- **Environment validation** — Zod schema with fail-fast on missing config
- **Graceful shutdown** — proper cleanup on SIGTERM/SIGINT
- **RSS feed** — aggregation from Punch and Daily Trust
- **XML sitemap** — auto-generated for SEO
- **File upload** — local disk with context-based organisation
- **Slug engine** — unique slug generation with collision avoidance

---

## Project Structure

```
jm-news-EXPRESS/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma    # 16 models
│   │   └── seed.ts          # Admin user + CMS defaults
│   ├── scripts/
│   │   └── seed-themes.ts   # 5 premium themes
│   ├── src/
│   │   ├── config/env.ts    # Zod-validated env
│   │   ├── lib/             # Prisma, JWT, slug, WebSocket
│   │   ├── middleware/      # Auth, RBAC, logger, security, error handler
│   │   ├── routes/          # 20+ route files
│   │   ├── utils/           # SEO helpers
│   │   └── index.ts         # Express + HTTP server entry
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/       # AdminBranding, AdminSocials, AdminNewsTypes, etc.
│   │   │   ├── layout/      # Header, Footer, Sidebar
│   │   │   ├── ui/          # ThemeToggle, ThemeSwitcher, Logo, RssWire, etc.
│   │   │   ├── ads/         # AdBanner
│   │   │   └── modals/      # ConsentModal
│   │   ├── pages/
│   │   │   ├── admin/       # ThemeManager, ThemeCustomizer, ThemeImport
│   │   │   ├── HomePage, ArticlePage, CategoryPage, AboutUsPage, etc.
│   │   │   └── AdminDashboard.tsx
│   │   ├── themes/
│   │   │   ├── ThemeProvider.tsx, ThemeLoader.tsx, useTheme.ts, themeUtils.ts
│   │   │   ├── themeTypes.ts
│   │   │   └── presets/     # 5 theme preset files
│   │   ├── context/AppContext.tsx
│   │   ├── lib/api.ts       # 60+ typed API functions
│   │   └── App.tsx          # Routes + lazy loading
│   └── package.json
├── .opencode/
├── .vscode/
├── package.json              # Root orchestrator
└── README.md
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- MySQL 8+ or MariaDB 10+
- XAMPP (Windows) or native MySQL

### 1. Database Setup
```bash
# Start MySQL/MariaDB, then create database:
mysql -u root -p -e "CREATE DATABASE jmnews;"
```

### 2. Backend
```bash
cd backend
npm install
# Edit .env — set DATABASE_URL, JWT_SECRET, ADMIN_PASSWORD
npm run setup   # pushes schema, seeds data + themes
npm run dev     # starts on http://localhost:8000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev     # starts on http://localhost:3000
```

### 4. Access
- **Public site:** http://localhost:3000
- **Admin login:** http://localhost:3000/admin
- **API health:** http://localhost:8000/api/health
- **Theme manager:** http://localhost:3000/admin/themes

### Environment Variables (.env)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | — | `mysql://user:pass@localhost:3306/jmnews` |
| `JWT_SECRET` | Yes | — | Min 32 characters |
| `ADMIN_USERNAME` | No | `admin` | Initial admin username |
| `ADMIN_PASSWORD` | Yes | — | Min 8 characters |
| `PORT` | No | `8000` | API server port |
| `NODE_ENV` | No | `development` | `development` / `production` |
| `CORS_ORIGIN` | No | `http://localhost:3000` | Allowed CORS origin |
| `WS_ENABLED` | No | `true` | Enable WebSocket |

---

## API Overview (20+ Route Files)

| Route | Description |
|-------|------------|
| `GET /api/health` | Server health + WS stats |
| `POST /api/auth?action=login` | Authenticate |
| `GET /api/articles` | List articles (paginated, filterable) |
| `POST /api/articles` | Create article (auth) |
| `GET /api/themes` | List all themes |
| `GET /api/themes/active` | Get active theme config |
| `POST /api/themes/:id/activate` | Activate theme (admin) |
| `GET /api/news-types` | List news types |
| `GET /api/news-types/active` | Active categories |
| `GET /api/site-settings` | Get all site settings |
| `GET /api/socials` | Active social links |
| `GET /api/quick-links` | Filter by group |
| `GET /api/legal-pages` | Active legal pages |
| `GET /api/contact-info` | Active contact entries |
| `GET /api/cta-elements` | Filter by placement |
| `GET /api/page-elements` | Filter by placement |
| `GET /api/categories` | Active news types (legacy compat) |
| `GET /api/dashboard` | Admin stats |
| `GET /api/rss` | RSS feed aggregation |
| `GET /api/sitemap.xml` | XML sitemap |

All CMS endpoints support full CRUD with admin auth.

---

## Database Schema (16 Models)

`User`, `Article`, `Comment`, `NewsType`, `SiteSetting`, `SocialLink`, `QuickLink`, `LegalPage`, `ContactInfo`, `CTAElement`, `PageElement`, `AdminCommand`, `Advertisement`, `BannedUser`, `Theme`, `Setting`

---

## Deployment

```bash
# Backend production build
cd backend && npm run build && node dist/index.js

# Frontend production build
cd frontend && npm run build
# Serve frontend/dist from nginx or deploy to Vercel/Railway
```

See `DEPLOYMENT_CHECKLIST.md` (removed — content summarised here) for full production checklist:
- Set `NODE_ENV=production`
- Configure HTTPS/SSL
- Harden JWT_SECRET (32+ chars)
- Restrict CORS to your domain
- Enable database backups
- Set up monitoring (optional: Sentry, PM2)

---

## Resource Requirements

| Environment | CPU | RAM | Disk |
|------------|-----|-----|------|
| **Development** | Any | 2 GB | 10 GB |
| **Production (recommended)** | 2 cores | 4 GB | 50 GB SSD |

Estimated production cost: ~$15–30/month (VPS + domain + optional CDN)

---

## License

Jabbamah Menorah Limited &copy; 2026
