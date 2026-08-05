# Copilot Instructions for LeaseTracker

## Build, test, and lint commands
- Install dependencies: `npm install`
- Start dev server: `npm run dev`
- Build production bundle: `npm run build`
- Start production server: `npm run start`
- Lint: `npm run lint`
- Lint with autofix: `npm run lint:fix`
- Type check: `npm run typecheck`
- Run all tests: `npm test`
- Run a single test file: `npx jest src/utils/__tests__/agreementUtils.test.ts`
- Run a single test by name: `npx jest -t "test name fragment"`

## High-level architecture
- App uses Next.js App Router with locale-based routing under `src/app/[locale]` and API routes under `src/app/api`.
- `src/middleware.ts` composes `next-intl` routing with `next-auth` protection:
  - Public pages and API/public patterns go through i18n middleware only.
  - Protected pages go through `withAuth`.
  - Admin routes are role-gated (`token.role === "ADMIN"`).
- Internationalization:
  - Locales are defined in `src/i18n/settings.ts` (`es`, `en`, default `es`).
  - `next-intl` plugin is wired in `next.config.ts` via `createNextIntlPlugin("./src/i18n/index.ts")`.
  - Locale layouts load messages server-side and wrap children in `NextIntlClientProvider` (`src/app/[locale]/layout.tsx`).
- Authentication:
  - NextAuth credentials provider is implemented in `src/app/api/auth/[...nextauth]/route.ts`.
  - Prisma adapter + JWT session strategy.
  - Role is persisted into JWT/session and used by middleware and server pages.
- Data layer:
  - PostgreSQL + Prisma schema at `src/prisma/schema.prisma`.
  - Core domain includes users/roles, landlords/tenants, properties/units, leases, payments, vouchers, tickets, documents, clauses/rules.
  - Prisma client singleton pattern is used in both `src/lib/prisma.ts` and `src/utils/db.ts`; API routes import one of these aliases.
- Server/client flow pattern:
  - Server pages often read session and fetch API endpoints using `process.env.NEXT_PUBLIC_API_URL` + forwarded cookies (example: dashboard page).
  - API routes shape and serialize Prisma Decimal/date values before JSON responses.
- Lease lifecycle flow:
  - Multi-step lease creation UI in `src/app/[locale]/leases/new/NewLeaseClient.tsx` (details → rules/clauses → preview/upload).
  - `POST /api/leases` handles optional tenant creation, tokenized registration, lease creation, optional PDF upload to Cloudflare R2, rule/clause linking, and activation logic.
  - Email notifications are sent via SendGrid helpers in `src/utils/leaseUtils.ts`.
- Dashboard flow:
  - Landlord/admin dashboard metrics from `GET /api/dashboard` (aggregates + grouped metrics).
  - Tenant dashboard from `GET /api/dashboard/tenant` (lease details, paid/upcoming payments, tickets, documents).

## Key conventions in this codebase
- Use `@/*` path aliases (configured in `tsconfig.json`) instead of deep relative imports.
- Keep locale parity: when adding translation keys, update both `src/i18n/messages/es.json` and `src/i18n/messages/en.json`.
- Validation uses Zod schemas (see `src/lib/validations/*` and lease form schema in `NewLeaseClient`).
- React forms commonly use `react-hook-form` with `FormProvider` and step-specific validation gates.
- API routes generally:
  - Use Prisma includes/selects to return already-shaped nested data.
  - Convert Prisma Decimal values to numbers before returning JSON.
  - Return `NextResponse.json({ error: ... }, { status })` on failures.
- Role-aware behavior is expected across middleware, server pages, and API filters (`ADMIN`, `LANDLORD`, `TENANT`).
- Lease rules/clauses are modeled as ordered many-to-many links via junction tables (`LeasesToRules`, `LeasesToClauses`) and should preserve explicit `order`.
- Styling is Tailwind-first, with reusable UI primitives under `src/components/ui`.
