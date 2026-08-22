# GlobeTrotter — ARCHITECTURE.md

## 1. Architecture Decision
Start as a modular monolith, not a distributed microservice system.

```text
Browser / Next.js
        |
        | HTTPS REST
        v
Node.js + Express API
        |
        +--------------------+
        |                    |
        v                    v
PostgreSQL               Redis
(PostGIS, pgvector*)     cache/rate limit
        |
        +----------------------+
        |                      |
        v                      v
Catalog/Ingestion         Recommendation Engine
(background jobs)         (in-process MVP)
```

`pgvector` is optional until semantic retrieval is actually implemented.

## 2. Why Not a Recommendation Microservice Yet?
The first recommendation algorithm is deterministic filtering + weighted ranking. Creating FastAPI, a second deployment pipeline, service discovery, network retries and cross-service observability adds cost without proving user value.

Move recommendations into a Python/FastAPI service only when:
- you train/serve Python ML models;
- recommendation CPU workload must scale separately;
- a dedicated data-science pipeline owns the model;
- the contract is stable enough to justify a service boundary.

## 3. Frontend
- Next.js App Router
- TypeScript
- TanStack Query
- React Hook Form + Zod
- Tailwind CSS
- shadcn/ui
- Recharts
- date-fns

Server state: TanStack Query.
UI state: React state/context only where needed.
Do not introduce Redux unless a concrete cross-feature client-state problem appears.

## 4. Backend
- Node.js
- Express
- TypeScript
- Zod validation
- Prisma or Drizzle
- PostgreSQL
- Redis
- Pino logging
- Vitest/Jest + Supertest

## 5. Database
PostgreSQL is the canonical source of truth.

Logical domains:
```text
reference
identity
catalog
planning
finance
collaboration
ai
ingest
analytics
```

Important:
- PostGIS for geographic queries;
- pgvector later for semantic search;
- NUMERIC/DECIMAL for money;
- TIMESTAMPTZ + IANA timezone;
- sequence_no for ordering;
- FK-backed canonical catalog IDs.

## 6. Core Request Flow
Example: user adds an activity.

```text
Next.js UI
 -> POST /api/v1/trips/{id}/days/{dayId}/items
 -> Request validation
 -> Auth
 -> Ownership check
 -> Catalog item lookup
 -> Date/location/time validation
 -> Transaction
 -> PostgreSQL
 -> Response
 -> TanStack Query invalidates itinerary + budget
 -> UI refreshes
```

## 7. Recommendation Flow
```text
User clicks Recommend
        |
        v
POST /recommendations/generate
        |
        v
Load trip + city + preferences + budget
        |
        v
Candidate query from PostgreSQL
        |
        v
Eligibility filters
        |
        v
Feature normalization
        |
        v
Weighted score
        |
        v
Diversity re-rank
        |
        v
Persist recommendation rows
        |
        +--> Redis cache
        |
        v
Return top N + explanations
```

## 8. Data Ingestion Flow
Normal user search should not fan out to many provider APIs.

```text
External source
 -> scheduled/manual ingestion
 -> validate
 -> normalize
 -> deduplicate
 -> provenance record
 -> canonical PostgreSQL catalog
 -> search API
```

For MVP, use a legally reusable dataset and limit pilot cities.

## 9. Sharing Flow
```text
Owner requests share link
 -> generate random token
 -> store token hash
 -> return public URL

Visitor opens URL
 -> hash supplied token
 -> find non-revoked/non-expired share
 -> build read-only public DTO
```

## 10. Error Flow
Every request gets requestId.

```text
Known validation/business error
 -> mapped application error code
 -> expected HTTP status
 -> safe message

Unknown exception
 -> log stack with requestId
 -> return generic 500
```

No stack traces or SQL details reach client.

## 11. Deployment
MVP:
- Frontend: Vercel
- API: Render/Railway/Fly.io or similar
- PostgreSQL: managed Postgres
- Redis: managed Redis only if actually needed
- object storage: Cloudinary/S3-compatible for user uploads

Do not deploy Kubernetes for the MVP.

## 12. Future Split Boundaries
Potential future services:
- ingestion worker;
- recommendation/ML service;
- notifications;
- analytics pipeline.

Do not split auth/trips/budget merely for architectural appearance.
