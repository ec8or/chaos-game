# Client Dockerfile
FROM node:20-alpine AS base
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@9

# Copy root package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./

# Copy all workspace packages needed for client
COPY packages ./packages
COPY apps/client ./apps/client

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build protocol package
WORKDIR /app/packages/protocol
RUN pnpm run build

# Build client with environment variables
WORKDIR /app/apps/client
ARG VITE_WS_URL
ENV VITE_WS_URL=${VITE_WS_URL}
RUN pnpm run build

# Production stage - serve with nginx
FROM nginx:alpine

# Copy built static files
COPY --from=base /app/apps/client/dist /usr/share/nginx/html

# Copy nginx config
COPY apps/client/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
