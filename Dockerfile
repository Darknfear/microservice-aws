# Multi-stage Dockerfile for NestJS + Bun
# Builder stage: install deps and build TypeScript to JavaScript using Bun
FROM oven/bun:alpine AS builder

WORKDIR /app

# Copy lockfile and package manifest first for better caching
COPY package.json bun.lockb ./
COPY bunfig.toml tsconfig.json ./

# Install all dependencies (including dev) to allow build
RUN bun install

# Copy source files
COPY src ./src
COPY test ./test

# Build the project into ./dist (uses the script bun build ./src/main.ts --outdir ./dist --target bun)
RUN bun build ./src/main.ts --outdir ./dist --target bun

# Runner stage: smaller image with only production deps and built files
FROM oven/bun:alpine AS runner

WORKDIR /app

# Copy package files to install production dependencies
COPY package.json bun.lockb ./

# Install only production dependencies (faster, smaller)
RUN bun install --production

# Copy built output from builder
COPY --from=builder /app/dist ./dist

# Copy other runtime files if needed (e.g., public, config)
COPY public ./public

ENV NODE_ENV=production

# Expose default port (can be overridden with PORT env)
EXPOSE 3000

# Run the built bundle directly with Bun
CMD ["bun", "dist/main.js"]