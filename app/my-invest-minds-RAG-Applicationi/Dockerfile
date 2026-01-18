# =========================
# Builder stage
# =========================
FROM node:20-slim AS builder

WORKDIR /app

# Limit memory to 1GB to prevent OOM on 2GB machines
ENV NODE_OPTIONS="--max-old-space-size=1024"
ENV NEXT_TELEMETRY_DISABLED=1
ENV PRISMA_SKIP_POSTINSTALL_GENERATE=true

# Install system dependencies
RUN apt-get update -y && apt-get install -y openssl ca-certificates

COPY package.json package-lock.json ./
COPY prisma ./prisma

# FIX: Removed '--omit=dev' so build tools (Tailwind, TS) are installed
RUN npm install --no-audit --no-fund

COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build Next.js
RUN npm run build

# =========================
# Runtime stage
# =========================
FROM node:20-slim

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl ca-certificates

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy the built application from the builder stage
COPY --from=builder /app ./

EXPOSE 3000

CMD ["npm", "run", "start"]