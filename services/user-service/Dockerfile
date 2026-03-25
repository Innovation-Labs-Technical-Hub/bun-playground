FROM oven/bun:1.3 AS base
WORKDIR /app

# Install dependencies
FROM base AS install
COPY package.json bun.lock* ./
COPY libs/shared-types/package.json ./libs/shared-types/
COPY libs/shared-utils/package.json ./libs/shared-utils/
COPY services/user-service/package.json ./services/user-service/
RUN cd services/user-service && bun install

# Production image
FROM oven/bun:1.3-slim AS runtime
WORKDIR /app

COPY --from=install /app/node_modules ./node_modules
COPY --from=install /app/services/user-service/node_modules ./services/user-service/node_modules
COPY libs/ ./libs/
COPY services/user-service/ ./services/user-service/

WORKDIR /app/services/user-service

ENV NODE_ENV=production
EXPOSE 3001

CMD ["bun", "run", "src/index.ts"]
