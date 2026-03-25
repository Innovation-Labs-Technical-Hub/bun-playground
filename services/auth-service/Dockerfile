FROM oven/bun:1.3 AS base
WORKDIR /app

# Install dependencies
FROM base AS install
COPY package.json bun.lock* ./
COPY libs/shared-types/package.json ./libs/shared-types/
COPY libs/shared-utils/package.json ./libs/shared-utils/
COPY services/auth-service/package.json ./services/auth-service/
RUN cd services/auth-service && bun install

# Generate Prisma client
FROM base AS generate
COPY --from=install /app/node_modules ./node_modules
COPY --from=install /app/services/auth-service/node_modules ./services/auth-service/node_modules
COPY services/auth-service/prisma ./services/auth-service/prisma
RUN cd services/auth-service && bunx prisma generate

# Production image
FROM oven/bun:1.3-slim AS runtime
WORKDIR /app

COPY --from=generate /app/node_modules ./node_modules
COPY --from=generate /app/services/auth-service/node_modules ./services/auth-service/node_modules
COPY libs/ ./libs/
COPY services/auth-service/ ./services/auth-service/

WORKDIR /app/services/auth-service

ENV NODE_ENV=production
EXPOSE 3002

CMD ["bun", "run", "src/index.ts"]
