# GlobeTrotter — PHASES.md

## Phase 0 — Foundation
- repositories/workspace initialized;
- env validation;
- PostgreSQL connection;
- migrations;
- base Express server;
- health endpoints;
- Next.js app shell;
- QueryClient;
- API client;
- lint/format/test;
- global design tokens.

**Exit:** frontend and backend run locally and communicate.

## Phase 1 — Authentication
Backend:
- users/auth schema;
- register;
- login;
- logout;
- me;
- refresh/reset if included.

Frontend:
- login;
- signup;
- protected layout;
- profile menu.

**Exit:** secure authenticated session survives refresh.

## Phase 2 — Dashboard + Profile
- dashboard summary;
- recent trips;
- recommended destinations placeholder backed by DB query;
- profile edit;
- user preference edit.

**Exit:** authenticated user sees personal data.

## Phase 3 — Trip CRUD
- create trip;
- list trips;
- trip details;
- edit/delete;
- status grouping.

**Exit:** user can manage own trips end to end.

## Phase 4 — City Stops + Trip Days
- location search;
- add/remove/reorder stops;
- stop date validation;
- generate/maintain trip days.

**Exit:** multi-city trip structure works.

## Phase 5 — Activity Catalog
- activity search/filter;
- activity details;
- category/reference endpoints;
- catalog ingestion for pilot cities.

**Exit:** no hardcoded activity list is needed by frontend.

## Phase 6 — Itinerary Builder
- add/remove/reorder itinerary items;
- planned time/duration;
- overlap warnings;
- itinerary list view.

**Exit:** user can build complete day-by-day plan.

## Phase 7 — Budget
- trip target budget;
- allocations optional;
- estimated/actual expenses;
- budget summary;
- charts and alerts.

**Exit:** itinerary changes update meaningful budget status.

## Phase 8 — Recommendation MVP
- candidate filtering;
- weighted scoring;
- diversity;
- explanations;
- recommendation persistence;
- feedback endpoint;
- frontend recommendation panel.

**Exit:** recommendations are grounded, budget-aware and addable.

## Phase 9 — Timeline / Calendar
- list/calendar/timeline modes;
- day expansion;
- reordering;
- mobile-friendly alternative controls.

## Phase 10 — Public Sharing + Copy Trip
- secure share links;
- read-only public view;
- revoke;
- copy transaction.

## Phase 11 — Polish & Reliability
- loading/empty/error states;
- responsiveness;
- accessibility;
- audit authorization;
- caching;
- API rate limits;
- E2E tests;
- performance pass;
- seed/ingestion scripts;
- demo data.

## Phase 12 — Optional Advanced
- pgvector semantic retrieval;
- weather-aware recommendations;
- live provider availability;
- collaborative editing;
- admin analytics;
- Python recommendation service if ML justifies it;
- A/B ranking policies.

## Recommended Hackathon Cut
If time is tight, stop after Phase 10 and prioritize correctness/polish over optional advanced work.
