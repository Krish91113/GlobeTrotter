# GlobeTrotter — PRD / Functional Requirements Document

## 1. Document Purpose
This document defines the product scope and functional requirements for GlobeTrotter, including frontend behavior, backend responsibilities, validation, API expectations, recommendation behavior, permissions, error states, and acceptance criteria.

## 2. Product Summary
GlobeTrotter is a responsive travel-planning application where authenticated users can:
- create customized multi-city trips;
- add cities/stops with arrival and departure dates;
- discover cities and activities from database-backed catalog data;
- build a day-wise itinerary;
- track a total trip budget and expense estimates;
- receive budget-aware activity recommendations;
- view the itinerary in list/calendar/timeline forms;
- share a read-only public itinerary;
- copy a public itinerary into their own account;
- edit profile and travel preferences;
- optionally access admin analytics if authorized.

The database is the source of truth. Canonical travel data must not be hardcoded into frontend source files.

---

# PART A — PRODUCT REQUIREMENTS

## 3. Goals
1. Make multi-city trip creation simple enough for a first-time user.
2. Keep itinerary, activity discovery, cost estimates, and recommendations in one workflow.
3. Prevent over-budget or impossible schedules through validation.
4. Keep recommendations explainable and grounded in real catalog records.
5. Support a hackathon-friendly MVP that can later evolve without a database redesign.

## 4. Non-Goals for MVP
The MVP will NOT attempt to:
- become a flight/hotel booking engine;
- guarantee real-time ticket inventory;
- optimize worldwide transport routes;
- provide production-grade collaborative live editing;
- train a custom ML model;
- scrape protected provider data;
- support thousands of activities per every global city on day one;
- run Kubernetes.

## 5. User Roles
### 5.1 Traveler
Can manage own profile, preferences, trips, itinerary, budget, recommendations, and public share links.

### 5.2 Public Visitor
Can view a valid public itinerary and, after authentication, copy it.

### 5.3 Admin — Optional / Phase 2
Can view aggregate analytics and manage catalog/configuration depending on authorization.

---

# PART B — FRONTEND FRD

## 6. Frontend Technical Baseline
- Framework: Next.js (App Router)
- Language: TypeScript
- Server-state: TanStack Query
- Forms: React Hook Form
- Validation: Zod
- UI: Tailwind CSS + shadcn/ui or a similarly accessible component layer
- Icons: Lucide
- Charts: Recharts
- Date handling: date-fns
- Maps: defer to MVP+ unless required; MapLibre is preferred for an open stack
- Authentication: secure cookie-based session/access token flow; avoid storing long-lived auth tokens in localStorage
- API access: typed API client module; no direct fetch calls spread across UI components

## 7. Frontend Information Architecture
Suggested route structure:

```text
/
├── /login
├── /signup
├── /forgot-password
├── /dashboard
├── /trips
├── /trips/new
├── /trips/[tripId]
│   ├── /builder
│   ├── /itinerary
│   ├── /budget
│   └── /timeline
├── /discover/cities
├── /discover/activities
├── /profile
├── /shared/[shareToken]
└── /admin                 # optional
```

Authenticated application shell:
- top navigation / app header;
- desktop sidebar;
- responsive mobile navigation;
- global search entry;
- user profile menu;
- create-trip CTA;
- global toast/notification area.

## 8. Screen-by-Screen Requirements

### FR-FE-01 — Login
**Purpose:** authenticate an existing user.

**UI**
- email;
- password;
- show/hide password;
- login button;
- forgot-password link;
- signup link.

**Validation**
- required email;
- valid email format;
- password required;
- submit disabled while request is pending;
- API error rendered near form and through accessible alert.

**States**
- idle;
- submitting;
- invalid credentials;
- server unavailable;
- success redirect.

**Acceptance**
- successful authentication redirects to `/dashboard`;
- already authenticated user visiting `/login` is redirected to dashboard.

### FR-FE-02 — Signup
Fields:
- display name;
- email;
- password;
- confirm password;
- accept terms.

Validation:
- name 2–80 characters;
- normalized email;
- minimum password policy enforced by backend and mirrored in UI;
- password confirmation must match.

### FR-FE-03 — Dashboard / Main Landing
Based on the supplied wireframe, the home screen should contain:
- prominent travel banner/hero;
- search;
- top/recommended destinations;
- previous/recent trips;
- budget highlight;
- “Plan a Trip” CTA.

