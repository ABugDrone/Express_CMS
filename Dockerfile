# ── Build Frontend ──
FROM node:22-alpine AS frontend
WORKDIR /build/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ── Build Backend ──
FROM node:22-alpine AS backend
WORKDIR /build/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend/ ./
RUN npm run build
RUN npm ci --production

# ── Production ──
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production

# Backend compiled output + production deps
COPY --from=backend /build/backend/dist ./dist
COPY --from=backend /build/backend/node_modules ./node_modules
COPY --from=backend /build/backend/package.json ./
COPY backend/prisma ./prisma
RUN npx prisma generate

# Frontend build — served by Express as public/
COPY --from=frontend /build/frontend/dist ./public

EXPOSE 8000
CMD ["node", "dist/index.js"]
