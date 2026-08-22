# GlobeTrotter - Multi-stage Dockerfile
# Frontend: Next.js
# Backend: Node.js + Express + Prisma
# Recommendation Engine: Python

# Base Node image
FROM node:20-alpine AS node-base

WORKDIR /app

ENV NODE_ENV=production

RUN apk add --no-cache \
    libc6-compat \
    openssl

# BACKEND DEPENDENCIES
FROM node-base AS backend-deps

WORKDIR /app/backend

COPY backend/package*.json ./

RUN npm ci

# BACKEND BUILD
FROM backend-deps AS backend-builder

WORKDIR /app/backend

COPY backend/ ./

RUN npx prisma generate

RUN npm run build

# BACKEND PRODUCTION
FROM node-base AS backend

WORKDIR /app/backend

ENV NODE_ENV=production

COPY --from=backend-deps /app/backend/node_modules ./node_modules
COPY --from=backend-builder /app/backend/dist ./dist
COPY --from=backend-builder /app/backend/prisma ./prisma
COPY --from=backend-builder /app/backend/package*.json ./

EXPOSE 5000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]

# FRONTEND DEPENDENCIES
FROM node-base AS frontend-deps

WORKDIR /app/frontend

COPY frontend/package*.json ./

RUN npm ci

# FRONTEND BUILD
FROM frontend-deps AS frontend-builder

WORKDIR /app/frontend

COPY frontend/ ./

ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# FRONTEND PRODUCTION
FROM node-base AS frontend

WORKDIR /app/frontend

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=frontend-builder /app/frontend/public ./public
COPY --from=frontend-builder /app/frontend/.next ./.next
COPY --from=frontend-builder /app/frontend/node_modules ./node_modules
COPY --from=frontend-builder /app/frontend/package*.json ./
COPY --from=frontend-builder /app/frontend/next.config.* ./

EXPOSE 3000

CMD ["npm", "start"]

# RECOMMENDATION ENGINE
FROM python:3.12-slim AS recommendation-engine

WORKDIR /app/recommendation-engine

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY recommendation-engine/requirements.txt ./

RUN pip install --no-cache-dir -r requirements.txt

COPY recommendation-engine/ ./

EXPOSE 8000

CMD ["python", "main.py"]