Recommended production UI:
- hero title: “Where are you going next?”;
- cards with real images from catalog media;
- upcoming trip card with next stop/date;
- recommendation strip;
- quick stats: upcoming trips, planned cities, estimated remaining budget;
- skeleton loaders rather than blank cards.

TanStack Query:
- `useDashboardSummary()`
- `useRecommendedDestinations()`
- `useRecentTrips()`

### FR-FE-04 — Create Trip
The wireframe asks for start date, place and end date; the source specification additionally describes trip name, description and optional cover image. The implementation should combine these safely.

Fields:
- trip name;
- description optional;
- overall start date;
- overall end date;
- default currency;
- cover image optional;
- optional first city;
- total budget optional at creation.

Validation:
- trip name 2–120 characters;
- start date <= end date;
- trip duration maximum configurable by backend;
- budget >= 0;
- currency must be a valid reference currency ID;
- uploaded image type and size must be validated.

On success:
1. create trip;
2. navigate to `/trips/{id}/builder`.

### FR-FE-05 — My Trips
Sections can visually match the wireframe:
- Ongoing;
- Upcoming;
- Completed.

Trip card:
- cover;
- trip name;
- date range;
- city count;
- budget status;
- view;
- edit;
- delete menu.

Requirements:
- pagination or cursor loading;
- search by trip name;
- filter by status;
- sort by nearest date / newest / oldest;
- delete requires confirmation;
- optimistic UI only where safe.

### FR-FE-06 — Itinerary Builder
This is the product’s main working screen.

Layout:
- left: trip stops/day navigator;
- center: current day itinerary;
- right drawer/panel: activity discovery and recommendations.

Functions:
- add city stop;
- edit stop dates;
- remove stop;
- reorder stops;
- create/derive days from trip dates;
- add activity from catalog;
- select planned start time;
- change duration;
- reorder activities;
- remove activity;
- view estimated cost;
- request recommendations;
- accept/reject a recommendation.

Validation:
- stop arrival <= departure;
- stop dates inside trip dates;
- overlapping stops allowed only if business rule explicitly supports it; MVP should reject overlap;
- itinerary item must belong to a trip day;
- planned start < planned end;
- warn on time overlap;
- warn if activity is likely unavailable;
- warn if daily budget is exceeded.

### FR-FE-07 — Itinerary View
Read-focused review screen:
- city grouping;
- day grouping;
- activity blocks;
- planned start/end;
- duration;
- estimated cost;
- list/calendar toggle.

Do not make this the main editing surface. Editing should route users to the builder.

### FR-FE-08 — City Search
UI:
- search input with debounce;
- country/region filters;
- popular/recommended sorting;
- result cards with country, summary, cost indicator, image;
- Add to Trip action.

Data rule:
- city names and catalog data come from API/database only.

Query key example:
`["locations", "search", normalizedFilters]`

### FR-FE-09 — Activity Search
UI:
- city selector;
- text search;
- category;
- price range;
- duration;
- rating;
- best time / availability if supported;
- cards/list;
- quick details drawer;
- Add to Itinerary;
- Save/Favorite optional.

Each activity card should show:
- name;
- city;
- image;
- category;
- rating;
- estimated price;
- duration;
- short explanation;
- source/freshness indicator when important.

### FR-FE-10 — Recommendation Panel
Inputs are derived from the current trip:
- trip ID;
- selected cities;
- selected activities;
- budget;
- spend;
- preferences;
- pace.

Recommendation card:
- rank;
- activity;
- category;
- estimated cost;
- duration;
- best time;
- confidence;
- reason;
- budget-fit label;
- available/best date;
- rating;
- Add button;
- Not interested button.

Important:
- confidence is a system score, not a fake probability;
- recommendations must reference canonical activity IDs;
- frontend must not invent or modify recommendation scores.

### FR-FE-11 — Trip Budget & Cost Breakdown
UI:
- total budget;
- estimated spend;
- actual spend if supported;
- remaining amount;
- average/day;
- category breakdown;
- per-day breakdown;
- over-budget alerts.

Charts:
- donut: category allocation;
- bar: daily estimate;
- progress: spent vs target.

Money:
- always display currency;
- use locale-aware formatting;
- never assume INR/USD.

