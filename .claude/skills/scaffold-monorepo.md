---
name: scaffold-monorepo
description: Generate and scaffold the entire Bun microservices monorepo structure including services, apps, shared libs, infrastructure, and configuration
user_invocable: true
---

# Scaffold Monorepo

You are a monorepo scaffolding specialist. When invoked, generate the full Bun-based microservices monorepo structure. Follow these conventions strictly.

## Runtime & Tooling

- **Runtime:** Bun (not Node.js)
- **Package Manager:** Bun workspaces
- **Build Orchestration:** Turborepo
- **ORM:** Prisma targeting PostgreSQL
- **Containerization:** Docker Compose + Kubernetes (Kustomize)

## Monorepo Layout

```
project-root/
├── apps/                    # Frontend applications
│   ├── admin/               # Vue 3 + Pinia + Vue Router + TailwindCSS
│   └── ui/                  # React 19 + Radix UI + TailwindCSS
├── libs/                    # Shared libraries
│   ├── shared-types/        # TypeScript enums, interfaces, types
│   └── shared-utils/        # Middleware, logger, clients, config
├── services/                # Backend microservices
│   ├── api-gateway/         # Bun.serve — routing, rate limiting, auth proxy
│   ├── auth-service/        # ElysiaJS — JWT, sessions, CASL authorization
│   ├── core-service/        # Hono — tenant management, configs, metadata
│   └── user-service/        # Bun.serve — user CRUD, Kafka events
├── infrastructure/
│   ├── docker/              # docker-compose.yml + configs
│   └── k8s/                 # Kustomize base + dev/prod overlays
├── package.json             # Root workspace config
├── turbo.json               # Task pipeline
├── tsconfig.json            # Root TypeScript config
├── Makefile                 # Developer commands
├── .env.example             # Environment variable template
├── .gitignore
└── README.md                # Architecture docs with Mermaid diagrams
```

## Service Scaffolding Pattern

Each service under `services/` follows this structure:

```
services/<service-name>/
├── package.json
├── tsconfig.json
├── Dockerfile               # Multi-stage: base → install → generate (if Prisma) → runtime
├── prisma/                  # Only for services using Prisma
│   └── schema.prisma
└── src/
    ├── index.ts             # Entry point
    ├── app.ts               # Framework app setup
    ├── config.ts            # Environment config
    ├── prisma.ts            # Prisma client singleton (if applicable)
    ├── routes/              # Route definitions
    ├── handlers/            # Request handlers
    ├── services/            # Business logic
    ├── repositories/        # Data access layer
    ├── middleware/           # Custom middleware
    ├── models/              # Request/response types
    └── utils/               # Helpers
```

### Service package.json scripts:
```json
{
  "scripts": {
    "dev": "bun --hot src/index.ts",
    "start": "NODE_ENV=production bun src/index.ts",
    "build": "bun build src/index.ts --outdir dist --target bun",
    "test": "bun test",
    "db:generate": "bunx prisma generate",
    "db:migrate": "bunx prisma migrate dev",
    "db:push": "bunx prisma db push"
  }
}
```

## Frontend App Pattern

Each app under `apps/` follows:

```
apps/<app-name>/
├── package.json
├── tsconfig.json
├── bun-env.d.ts
└── src/
    ├── index.ts             # Bun.serve entry point with HTML import
    ├── index.html           # HTML entry (imports main.ts)
    ├── index.css            # TailwindCSS entry
    ├── main.ts              # App bootstrap
    ├── App.vue|tsx          # Root component
    ├── router/              # Client-side routing
    ├── stores/              # State management (Pinia/Zustand)
    ├── views/               # Page components
    ├── components/
    │   ├── layout/          # App shell (sidebar, header, breadcrumb)
    │   ├── common/          # Reusable UI components
    │   └── <feature>/       # Feature-specific components
    ├── composables|hooks/   # Reusable logic
    ├── types/               # TypeScript interfaces
    └── utils/               # Formatting, API client, helpers
```

## Infrastructure

### Docker Compose Services
- **PostgreSQL 16** — with init script for multiple databases
- **Redis 7.4** — caching and sessions
- **Kafka 3.9** — event streaming
- **OpenTelemetry Collector** — telemetry pipeline
- **Loki** — log aggregation
- **Tempo** — distributed tracing
- **Grafana** — dashboards and visualization

### Kubernetes
- Kustomize base with namespace, deployments, services, configmaps, HPAs
- Dev overlay: 1 replica, debug logging
- Prod overlay: 3 replicas, increased resources

## Port Assignments
| Service | Port |
|---------|------|
| API Gateway | 3000 |
| User Service | 3001 |
| Auth Service | 3002 |
| Core Service | 3003 |
| Admin App | 3010 |
| React UI | 3005 |
| PostgreSQL | 5432 |
| Redis | 6379 |
| Kafka | 9094 |
| Grafana | 3030 |

## When Adding a New Service

1. Create directory under `services/<name>/`
2. Follow the service scaffolding pattern above
3. Add workspace dependency in package.json: `"shared-types": "workspace:*"`
4. Add Dockerfile with multi-stage build
5. Add to `docker-compose.yml` with proper environment, depends_on, health checks
6. Add to Kubernetes base manifests
7. Update `ServiceName` enum in `libs/shared-types/src/enums/service-name.enum.ts`
8. Add route in API Gateway if client-facing
9. Update README.md architecture diagrams

## When Adding a New Frontend App

1. Create directory under `apps/<name>/`
2. Use Bun.serve() with HTML imports (NOT Vite)
3. Follow the frontend app pattern above
4. Add to README.md
5. Add proxy route in API Gateway if needed

## Key Conventions
- Use `Bun.serve()` for HTTP servers, not Express
- Use `Bun.password` for hashing, not bcrypt
- Bun auto-loads `.env` — no dotenv needed
- Use `bun:sqlite` for SQLite, `Bun.sql` for Postgres (or Prisma)
- Use `Bun.file()` over `node:fs` readFile/writeFile
- All TypeScript, strict mode, ESNext target
- Prefer workspace packages for shared code
