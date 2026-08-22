# GlobeTrotter — Remaining Features Audit & Implementation Prompt

## Context

You are working inside the **current GlobeTrotter repository**, not a fresh project.

Repository architecture:

```text
GlobeTrotter/
├── frontend/                  Next.js App Router + React + TypeScript
├── backend/                   Express + TypeScript + Prisma + PostgreSQL
├── recommendation-engine/     Python recommendation module
├── PRD_FRD.md
└── docker-compose.yml
```

The task is **not to redesign or rewrite the application from scratch**.

First inspect and preserve all existing working behavior. Then complete missing features, repair incomplete API wiring, and implement the remaining PRD/FRD requirements.

---

# 1. Current Repository Audit

## 1.1 Already Present

The current frontend already contains:

- landing page
- login
- signup
- authenticated app layout
- dashboard
- trips listing
- create trip
- trip details
- itinerary builder
- budget page
- timeline page
- city discovery
- activity discovery
- profile page
- public shared trip page
- TanStack Query hooks
- typed/shared service layer
- centralized `api-client.ts`
- loading/error/empty states in several screens

The current backend already contains modules for:

- auth
- users
- trips
- stops
- days
- itinerary
- budget
- locations
- catalog
- recommendations
- sharing
- dashboard
- health
- reference data

The current frontend domain services are mostly connected to `apiClient` rather than the old mock database.

---

# 2. Critical Integration Defect — Fix Before Building New Features

The backend currently defines many route modules but **does not mount several of them in `backend/src/app.ts`**.

Existing `app.ts` mounts:

```text
/auth
/trips             itinerary routes only
/trips             budget routes
/trips             sharing routes
/recommendations
/public
/dashboard
```

But current code also has route modules for:

```text
trips.routes.ts
stops.routes.ts
days.routes.ts
users.routes.ts
locations.routes.ts
catalog.routes.ts
reference.routes.ts
```

These must be mounted correctly or the frontend will receive 404 responses even though controller/service code exists.

## Required final routing

Use an explicit structure similar to:

```ts
app.use("/health", healthRoutes);

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", usersRoutes);

app.use("/api/v1/trips", tripsRoutes);
app.use("/api/v1/trips", itineraryRoutes);
app.use("/api/v1/trips", budgetRoutes);
app.use("/api/v1/trips", sharingRoutes);

// Either mount nested routers from trips.routes.ts:
app.use("/api/v1/trips/:tripId/stops", stopsRoutes);
app.use("/api/v1/trips/:tripId/days", daysRoutes);

// Or mount them inside trips.routes.ts.
// Do NOT create duplicate final endpoints.

app.use("/api/v1/locations", locationsRoutes);
app.use("/api/v1/catalog", catalogRoutes);
app.use("/api/v1/reference", referenceRoutes);

app.use("/api/v1/recommendations", recommendationsRoutes);
app.use("/api/v1/public", sharingPublicRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
```

When nested routers rely on `tripId`, initialize them with:

```ts
Router({ mergeParams: true })
```

Do this for `stops.routes.ts` as well as `days.routes.ts`.

Verify every final URL only exists once.

---

# 3. Missing / Incomplete Feature Matrix

## P0 — Required for Core Product to Work

| Feature | Current state | Required work |
|---|---|---|
| Backend route mounting | Incomplete | Mount trips/users/locations/catalog/reference/stops/days |
| Trip CRUD | Code exists | Verify live endpoints and ownership |
| Stops | Backend code exists | Correct nested routing and GET stops support if frontend needs it |
| Days | Backend code exists | Correct nested routing |
| Activities | UI + backend exist | Verify add/edit/delete/reorder |
| Profile API | Code exists | Mount `/users` routes |
| Preferences | UI exists, backend incomplete | Persist all preference fields |
| Currency references | Backend exists | Replace hardcoded frontend currency list where possible |
| Catalog/location search | Backend exists | Mount APIs and verify pagination/filter contracts |
| Shared trip | UI exists | Verify logged-out read and authenticated copy |
| Budget | UI + backend exist | Remove hardcoded euro formatting |
| Recommendation feedback | Backend exists | Wire Not Interested / Accepted UI |

---

## P1 — Explicit PRD/FRD Features Still Missing or Partial