### FR-FE-12 — Calendar / Timeline
- month/day calendar;
- vertical timeline alternative;
- expandable days;
- itinerary item time;
- cost;
- drag reorder if desktop;
- accessible move-up/move-down fallback for keyboard/mobile.

### FR-FE-13 — Public Itinerary
Read-only:
- trip summary;
- cities/stops;
- days;
- activities;
- budget summary only if trip owner allows it;
- Copy Trip CTA;
- social share through URL.

Must not expose:
- private notes;
- email;
- internal user ID;
- private expenses;
- secret share-token storage values.

### FR-FE-14 — Profile / Settings
- display name;
- photo;
- email;
- locale;
- preferred currency;
- pace;
- comfort level;
- preferred activity categories;
- saved destinations;
- delete account.

### FR-FE-15 — Admin Analytics — Optional
- registered users;
- trips created;
- top cities;
- top activities;
- recommendation acceptance;
- search-to-add conversion;
- budget usage trends.

---

## 9. Frontend Component Boundaries
Suggested feature-first structure:

```text
src/
  app/
  features/
    auth/
    dashboard/
    trips/
    itinerary/
    locations/
    activities/
    recommendations/
    budgets/
    sharing/
    profile/
  components/
    ui/
    layout/
  lib/
    api/
    auth/
    query/
    validation/
    utils/
  hooks/
  types/
```

Rules:
- UI primitives do not fetch data.
- Page components orchestrate feature components.
- API DTOs are mapped into view models when needed.
- Query/mutation hooks stay inside the owning feature.
- Do not put every state in global state.
- TanStack Query owns server state.
- Local component state owns temporary UI state.
- URL search params own shareable filter state.

## 10. TanStack Query Requirements
Defaults:
- configure global QueryClient once;
- use stable query keys;
- use `enabled` for dependency-driven requests;
- invalidate the smallest necessary key after mutation;
- use optimistic updates only for reversible/simple actions;
- retry transient GET errors with bounded retries;
- do not retry validation/auth errors blindly.

Example query key families:
```text
["auth", "me"]
["dashboard", "summary"]
["trips", filters]
["trip", tripId]
["trip", tripId, "days"]
["trip", tripId, "budget"]
["locations", "search", filters]
["activities", cityId, filters]
["recommendations", tripId, inputHash]
["publicTrip", shareToken]
```

## 11. Frontend Validation Requirements
Use Zod schemas shared by forms and request construction.

Examples:
- trim user strings;
- strict date parsing;
- no NaN money values;
- allowed file MIME type;
- file size;
- enum/reference IDs must come from backend-provided options;
- prevent double submission;
- max query string length;
- pagination bounds.

Frontend validation improves UX; backend remains authoritative.

## 12. Accessibility
Minimum:
- WCAG-aware contrast;
- keyboard navigability;
- visible focus states;
- semantic buttons/links;
- input labels;
- aria-live for validation/API errors;
- no drag-only action;
- skeletons should not trap screen readers.

---

# PART C — BACKEND FRD

## 13. Recommended Backend Approach
For this project, use a modular monolith first.

Core:
- Node.js + Express + TypeScript;
- PostgreSQL;
- Prisma or Drizzle ORM;
- Redis for cache/rate-limit/session/recommendation cache where helpful;
- background worker only when ingestion or heavy jobs require it.

Do NOT start with a Python microservice solely because the recommendation prompt says “microservice.” The initial weighted ranking algorithm is normal application logic. Introduce FastAPI later only if Python ML tooling becomes materially useful.

## 14. Backend Modules
```text
auth
users
preferences
locations
catalog
trips
itinerary
budgets
recommendations
sharing
analytics
ingestion
admin
```

Each module owns:
- routes/controller;
- validation schema;
- service/business logic;
- repository/data access;
- tests.

## 15. API Conventions
Base:
`/api/v1`

