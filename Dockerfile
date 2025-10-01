# syntax=docker/dockerfile:1.7

# ---------- Base ----------
FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

# ---------- Deps (install with frozen lockfile) ----------
FROM base AS deps
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
RUN npm ci

# ---------- Build ----------
FROM base AS build
ENV NEXT_TELEMETRY_DISABLED=1
# Provide a safe default so NextAuth doesn't fail during build
ENV NEXTAUTH_SECRET=dev_docker_build_secret
RUN apk add --no-cache libc6-compat
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---------- Runtime ----------
FROM node:20-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app

# Non-root user
RUN addgroup -S nextjs && adduser -S nextjs -G nextjs

# Copy standalone server
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public

ENV PORT=3000
ENV HOSTNAME=0.0.0.0
EXPOSE 3000
USER nextjs

CMD ["node", "server.js"]