### A. Profile Picture Upload

**Current state: NOT implemented.**

Evidence from current source:

```ts
// profileImageUri will be added when file upload is implemented
```

The database DTO already exposes `profileImageUri`, but there is no real upload flow.

### Required functionality

Profile page must show:

- current avatar
- fallback initials
- Change Photo button
- file picker
- preview
- upload progress
- Remove Photo
- validation errors

Accepted formats:

```text
image/jpeg
image/png
image/webp
```

Recommended maximum:

```text
5 MB
```

Do not store raw image binary/base64 in PostgreSQL.

### Preferred architecture

For development, implement one storage abstraction:

```text
StorageService
├── uploadProfileImage()
├── deleteProfileImage()
└── getPublicUrl()
```

Possible providers can be plugged in later.

Backend endpoints:

```http
POST   /api/v1/users/me/profile-image
DELETE /api/v1/users/me/profile-image
```

Use `multipart/form-data`.

Backend must:

1. authenticate request;
2. validate MIME type;
3. validate max size;
4. generate safe unique filename/key;
5. upload file;
6. update `User.profileImageUri`;
7. return updated profile;
8. delete old image where safe.

Frontend:

```ts
profileService.uploadProfileImage(file)
profileService.removeProfileImage()
```

Add TanStack mutations:

```ts
useUploadProfileImage()
useRemoveProfileImage()
```

After mutation invalidate:

```text
["profile"]
["auth", "me"]
```

Header avatar must update immediately.

---

### B. Profile Preferences Are Displayed but Not Fully Persisted

Current frontend sends:

```text
cultureWeight
foodWeight
adventureWeight
natureWeight
relaxationWeight
travelPace
budgetLevel
```

But the current backend `UpsertPreferencesSchema` only accepts:

```text
preferredCurrency
preferredTimezone
theme
notificationsEnabled
emailNotifications
```

and the service does not write the travel scoring fields.

Therefore the UI may appear to save, but these preferences are not reliably persisted.

### Required fix

Extend Zod schema and service to support:

```ts
cultureWeight: z.number().min(0).max(100).optional(),
foodWeight: z.number().min(0).max(100).optional(),
adventureWeight: z.number().min(0).max(100).optional(),
natureWeight: z.number().min(0).max(100).optional(),
relaxationWeight: z.number().min(0).max(100).optional(),
travelPace: z.enum(["slow", "moderate", "fast"]).optional(),
budgetLevel: z.enum(["budget", "moderate", "luxury"]).optional(),
```

Persist every supplied field in Prisma `upsert`.

Recommendation generation should read these saved preferences from DB.

---

### C. Saved Destinations

PRD requires saved destinations under Profile/Settings.

Current application does not have a production saved-destination backend flow.

Implement a relational model, for example:

```prisma
model SavedLocation {
  id         String   @id @default(uuid())
  userId     String
  locationId String
  createdAt  DateTime @default(now())

  user       User     @relation(...)
  location   Location @relation(...)

  @@unique([userId, locationId])
  @@index([userId])
}
```

Endpoints:

```http
GET    /api/v1/users/me/saved-locations
POST   /api/v1/users/me/saved-locations/:locationId
DELETE /api/v1/users/me/saved-locations/:locationId
```

UI requirements:

- heart/save toggle on city cards
- save action in city details
- saved destinations section in profile
- optimistic toggle with rollback on failure
- empty state
- loading skeleton
- remove saved city

Do not use localStorage as source of truth for authenticated saved destinations.

---

### D. Delete Account

PRD requires Delete Account.

Current backend does not expose:

```http
DELETE /api/v1/users/me
```

Implement it.

UI:

- Danger Zone section
- "Delete Account"
- confirmation dialog
- require typing `DELETE` or password confirmation
- explain that trips/profile/preferences will be removed
- disable while processing

Backend:

- authenticate
- revoke sessions/refresh tokens
- delete or anonymize owned data according to schema rules
- perform in transaction where applicable
- clear auth cookies
- return 204

---

### E. Forgot Password / Reset Password

Suggested frontend information architecture includes `/forgot-password`.

Current frontend has no page for it.

If implementing full product requirements, add:

```text
/forgot-password
/reset-password/[token]
```

