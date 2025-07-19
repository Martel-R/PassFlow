# Dockerfile for Next.js application

# Stage 1: Install dependencies
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package.json and yarn.lock
COPY package.json yarn.lock* ./
# If you have a pnpm-lock.yaml, copy it as well
# COPY pnpm-lock.yaml ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Stage 2: Build the application
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Environment variables for the build
# ENV NEXT_TELEMETRY_DISABLED 1

RUN yarn build

# Stage 3: Production image
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nextjs

EXPOSE 3000

ENV PORT 3000

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following lines in case you want to disable telemetry.
# ENV NEXT_TELEMETRY_DISABLED 1

CMD ["yarn", "start"]
