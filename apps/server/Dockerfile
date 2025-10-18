# Server Dockerfile
FROM oven/bun:1 AS base
WORKDIR /app

# Copy root package files (with workspaces field)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./

# Copy all workspace packages
COPY packages ./packages
COPY apps/server ./apps/server

# Install dependencies - Bun will now link workspace packages
RUN bun install --no-save

# Build protocol package
WORKDIR /app/packages/protocol
RUN bun run build

# Build server
WORKDIR /app/apps/server
RUN bun run build

# Production stage
FROM oven/bun:1-slim
WORKDIR /app

# Copy built files and dependencies
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/packages/protocol/dist ./packages/protocol/dist
COPY --from=base /app/packages/protocol/package.json ./packages/protocol/package.json
COPY --from=base /app/apps/server/dist ./apps/server/dist
COPY --from=base /app/apps/server/package.json ./apps/server/package.json
COPY --from=base /app/apps/server/src/lists ./apps/server/src/lists

# Set working directory to server
WORKDIR /app/apps/server

EXPOSE 8080

CMD ["bun", "run", "start"]