Backend endpoints:

```http
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
```

Security:

- always return neutral response from forgot-password
- hash reset token before storing
- short expiry (e.g. 15–30 minutes)
- one-time use
- revoke existing sessions after successful password reset
- rate limit endpoint

If no email provider is configured in development, implement an email-provider interface and a development logger/provider without hardcoding production behavior.

---

# 4. Map Feature — Currently Missing

## Current state

No map library is installed in the frontend.

There is no MapLibre/Leaflet map component.

There is no `/map` page.

There is no geographic itinerary map in builder/timeline/city discovery.

The FRD marks maps as an MVP+ feature and recommends **MapLibre** for an open stack.

Now implement it as an enhancement without breaking the current itinerary workflow.

---

# 5. Map Implementation Requirements

## Library

Prefer:

```text
maplibre-gl
react-map-gl/maplibre
```

Do not require a paid Google Maps API for the base feature.

Add required MapLibre CSS globally in the correct Next.js location.

Avoid SSR failures by rendering the interactive map as a client component/dynamic import if necessary.

---

## Shared Component

Create:

```text
frontend/src/components/maps/
├── trip-map.tsx
├── location-map.tsx
├── map-marker.tsx
├── map-popup.tsx
└── map-utils.ts
```

`TripMap` props should support:

```ts
type TripMapProps = {
  stops: Array<{
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    sequenceNo: number;
  }>;
  activities?: Array<{
    id: string;
    name: string;
    latitude?: number;
    longitude?: number;
    dayNumber?: number;
  }>;
  selectedStopId?: string;
  onStopSelect?: (id: string) => void;
};
```

Requirements:

- marker per city stop
- sequence number inside marker
- fit bounds automatically
- popup on marker click
- show city/country/date range
- optional activity markers
- selected marker state
- responsive map
- graceful no-coordinate state
- loading placeholder
- accessible textual alternative/list

---

## Trip Builder Integration

In:

```text
/trips/[tripId]/builder
```

Add a `Map` view/tab.

Suggested desktop:

```text
LEFT             CENTER             RIGHT
Days / Stops     Itinerary          Discovery
                  + Map toggle
```

or:

```text
[ Itinerary ] [ Map ]
```

Map must reflect current trip stops from backend.

Selecting a map marker should select/highlight the related stop/day.

Selecting a stop should focus the map marker.

Do not duplicate trip state locally; derive it from TanStack Query data.

---

## Timeline Integration

Current `/trips/[tripId]/timeline` has:

```text
Timeline
List
Calendar
```

Add:

```text
Map
```

Final tabs:

```text
Timeline | List | Calendar | Map
```

Map should show stop ordering and optionally activity positions.

---

## City Discovery Map

On `/discover/cities`, provide:

```text
Cards | Map
```

Map result markers must correspond to API search results.

Click marker → show small city popup/detail action.

Changing filters updates map results.

Do not request the whole world dataset when not required; use current search/filter result set.

---

## Backend Geospatial Contract

Verify `Location` contains:

```text
latitude
longitude
```

Use appropriate decimal precision.

Expose coordinates in:

```http
GET /api/v1/locations/search
GET /api/v1/locations/:id
GET /api/v1/trips/:tripId
GET /api/v1/trips/:tripId/stops
```

Never fabricate coordinates on frontend.

---

## Nearby API

FRD defines:

```http
GET /api/v1/catalog/items/nearby?lat=&lng=&radius=
```

Current project does not expose a complete nearby UI/flow.

Implement it.

Validation:

```text
lat: -90..90
lng: -180..180
radius: positive and capped
```

For first implementation, if PostGIS is already enabled, use geographic distance query.

If PostGIS is not ready, create a repository/service boundary so distance implementation can later be replaced cleanly.

Return:

```json
{
  "items": [
    {
      "id": "...",
      "name": "...",
      "latitude": 41.89,
      "longitude": 12.49,
      "distanceMeters": 850
    }
  ]
}
```

Do not call external providers per request.

---

# 6. Admin Dashboard — Optional in FRD, But Implement It Now

## Current state

There is no:

```text
frontend/src/app/(app)/admin/
```

and no admin backend module/routes.

The PRD specifies these optional analytics:

