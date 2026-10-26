# Multi-stage production container for Selene on Google Cloud Run
# Optimized for Next.js 16 standalone output and sub-100MB footprint

# Stage 1: Dependency resolution
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Application compilation
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set production environment for Next.js standalone build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# Stage 3: Production runner (minimal, non-root user)
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

# Security: Run as dedicated non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 --home /home/nextjs nextjs

# Ensure home directory, /tmp/.selene, /tmp/data exist and are writable by nextjs
RUN mkdir -p /home/nextjs/.selene /tmp/.selene /tmp/data && chown -R nextjs:nodejs /home/nextjs /tmp/.selene /tmp/data

# Copy static assets and compiled standalone server
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 8080

CMD ["node", "server.js"]
