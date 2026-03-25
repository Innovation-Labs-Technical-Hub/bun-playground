FROM oven/bun:1.3 AS base
WORKDIR /app

# Install dependencies
FROM base AS install
COPY package.json bun.lock* ./
COPY libs/shared-types/package.json ./libs/shared-types/
COPY libs/shared-utils/package.json ./libs/shared-utils/
COPY services/api-gateway/package.json ./services/api-gateway/
RUN cd services/api-gateway && bun install

# Production image
FROM oven/bun:1.3-slim AS runtime
WORKDIR /app

COPY --from=install /app/node_modules ./node_modules
COPY --from=install /app/services/api-gateway/node_modules ./services/api-gateway/node_modules
COPY libs/ ./libs/
COPY services/api-gateway/ ./services/api-gateway/

WORKDIR /app/services/api-gateway

ENV NODE_ENV=production
EXPOSE 3000

CMD ["bun", "run", "src/index.ts"]