- registered users
- trips created
- top cities
- top activities
- recommendation acceptance
- search-to-add conversion
- budget usage trends

---

## Authentication / Authorization

Do not implement admin merely by hiding links in the frontend.

Add a role model/field if not already present.

Minimum roles:

```text
TRAVELER
ADMIN
```

Backend middleware:

```text
requireAuth
requireRole("ADMIN")
```

Every `/admin/*` API must enforce authorization server-side.

Frontend should read role from `/auth/me`.

Unauthorized users:

- should not see Admin link;
- navigating manually to `/admin` should redirect/render 403;
- APIs return 403.

---

## Admin Routes

Create:

```text
/admin
/admin/users
/admin/catalog
```

Optional later:

```text
/admin/analytics
/admin/settings
```

---

## Admin APIs

Implement:

```http
GET /api/v1/admin/analytics/summary
GET /api/v1/admin/analytics/top-locations
GET /api/v1/admin/analytics/top-activities
GET /api/v1/admin/analytics/recommendations
GET /api/v1/admin/analytics/budget-trends

GET /api/v1/admin/users
GET /api/v1/admin/users/:userId

GET    /api/v1/admin/catalog/items
POST   /api/v1/admin/catalog/items
PATCH  /api/v1/admin/catalog/items/:itemId
DELETE /api/v1/admin/catalog/items/:itemId
```

Use pagination for user/catalog tables.

---

## Admin Dashboard UI

Create professional analytics cards:

```text
Registered Users
Active Users
Trips Created
Upcoming Trips
Activities Added
Recommendations Generated
Recommendation Acceptance %
Public Trips Shared
```

Charts:

1. trips created over time — line/bar;
2. top cities — horizontal bar;
3. top activities — bar;
4. recommendation accepted/rejected — donut;
5. budget utilization distribution — bar/area.

Tables:

```text
Recent Users
Recent Trips
Top Catalog Activities
```

Use current Recharts dependency.

States:

- skeleton
- empty
- error retry
- pagination
- date-range filter where meaningful

Do not use mock values.

All admin analytics must come from PostgreSQL queries.

---

# 7. Missing Dedicated Itinerary Route

The FRD suggests:

```text
/trips/[tripId]/itinerary
```

Current frontend has:

```text
/trips/[tripId]
/builder
/budget
/timeline
```

but no dedicated `/itinerary` route.

Implement a read-focused itinerary page.

Requirements:

- city grouping
- day grouping
- activity cards
- start/end time
- duration
- estimated cost
- notes where safe
- list/calendar switch if useful
- "Edit Itinerary" button → builder

It must use the same trip/day API data and must not create another independent state model.

---

# 8. Trip Builder Missing Mutations / UX

Verify and implement UI controls for all backend-supported actions:

```text
add stop
edit stop
delete stop
reorder stops

add activity
edit activity
delete activity
reorder activities
```

Current hooks include add/delete operations but do not expose every required update/reorder mutation clearly.

Create hooks:

```text
useUpdateStop()
useReorderStops()
useUpdateActivity()
useReorderActivities()
```

After every mutation invalidate only relevant query keys.

Use optimistic reorder where safe, with rollback.

Add drag-and-drop only if it can remain keyboard accessible. Provide Move Up / Move Down fallback.

---

# 9. Recommendation Completion

Current code generates recommendations and backend has feedback endpoint.

Ensure the UI implements both:

```text
Add to itinerary
Not interested
```

When user adds a recommended activity:

1. add canonical catalog item to selected day;
2. send recommendation feedback `accepted`;
3. invalidate day/recommendation/budget data.

When user rejects:

1. send `rejected` feedback;
2. remove/de-emphasize the card;
3. persist feedback in DB.

Never modify recommendation scores in frontend.

---

# 10. Currency Bugs

Current budget/shared-trip UI contains hardcoded:

```text
€
```

This violates the money requirement.

Replace all hardcoded currency symbols with a common formatter:

```ts
formatMoney(amount, currency, locale)
```

Use trip/profile currency from API.

Audit entire frontend:

```bash
grep -R "€\\|₹\\|\\$" frontend/src
```

Static marketing copy is allowed; financial UI must use actual trip currency.

---

