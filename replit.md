# AI QA Copilot

AI-assisted quality engineering workspace that helps teams move from requirements to release confidence.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/ai-qa-copilot` — React + Vite product UI and route-level workspace screens.
- `artifacts/api-server/src/routes/qa.ts` — dashboard, project, requirement, scenario, test case, defect, and activity API routes.
- `lib/api-spec/openapi.yaml` — source of truth for the shared API contract.
- `lib/db/src/schema/qa.ts` — Drizzle schema for QA domain entities and synthetic demo seed data.
- `artifacts/ai-qa-copilot/src/index.css` — shared visual theme and light/dark tokens.

## Architecture decisions

- The first delivery uses generated OpenAPI hooks end-to-end so the frontend and API share request and response shapes.
- The Smart Home IoT Platform is the default synthetic demo project; demo records are seeded on first API access and remain editable through create flows.
- AI surfaces are explicitly labeled Demo Mode and do not claim live model output or verified QA evidence.
- QA artifacts are modeled as related relational entities instead of a single unstructured project document.

## Product

- Dashboard with release readout, execution trends, coverage, defects, and actionable recommendations.
- Workspace navigation for projects, requirements, test design, test cases, defects, coverage, reports, AI Copilot, integrations, settings, and activity.
- Create flows and filters for the core QA artifacts, with synthetic project data that demonstrates traceability.
- Responsive shell with light/dark-ready theme tokens and supporting authentication screens.

## User preferences

No additional preferences recorded.

## Gotchas

- API routes require the development database schema to be pushed before first access so demo seeding can run.
- After changing `lib/api-spec/openapi.yaml`, run `pnpm --filter @workspace/api-spec run codegen` before using updated hooks or Zod schemas.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
