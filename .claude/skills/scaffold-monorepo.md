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
- **Linting:** ESLint + typescript-eslint (flat config)
- **Testing:** bun:test + shared-testing helpers
- **ORM:** Prisma targeting PostgreSQL
- **IaC:** Terraform (AWS / GCP / Azure)
- **Containerization:** Docker Compose + Kubernetes (Kustomize)

## Monorepo Layout

```
project-root/
├── apps/                    # Frontend applications
│   ├── admin/               # Vue 3 + Pinia + Vue Router + TailwindCSS
│   └── ui/                  # React 19 + Radix UI + TailwindCSS
├── libs/                    # Shared libraries
│   ├── shared-types/        # TypeScript enums, interfaces, types
│   ├── shared-utils/        # Middleware, logger, clients, config
│   └── shared-testing/      # Test mocks, fixtures, assertion helpers
├── services/                # Backend microservices
│   ├── api-gateway/         # Bun.serve — routing, rate limiting, auth proxy
│   ├── auth-service/        # ElysiaJS — JWT, sessions, CASL authorization
│   ├── core-service/        # Hono — tenant management, configs, metadata
│   └── user-service/        # Bun.serve — user CRUD, Kafka events
├── infrastructure/
│   ├── docker/              # docker-compose.yml + configs
│   ├── k8s/                 # Kustomize base + dev/prod overlays
│   └── terraform/           # IaC for AWS, GCP, Azure
│       ├── modules/         # Reusable modules (networking, database, cache, messaging, container)
│       ├── aws/             # AWS deployment (ECS Fargate, RDS, ElastiCache, MSK)
│       ├── gcp/             # GCP deployment (Cloud Run, Cloud SQL, Memorystore)
│       └── azure/           # Azure deployment (Container Apps, Azure DB, Event Hubs)
├── eslint.config.ts         # ESLint flat config (TypeScript)
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
    ├── __tests__/           # Unit tests (bun:test)
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
    "lint": "eslint src/",
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
    ├── __tests__/           # Unit tests (bun:test)
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

### Terraform
Multi-cloud IaC under `infrastructure/terraform/`:

**Reusable modules** (`modules/`):
- `networking` — VPC/VNet, public/private subnets, security groups/NSGs
- `database` — PostgreSQL with auth_db + core_db databases
- `cache` — Redis with encryption in transit
- `messaging` — Kafka/event streaming
- `container` — Container service running the 4 microservices

**Cloud providers:**
| Cloud | Compute | Database | Cache | Messaging |
|-------|---------|----------|-------|-----------|
| `aws/` | ECS Fargate + ALB | RDS PostgreSQL 16 | ElastiCache Redis 7 | Amazon MSK |
| `gcp/` | Cloud Run | Cloud SQL PostgreSQL 16 | Memorystore Redis 7 | Managed Kafka |
| `azure/` | Container Apps | Azure DB for PostgreSQL Flexible | Azure Cache for Redis | Event Hubs |

Each provider dir has: `main.tf`, `variables.tf`, `outputs.tf`, `backend.tf`, `terraform.tfvars.example`

## ESLint

- Root `eslint.config.ts` — flat config using `@eslint/js` + `typescript-eslint`
- Key rules: `consistent-type-imports`, `no-unused-vars` (warn with `_` ignore), `no-explicit-any` (warn), `no-console` (warn, allow warn/error)
- Test files (`**/*.test.ts`) have relaxed rules (no-console off, no-explicit-any off)
- Ignores: `node_modules`, `dist`, `.turbo`, `prisma`, `infrastructure`
- Each workspace has `"lint": "eslint src/"` script
- Root has `"lint": "turbo lint"` and `"lint:root": "eslint ."`

## Testing

- **Framework:** `bun:test` (not Jest or Vitest)
- **Shared helpers:** `libs/shared-testing` package (`@bun-playground/shared-testing`)
- **Test location:** `src/__tests__/` within each workspace
- **Run all:** `make test` or `bun test --recursive`

### shared-testing Library (`libs/shared-testing`)

Provides reusable test infrastructure:

```
libs/shared-testing/src/
├── index.ts           # Barrel exports
├── mocks.ts           # createMockRequest, createMockResponse, createMockLogger
├── fixtures.ts        # createTestUser, createTestTenant, createTestSession, createTestServiceConfig
└── assertions.ts      # assertJsonResponse, assertErrorResponse, assertPaginatedResponse
```

**Usage in tests:**
```ts
import { createTestUser, assertJsonResponse } from "@bun-playground/shared-testing";
```

### Test Writing Conventions
- Use `describe`/`test` blocks, not `it`
- Use fixture factories from shared-testing for test data
- Use `randomUUIDv7()` or unique suffixes for data that touches persistent stores (avoid unique constraint collisions)
- Mock external services (Kafka, Redis) — don't require them running for unit tests
- Tests that need infrastructure (DB, Kafka) should be clearly marked as integration tests

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
2. Follow the service scaffolding pattern above (include `__tests__/` dir)
3. Add workspace dependency in package.json: `"shared-types": "workspace:*"`, `"shared-utils": "workspace:*"`
4. Add `"lint": "eslint src/"` and `"test": "bun test"` scripts
5. Add unit tests using `@bun-playground/shared-testing` fixtures
6. Add Dockerfile with multi-stage build
7. Add to `docker-compose.yml` with proper environment, depends_on, health checks
8. Add to Kubernetes base manifests
9. Add to Terraform container module service definitions
10. Update `ServiceName` enum in `libs/shared-types/src/enums/service-name.enum.ts`
11. Add route in API Gateway if client-facing
12. Update README.md architecture diagrams and project structure

## When Adding a New Frontend App

1. Create directory under `apps/<name>/`
2. Use Bun.serve() with HTML imports (NOT Vite)
3. Follow the frontend app pattern above (include `__tests__/` dir)
4. Add `"lint": "eslint src/"` and `"test": "bun test"` scripts
5. Add unit tests for utilities and component logic
6. Add to README.md
7. Add proxy route in API Gateway if needed

## Key Conventions
- Use `Bun.serve()` for HTTP servers, not Express
- Use `Bun.password` for hashing, not bcrypt
- Bun auto-loads `.env` — no dotenv needed
- Use `bun:sqlite` for SQLite, `Bun.sql` for Postgres (or Prisma)
- Use `Bun.file()` over `node:fs` readFile/writeFile
- All TypeScript, strict mode, ESNext target
- Prefer workspace packages for shared code
- Use `bun:test` for testing, not Jest or Vitest
- Use `@bun-playground/shared-testing` for test fixtures and assertions
- Every workspace must have `lint` and `test` scripts
- Place tests in `src/__tests__/*.test.ts`
- Use ESLint flat config (`eslint.config.ts`) — no `.eslintrc`
- Use `consistent-type-imports` (enforced by ESLint)
- Terraform modules are cloud-agnostic; provider-specific config goes in `aws/`, `gcp/`, `azure/`