Success envelope:
```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

Error envelope:
```json
{
  "success": false,
  "error": {
    "code": "TRIP_DATE_INVALID",
    "message": "Start date must be before or equal to end date",
    "fieldErrors": {}
  },
  "requestId": "..."
}
```

HTTP behavior:
- 200 GET/update success;
- 201 resource created;
- 204 delete success where response body unnecessary;
- 400 malformed request;
- 401 unauthenticated;
- 403 unauthorized;
- 404 resource missing;
- 409 conflict / stale revision / duplicate;
- 422 business validation if adopted consistently;
- 429 rate limit;
- 500 unexpected server error.

## 16. Authentication
Required endpoints:
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `POST /auth/refresh` if token model requires it
- `GET /auth/me`
- forgot/reset password flow if included in MVP

Rules:
- Argon2id or bcrypt password hashing;
- passwords never logged;
- auth throttling;
- secure HTTP-only cookies preferred for browser client;
- CSRF protection where cookie model requires it;
- rotate/revoke refresh credentials;
- audit suspicious failures.

## 17. User / Preference APIs
- `GET /users/me`
- `PATCH /users/me`
- `DELETE /users/me`
- `GET /users/me/preferences`
- `PUT /users/me/preferences`
- `GET /reference/preferences`
- `GET /reference/currencies`
- `GET /reference/categories`

## 18. Location & Catalog APIs
- `GET /locations/search?q=&country=&region=&cursor=`
- `GET /locations/:id`
- `GET /catalog/items?locationId=&categoryId=&minCost=&maxCost=&durationMax=&ratingMin=`
- `GET /catalog/items/:id`
- `GET /catalog/items/nearby?lat=&lng=&radius=`

Requirements:
- indexed search;
- PostGIS when proximity is implemented;
- pagination;
- explicit max limits;
- DB-backed source;
- no provider call in every normal user request.

## 19. Trip APIs
- `POST /trips`
- `GET /trips`
- `GET /trips/:tripId`
- `PATCH /trips/:tripId`
- `DELETE /trips/:tripId`

Create trip transaction should create, as required:
- trip;
- initial budget;
- optionally initial stop/days.

Authorization:
- owner or authorized trip member only.

## 20. Trip Stop APIs
- `POST /trips/:tripId/stops`
- `PATCH /trips/:tripId/stops/:stopId`
- `DELETE /trips/:tripId/stops/:stopId`
- `PUT /trips/:tripId/stops/reorder`

Rules:
- location exists;
- dates inside overall trip;
- arrival <= departure;
- unique sequence per trip;
- repeated cities allowed;
- overlapping dates follow configured MVP rule.

## 21. Trip Day APIs
- `GET /trips/:tripId/days`
- optional manual day mutation only if product needs it.

Prefer deriving/maintaining days transactionally when trip dates/stops change.

## 22. Itinerary Item APIs
- `POST /trips/:tripId/days/:dayId/items`
- `PATCH /trips/:tripId/days/:dayId/items/:itemId`
- `DELETE /trips/:tripId/days/:dayId/items/:itemId`
- `PUT /trips/:tripId/days/:dayId/items/reorder`

Validation:
- real catalog item ID;
- item location compatible with stop/day;
- planned start < end;
- nonnegative estimated cost;
- detect overlaps and return warning/error by policy;
- preserve transactional ordering.

## 23. Budget APIs
- `GET /trips/:tripId/budget`
- `PUT /trips/:tripId/budget`
- `GET /trips/:tripId/budget/summary`
- `POST /trips/:tripId/expenses`
- `PATCH /trips/:tripId/expenses/:expenseId`
- `DELETE /trips/:tripId/expenses/:expenseId`

Money requirements:
- Decimal/NUMERIC in DB;
- API returns decimal as string or a lossless money DTO;
- currency always explicit;
- exchange-rate source/freshness recorded if conversion occurs.

## 24. Recommendation API
MVP endpoint:
`POST /recommendations/generate`

Preferred request:
```json
{
  "tripId": "uuid",
  "cityId": "uuid",
  "date": "YYYY-MM-DD",
  "limit": 8
}
```

Why smaller than the original prompt:
The backend already owns the trip, selected activities, budget and preferences. The browser should not be trusted to resend authoritative spend/history.

Backend gathers:
- trip dates/stops;
- selected itinerary items;
- user preferences;
- budget summary;
- candidate activities.

Response:
```json
{
  "recommendations": [
    {
      "recommendationId": "uuid",
      "rank": 1,
      "activityId": "uuid",
      "activityName": "string",
      "category": "string",
      "city": "string",
      "estimatedCost": "120.00",
      "currency": "EUR",
      "durationMinutes": 120,
      "bestTime": "afternoon",
      "score": 0.92,
      "reason": "Matches your food preference and stays within today's target.",
      "fitsBudget": true,
      "bestDate": "2026-10-20",
      "rating": 4.7
    }
  ],
  "insights": {
    "budgetStatus": "on_track",
    "remainingBudget": "800.00",
    "currency": "EUR",
    "recommendedDailySpend": "160.00"
  }
}
```

### 24.1 MVP Recommendation Pipeline
1. Load canonical candidates for current city.
2. Exclude already-selected items.
3. Exclude unavailable/incompatible items where data exists.
4. Filter obviously impossible budget candidates.
5. Normalize score inputs to 0–1.
6. Compute score.
7. Apply diversity penalty.
8. Return top N plus alternatives.
9. Save recommendation rows for feedback analytics.
10. Cache by a hash of trip revision + city + preference revision + ranking policy.

### 24.2 Scoring
Initial requested scoring model:
- category match: 0.30
- budget fit: 0.25
- user rating: 0.20
- city popularity: 0.15
- diversity: 0.10

Production requirement:
weights should eventually live in a ranking-policy table/configuration rather than being scattered in source code.

### 24.3 Feedback
- `POST /recommendations/:id/feedback`

Actions:
- viewed;
- added;
- rejected;
- removed;
- completed;
- rated.

## 25. Sharing APIs
- `POST /trips/:tripId/share-links`
- `DELETE /trips/:tripId/share-links/:shareId`
- `GET /public/trips/:token`
- `POST /public/trips/:token/copy`

Security:
- high-entropy random token;
- store hash server-side;
- optional expiration;
- revocation;
- no sequential IDs exposed as the public secret.

## 26. Admin APIs — Optional
- `GET /admin/analytics/summary`
- `GET /admin/analytics/top-locations`
- `GET /admin/analytics/top-activities`
- `GET /admin/users`

RBAC required.

---

## 27. Database Rules
The supplied design is PostgreSQL-first and should remain so.

Key entities:
- users/auth identities/preferences;
- locations and aliases;
- catalog items;
- places/experiences;
- categories/tags/media/opening hours/prices;
- trips;
- trip stops;
- trip days;
- itinerary items;
- budgets;
- budget allocations;
- expenses;
- share links;
- recommendations;
- recommendation feedback;
- analytics events.

Critical invariants:
- trip.start_date <= trip.end_date;
- stop.arrival_date <= stop.departure_date;
- trip day date inside trip range;
- itinerary start < end;
- sequence unique within parent;
- money >= 0;
- coordinates valid.

## 28. Backend Validation Layers
1. request schema validation;
2. authentication;
3. authorization/ownership;
4. existence checks;
5. business-rule validation;
6. DB constraints;
7. transaction;
8. response serialization.

Never rely on frontend validation alone.

## 29. Security Requirements
- OWASP-oriented input validation;
- parameterized SQL/ORM;
- least privilege DB user;
- CORS allowlist;
- Helmet/security headers;
- rate limiting;
- secret manager/environment variables;
- request IDs;
- sanitized logs;
- image upload validation;
- content-size limits;
- authorization on every user-owned resource;
- public endpoints must expose DTOs, not raw database models.

## 30. Performance
MVP targets:
- p95 normal API request < 500 ms where feasible;
- cached catalog/search path much faster;
- recommendation p95 target < 500 ms for a moderate candidate pool;
- cursor pagination for large collections;
- avoid N+1 queries;
- select only required columns;
- Redis optional on day one, useful for recommendation/search cache.

## 31. Observability
- structured logs;
- request ID;
- response latency;
- error rate;
- DB query timing for slow requests;
- recommendation generation time;
- cache hit rate;
- ingestion failures;
- basic uptime endpoint.

Endpoints:
- `GET /health/live`
- `GET /health/ready`

## 32. Testing
### Frontend
- unit tests for validation/mappers;
- component tests for critical forms;
- integration tests with mocked API;
- E2E happy paths with Playwright.

### Backend
- unit tests for recommendation scoring;
- service tests for date/budget business rules;
- API integration tests against test PostgreSQL;
- authorization tests;
- transaction rollback tests;
- edge-case tests for budget/date/timezone.

## 33. MVP Acceptance Flow
A fresh user must be able to:
1. create account;
2. login;
3. create trip;
4. add at least two city stops;
5. search real DB-backed activities;
6. add activities to day(s);
7. see budget summary;
8. request recommendations;
9. add a recommendation;
10. view itinerary/timeline;
11. generate a public share link;
12. open shared view from a logged-out browser;
13. copy shared trip after login.

If this works cleanly, the hackathon product is viable.