# 11. Reference Data Integration

Current Profile currency `<select>` is hardcoded.

Use backend reference endpoints:

```http
GET /api/v1/reference/currencies
GET /api/v1/reference/categories
GET /api/v1/reference/expense-categories
```

Create:

```text
reference.service.ts
useCurrencies()
useCategories()
useExpenseCategories()
```

Use them in:

- create trip
- profile
- budget expense form
- activity filters
- recommendation preference/category UI

Add cache stale time because reference data changes infrequently.

---

# 12. Dashboard Verification

Current dashboard calls:

```text
/dashboard/summary
```

and also uses a Next.js `/api/city-images` helper.

Verify:

- recommended destinations are based on real DB locations;
- recent trips come from backend;
- upcoming trip data is live;
- quick stats are computed server-side;
- image fallback is purely presentation-level.

No mock travel records should drive authenticated production screens.

---

# 13. Public Sharing Completion

Verify:

```text
Create share link
List share links
Revoke share link
Open while logged out
Copy after login
```

Frontend currently has create/public/copy flows.

Add UI to manage/revoke existing links if absent.

Public DTO must never expose:

```text
email
user id
private notes
private expenses
session information
internal share-token hashes
```

Budget must only be shown if owner sharing configuration permits it.

Also improve social sharing with:

```ts
navigator.share(...)
```

and clipboard fallback.

---

# 14. Search & Filter Completeness

## City Search

Must support:

```text
debounced query
country
region
popular/recommended sorting
pagination/cursor
```

## Activity Search

Must support:

```text
location
text
category
min cost
max cost
duration
minimum rating
pagination
```

Frontend filter state should use URL search params where practical so filters are shareable/back-button friendly.

Do not fetch unlimited datasets.

---

# 15. API Contract Standardization

All backend success responses should use the same envelope:

```json
{
  "success": true,
  "data": {}
}
```

Optional:

```json
{
  "success": true,
  "data": [],
  "meta": {
    "nextCursor": "...",
    "total": 100
  }
}
```

All errors:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "...",
    "fieldErrors": {}
  },
  "requestId": "..."
}
```

Do not mix:

```ts
res.json({ profile })
```

and:

```ts
ok(res, ...)
```

unless `apiClient` intentionally supports both.

Prefer standardizing backend.

---

# 16. Auth Architecture Cleanup

The repository still contains:

```text
middleware/auth.ts
middleware/requireAuth.ts
```

and:

```text
lib/errors.ts
errors/AppError.ts
```

Audit actual usage.

Choose one authentication middleware pipeline.

Choose one application error hierarchy.

Do not leave dual competing mechanisms.

Ensure all protected routes use exactly the same cookie/token contract.

---

# 17. Notification UI

Current app header includes static/sample notification content.

Do not present hardcoded notification data as live production events.

Either:

1. mark it clearly as static UI placeholder; or
2. implement real notifications.

If implementing:

Database:

```text
Notification
id
userId
type
title
body
readAt
createdAt
metadata
```

API:

```http
GET   /api/v1/notifications
PATCH /api/v1/notifications/:id/read
POST  /api/v1/notifications/read-all
```

Create notifications for useful events such as:

- trip starts soon
- over-budget warning
- share link copied/accessed only if useful
- recommendation ready

Do not over-engineer real-time WebSockets unless required.

---

# 18. Profile Header / Avatar Integration

After profile photo implementation:

- app header must display current avatar;
- profile page displays same avatar;
- auth state refreshes after update;
- fallback initials derived from display name;
- broken remote image shows fallback;
- no stale image after upload.

Use Next/Image where appropriate and configure remote image patterns safely.

---

# 19. Testing Requirements

## Backend

Add tests for:

```text
auth
trip ownership
trip date validation
stop overlap
activity ordering
budget calculation
recommendation scoring
share privacy
admin authorization
profile upload validation
saved destination uniqueness
```

## Frontend

Test critical flows:

```text
login
create trip
add stop
add activity
budget expense
profile update
profile photo
recommendation accept/reject
share/copy
admin authorization
```

At minimum, smoke-test all routes manually if full automated coverage is not feasible.

---

# 20. Required Full End-to-End Acceptance Test

A successful implementation must allow:

```text
1. Register
2. Login
3. Refresh browser and remain authenticated
4. Change display name
5. Upload profile picture
6. Change currency
7. Change recommendation preferences
8. Save profile
9. Reload and verify persistence
10. Search a city
11. Save/favorite city
12. Create trip
13. Add first destination
14. Add second destination
15. Reorder stops
16. Edit stop dates
17. Open trip map and see both city markers
18. Search activities
19. Add activity to a day
20. Edit activity time
21. Reorder activities
22. Generate recommendations
23. Reject one recommendation
24. Accept another recommendation
25. Verify accepted recommendation is in itinerary
26. Open budget page
27. Add expense
28. Verify correct trip currency everywhere
29. Open itinerary page
30. Open timeline
31. Open calendar
32. Open map
33. Generate public share link
34. Open link in logged-out/incognito browser
35. Verify no private fields leak
36. Log in and copy shared trip
37. Revoke share link
38. Verify old link no longer works
39. Admin logs in
40. Admin sees live analytics
41. Traveler cannot access admin APIs/routes
42. Delete account from Danger Zone
```

---

# 21. Execution Rules for the Coding Agent

You are modifying an existing repository.

### DO

- inspect before changing;
- preserve existing UI visual language;
- reuse existing components;
- reuse TanStack Query;
- reuse centralized `apiClient`;
- use Prisma transactions where mutations affect multiple related records;
- keep canonical data in PostgreSQL;
- enforce authorization in backend;
- validate every mutation with Zod;
- maintain TypeScript strictness;
- add loading/error/empty states;
- invalidate query keys correctly;
- run build/type checks after each phase.

### DO NOT

- rewrite whole project;
- replace working modules unnecessarily;
- add mock data to make screens appear functional;
- duplicate API clients;
- store JWTs in localStorage;
- hardcode currency symbols;
- fabricate coordinates;
- fabricate recommendation scores;
- authorize admin only in frontend;
- create duplicate endpoints;
- call external map/travel providers on every normal request;
- add a second state management system.

---

# 22. Implementation Order

## Phase 1 — Make Existing APIs Reachable

1. repair `app.ts` route mounting;
2. repair nested route `mergeParams`;
3. standardize auth middleware;
4. standardize response envelopes;
5. verify frontend API base URL/CORS/cookies;
6. run smoke tests.

## Phase 2 — Complete Core Trip Flow

1. trip CRUD;
2. stops add/edit/delete/reorder;
3. days;
4. itinerary add/edit/delete/reorder;
5. locations/catalog;
6. budget;
7. dashboard.

## Phase 3 — Complete Profile

1. fix preference persistence;
2. reference currency integration;
3. profile picture upload;
4. saved destinations;
5. delete account;
6. header avatar sync.

## Phase 4 — Complete Recommendation & Sharing

1. feedback mutations;
2. acceptance adds activity;
3. share-link management/revocation;
4. public privacy;
5. copy trip.

## Phase 5 — Map

1. coordinates contract;
2. MapLibre setup;
3. reusable TripMap;
4. builder map;
5. timeline map;
6. discovery map;
7. nearby endpoint/UI.

## Phase 6 — Admin

1. role schema/migration;
2. role middleware;
3. analytics queries;
4. admin APIs;
5. admin dashboard;
6. user/catalog management.

## Phase 7 — Secondary Requirements

1. dedicated itinerary page;
2. forgot/reset password;
3. notification cleanup or real notifications;
4. URL-based filter state;
5. accessibility pass.

## Phase 8 — Verification

Run:

```bash
# backend
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run build
npm run dev

# frontend
cd ../frontend
npm install
npm run build
npm run dev
```

Also run the project's configured lint/typecheck/test commands.

Do not call the task complete until the end-to-end acceptance flow passes using real PostgreSQL data.

---

# 23. Final Deliverable Expected from the Coding Agent

When implementation is finished, provide:

```text
1. Files changed
2. Prisma migrations added
3. New endpoints
4. Modified endpoints
5. New frontend routes
6. New components
7. New TanStack Query hooks
8. Environment variables added
9. Manual test results
10. Build/typecheck/test results
11. Remaining known limitations
```

The final application must behave as one integrated system rather than separate frontend/backend demos.
