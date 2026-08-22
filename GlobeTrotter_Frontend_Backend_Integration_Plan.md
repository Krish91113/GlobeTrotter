# GlobeTrotter — Complete Frontend ↔ Backend Integration Plan

## Purpose

This document is an implementation blueprint for taking the current GlobeTrotter repository and turning it into one coherent, end-to-end working application.

It is based on the actual uploaded project structure, not on a hypothetical architecture. The goal is to:

1. identify what already exists in the frontend;
2. identify what already exists in the backend;
3. map every frontend screen/function to a backend endpoint;
4. replace frontend mock-data calls with real API calls;
5. repair backend startup/route/contract inconsistencies;
6. create missing backend or frontend pieces where required;
7. preserve the current Next.js UI rather than rebuilding it blindly;
8. make every important CTA and page work against the live PostgreSQL database;
9. complete the MVP flow from signup → trip creation → itinerary → budget → recommendation → timeline → sharing.

---

# 1. Current Repository State

## 1.1 Frontend stack found in the repository

The current frontend already uses a suitable production-oriented stack:

- Next.js App Router
- React 19
- TypeScript
- Tailwind CSS
- TanStack Query
- React Hook Form
- Zod
- shadcn/Radix-style UI primitives
- Framer Motion
- Recharts
- date-fns
- Lucide icons
- Sonner toasts

The frontend already contains these application screens:

```text
frontend/src/app/
├── page.tsx                                  Landing page
├── login/page.tsx                           Login
├── signup/page.tsx                          Signup
├── shared/[shareToken]/page.tsx             Public shared trip
└── (app)/
    ├── dashboard/page.tsx
    ├── profile/page.tsx
    ├── discover/
    │   ├── cities/page.tsx
    │   └── activities/page.tsx
    └── trips/
        ├── page.tsx                          My Trips
        ├── new/page.tsx                      Create Trip
        └── [tripId]/
            ├── page.tsx                      Trip Overview
            ├── builder/page.tsx              Itinerary Builder
            ├── budget/page.tsx               Budget
            └── timeline/page.tsx             Timeline
```

The UI is therefore **not missing the main MVP screens**. Most of the missing work is live data wiring, DTO mapping, route/API completion, and a few missing interactions.

---

## 1.2 Frontend architecture already present

The frontend contains:

```text
frontend/src/
├── features/
├── services/
├── hooks/queries.ts
├── lib/api-client.ts
├── types/index.ts
├── mocks/db.ts
└── components/
```

This is a good base architecture.

The most important current issue is:

> Auth is connected to the real backend API, but almost every other frontend domain service still imports `@/mocks/db`.

Currently mock-backed services include:

- `trips.service.ts`
- `itinerary.service.ts`
- `locations.service.ts`
- `activities.service.ts`
- `recommendations.service.ts`
- `budget.service.ts`
- `sharing.service.ts`
- `profile.service.ts`
- `dashboard.service.ts`

The frontend already has a usable `apiClient()` that:

- uses `NEXT_PUBLIC_API_BASE_URL`;
- adds `credentials: "include"`;
- expects a standard API envelope;
- normalizes API errors;
- supports HTTP-only cookies.

Therefore **do not create another HTTP client**. Use `frontend/src/lib/api-client.ts` as the only frontend transport layer.

---

# 2. Backend State Found in the Repository

## 2.1 Backend stack

The backend uses:

- Node.js
- Express 5
- TypeScript
- PostgreSQL
- Prisma 7
- `@prisma/adapter-pg`
- HTTP-only cookie auth
- JWT access tokens
- refresh-token sessions stored in PostgreSQL
- Zod validation
- Pino logging
- Helmet
- CORS

The backend already contains modules for:

```text
auth
users
locations
catalog
trips
stops
days
itinerary
budget
recommendations
sharing
dashboard
reference
health
```

This means the backend is structurally close to the PRD, but several modules are either not mounted, inconsistent, duplicated, or incomplete.

---

# 3. Critical Backend Problems to Fix Before Integration

## 3.1 `app.ts` is currently broken

The uploaded `backend/src/app.ts` currently contains a mixture of two different versions of the application setup.

Problems include:

- `env` is imported and redeclared;
- `getEnv()` is called without a valid import;
- `requestId` is imported but `requestIdMiddleware` is used;
- `notFoundHandler` is used without import;
- top-level `return app;` exists without a wrapping function;
- `server.ts` expects `createApp()`.

### Required final structure

`backend/src/app.ts` must export:

```ts
export function createApp(): Express {
  const app = express();

  // middleware
  // routes
  // 404
  // error handler

  return app;
}
```

`backend/src/server.ts` should continue doing:

```ts
const app = createApp();
app.listen(...)
```

---

## 3.2 Essential backend route modules exist but are not mounted

The repository contains these real route files:

- `modules/trips/trips.routes.ts`
- `modules/stops/stops.routes.ts`
- `modules/days/days.routes.ts`
- `modules/locations/locations.routes.ts`
- `modules/catalog/catalog.routes.ts`
- `modules/users/users.routes.ts`
- `reference/reference.routes.ts`

But `app.ts` currently mounts only auth, itinerary, budget, sharing, recommendations, public sharing, and dashboard.

### Required app route registration

Final `app.ts` should mount at least:

```ts
app.use('/health', healthRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/trips', tripsRoutes);
app.use('/api/v1/trips', itineraryRoutes);
app.use('/api/v1/trips', budgetRoutes);
app.use('/api/v1/trips', sharingRoutes);
app.use('/api/v1/locations', locationsRoutes);
app.use('/api/v1/catalog', catalogRoutes);
app.use('/api/v1/recommendations', recommendationsRoutes);
app.use('/api/v1/public', sharingPublicRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/reference', referenceRoutes);
```

Do not attempt frontend integration until the corresponding backend route is actually mounted.

---

# 4. Critical Trip Module Problem

The repository has a `backend/src/modules/trips/` folder, but its current content is incorrect.

`trips.routes.ts` is currently duplicated itinerary-item routing and imports:

```ts
import { itineraryController } from './itinerary.controller';
```

The same problem exists in the trip controller/service area: the module is effectively an itinerary duplicate rather than Trip CRUD.

This is a major blocker because the frontend already needs:

```text
GET    /api/v1/trips
POST   /api/v1/trips
GET    /api/v1/trips/:tripId
PATCH  /api/v1/trips/:tripId
DELETE /api/v1/trips/:tripId
```

## Required fix

Rebuild `backend/src/modules/trips/` as a real Trip CRUD module.

### Required files

```text
backend/src/modules/trips/
├── trips.routes.ts
├── trips.controller.ts
├── trips.service.ts
├── trips.schema.ts
└── trips.dto.ts
```

### Required responsibilities

#### `GET /trips`

Return only trips owned by the authenticated user.

Support filters such as:

```text
?status=upcoming
?status=ongoing
?status=completed
?status=all
```

Return frontend-ready information including:

- ID
- name
- description
- date range
- cover image
- currency
- total budget
- cities
- days count
- activity count
- estimated spend
- computed trip status

#### `POST /trips`

Input from current frontend:

```json
{
  "name": "Italy Escape",
  "description": "Summer trip",
  "startDate": "2026-09-10",
  "endDate": "2026-09-18",
  "currency": "EUR",
  "totalBudget": 2500,
  "coverImage": "optional-url",
  "firstDestination": "optional-location-id"
}
```

Creation should happen transactionally:

1. validate dates;
2. resolve user;
3. resolve currency record;
4. resolve trip status / visibility / record status;
5. create trip;
6. create trip days for every date in the range;
7. create initial budget record when supplied;
8. optionally create first trip stop;
9. return complete trip DTO.

On frontend success navigate to:

```text
/trips/{tripId}/builder
```

---

# 5. Authentication Architecture Must Be Unified

The repository currently contains **two separate authentication middleware implementations**.

## Current JWT middleware

```text
backend/src/middleware/requireAuth.ts
```

It reads the access-token cookie via:

```ts
getAccessTokenFromCookies(req)
```

The current cookie helper uses:

```text
gt_access
gt_refresh
```

This matches the current auth controller/service flow.

## Conflicting old session middleware

```text
backend/src/middleware/auth.ts
```

It expects:

```text
gt_session
```

and directly queries the session table.

This creates an authentication mismatch.

`users.routes.ts` currently imports the old middleware:

```ts
import { requireAuth } from '../../middleware/auth';
```

Therefore a user may be successfully logged in through JWT cookies but receive 401 on profile endpoints.

## Final decision

Use **one authentication mechanism everywhere**.

For this project, preserve the already-working flow:

```text
login/register
  ↓
JWT access token
  ↓
gt_access HTTP-only cookie
  ↓
refresh token
  ↓
gt_refresh HTTP-only cookie
  ↓
requireAuth.ts
```

### Actions

1. Change all protected routes to import:

```ts
import { requireAuth } from '../../middleware/requireAuth';
```

2. Stop using `middleware/auth.ts`.
3. Keep refresh-token DB sessions for rotation/logout.
4. Standardize `req.user` across all modules.

Recommended shape:

```ts
req.user = {
  id: payload.userId,
  userId: payload.userId,
  email: payload.email,
};
```

---

# 6. Standardize API Response Format

The frontend `apiClient()` expects every normal API response to use:

```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

But several backend controllers currently return raw JSON.

Examples found:

```text
locations.controller.ts
catalog.controller.ts
users.controller.ts
stops.controller.ts
days.controller.ts
reference.controller.ts
```

They contain responses such as:

```ts
res.status(200).json(result)
res.status(200).json({ location })
res.status(201).json({ stop })
```

This will break the frontend `apiClient()` because it tries to return `json.data`.

## Required rule

All API controllers should use `ok()` from:

```text
backend/src/lib/apiResponse.ts
```

Example:

```ts
ok(res, { locations, total });
```

instead of:

```ts
res.status(200).json({ locations, total });
```

Exceptions such as health checks may remain raw JSON because the frontend normal application API does not consume them through `apiClient()`.

---

# 7. Fix Nested Router Params

`days.routes.ts` and `stops.routes.ts` are intended to be mounted under trip routes.

They use `req.params.tripId`.

For nested Express routers, initialize with:

```ts
const router = Router({ mergeParams: true });
```

Apply to:

```text
backend/src/modules/days/days.routes.ts
backend/src/modules/stops/stops.routes.ts
```

Otherwise `tripId` may become undefined when mounted as:

```ts
router.use('/:tripId/stops', stopsRoutes)
router.use('/:tripId/days', daysRoutes)
```

---

# 8. Prisma Client Must Have One Source of Truth

The repository contains both:

```text
backend/src/lib/prisma.ts
backend/src/database/prisma.ts
```

Do not create two `PrismaClient` instances.

## Recommended approach

Use:

```text
backend/src/lib/prisma.ts
```

as the canonical Prisma client.

Then make `database/prisma.ts` a compatibility re-export if older code needs it:

```ts
export { default } from '../lib/prisma';
```

or migrate all imports to the canonical file and delete the duplicate later.

---

# 9. Frontend API Integration Strategy

The frontend already has the correct layered structure available:

```text
Page
 ↓
Feature component
 ↓
TanStack Query hook
 ↓
Service
 ↓
apiClient
 ↓
Express backend
 ↓
Prisma
 ↓
PostgreSQL
```

Do not call `fetch()` directly from React page components.

Do not keep business data in `mocks/db.ts` after integration.

The mock DB can remain temporarily for development comparison, but production services must no longer import it.

---

# 10. Complete Integration Matrix

| Feature | Frontend exists? | Backend exists? | Current state | Required action |
|---|---:|---:|---|---|
| Signup | Yes | Yes | Mostly integrated | Verify cookie + response envelope |
| Login | Yes | Yes | Mostly integrated | Verify cookie + `/auth/me` |
| Logout | Yes | Yes | Integrated path exists | Verify cookie clear |
| Current user | Yes | Yes | Integrated | Ensure auth guard handles 401 normally |
| Dashboard | Yes | Yes | Frontend mocked; backend route exists | Wire service and align `/dashboard/summary` |
| My Trips | Yes | Broken Trip CRUD | Mocked | Implement backend Trip CRUD, wire frontend |
| Create Trip | Yes | Missing proper POST /trips | Mocked | Implement transaction + integrate |
| Trip Overview | Yes | Missing proper GET /trips/:id | Mocked | Implement DTO + integrate |
| Update Trip | Hooks exist | Missing proper PATCH | Mocked | Implement backend + service |
| Delete Trip | UI/hook exists | Missing proper DELETE | Mocked | Implement backend + confirmation flow |
| City Search | Yes | Yes | Backend route not mounted + frontend mocked | Mount route, envelope, integrate |
| Activity Search | Yes | Yes | Backend route not mounted + frontend mocked | Mount catalog route and integrate |
| Add Stop | Builder exists | Yes | Backend not fully mounted/nested | Mount routes, merge params, integrate |
| Edit Stop | Backend exists | Frontend hook missing | Partial | Add hook + builder edit UI |
| Delete Stop | Hook/UI available | Yes | Mocked | Wire service |
| Reorder Stops | Backend exists | Frontend service/hook incomplete | Partial | Add service + mutation + UI |
| Trip Days | Builder/timeline exist | Yes | Backend route not mounted/nesting issue | Fix router and integrate |
| Add Activity | Builder exists | Yes | Payload mismatch + mocked | Add DTO mapper |
| Edit Activity | Backend exists | Frontend mutation missing | Missing | Create hook + edit dialog |
| Delete Activity | Exists | Yes | Mocked | Wire service |
| Reorder Activities | Service mock exists | Yes | Not live | Wire API + drag/accessibility |
| Recommendations | UI exists | Yes | Mocked | Integrate generate + feedback |
| Budget summary | Page exists | Yes | Mocked | Integrate |
| Expenses | Page exists | Mostly yes | GET route mismatch/absence to verify | Add GET if missing + integrate CRUD |
| Timeline | Page exists | Uses days | Mocked | Integrate days + real itinerary data |
| Share link | UI/hook exists | Yes | Mocked | Integrate |
| Public itinerary | Page exists | Yes | Mocked | Integrate |
| Copy trip | Hook exists | Yes | Mocked | Integrate |
| Profile | Page exists | Yes | Auth mismatch + raw response | Fix backend middleware/envelope then integrate |
| Preferences | Backend exists | UI only partly represented | Partial | Connect profile/preferences controls |
| Reference currencies | UI may use static values | Yes | Route not mounted | Mount + create frontend reference service |
| Reference categories | UI filters exist | Yes | Static/mock data likely | Integrate reference service |
| Expense categories | Budget form needs it | Yes | Not integrated | Integrate |

---

# 11. Frontend Service Replacement Plan

## 11.1 `trips.service.ts`

Remove:

```ts
import { mockGetTrips, ... } from '@/mocks/db';
```

Use `apiClient`.

Target interface:

```ts
export const tripsService = {
  getTrips: async (status?: string) => {
    const qs = status && status !== 'all'
      ? `?status=${encodeURIComponent(status)}`
      : '';

    const data = await apiClient<BackendTripListResponse>(`/trips${qs}`);
    return mapTrips(data);
  },

  getTrip: async (tripId: string) => {
    const data = await apiClient<BackendTripDto>(`/trips/${tripId}`);
    return mapTrip(data);
  },

  createTrip: async (input: CreateTripInput) => {
    const payload = mapCreateTripInput(input);

    const data = await apiClient<BackendTripDto>('/trips', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return mapTrip(data);
  },

  updateTrip: async (tripId, input) => {
    const data = await apiClient<BackendTripDto>(`/trips/${tripId}`, {
      method: 'PATCH',
      body: JSON.stringify(mapUpdateTripInput(input)),
    });

    return mapTrip(data);
  },

  deleteTrip: (tripId: string) =>
    apiClient<void>(`/trips/${tripId}`, {
      method: 'DELETE',
    }),
};
```

Do not force the React UI to consume raw Prisma structures.

Create DTO mappers if backend shape differs.

---

## 11.2 `locations.service.ts`

Current frontend expects:

```ts
Location {
  id
  name
  country
  region
  description
  image
  rating
  averageDailyCost
  currency
  travelStyles
}
```

Backend catalog/location relational data may return media arrays and reference records.

Create a mapper:

```ts
mapLocationDtoToLocation(dto)
```

Service target:

```ts
search(filters) -> GET /locations/search
getById(id)    -> GET /locations/:id
```

### Query mapping

Current frontend filter names:

```text
query
country
region
budgetMax
travelStyle
```

Backend schema should be inspected and normalized.

Do not silently send unsupported query names.

If backend expects `q` instead of `query`, map explicitly.

---

## 11.3 `activities.service.ts`

Target:

```text
GET /api/v1/catalog/items
GET /api/v1/catalog/items/:id
```

Frontend filters:

```text
query
cityId
category
costMin
costMax
durationMax
ratingMin
```

Backend may use `locationId` rather than `cityId`.

Create explicit mapper:

```ts
{
  query: filters.query,
  locationId: filters.cityId,
  category: filters.category,
  minCost: filters.costMin,
  maxCost: filters.costMax,
  durationMax: filters.durationMax,
  ratingMin: filters.ratingMin,
}
```

Do not rename backend fields inside UI components.

---

# 12. Itinerary Builder Integration

The builder page already exists and is the central product screen.

It should be connected in this order:

```text
useTrip(tripId)
useTripStops(tripId)
useTripDays(tripId)
useActivities(filters)
useRecommendations(tripId)
```

## 12.1 Stop APIs

Required backend routes:

```text
POST   /trips/:tripId/stops
PATCH  /trips/:tripId/stops/:stopId
DELETE /trips/:tripId/stops/:stopId
PUT    /trips/:tripId/stops/reorder
```

Frontend currently has hooks for add/delete but not complete edit/reorder behavior.

Add:

```text
useUpdateStop(tripId)
useReorderStops(tripId)
```

### `useUpdateStop`

```ts
mutationFn: ({ stopId, input }) =>
  itineraryService.updateStop(tripId, stopId, input)
```

Invalidate:

```text
["trip", tripId, "stops"]
["trip", tripId, "days"]
["trip", tripId]
```

---

# 13. Itinerary Item Payload Mapping

Current frontend input:

```ts
{
  activityId,
  startTime,
  endTime,
  estimatedCost
}
```

Backend expects catalog-oriented data closer to:

```ts
{
  catalogItemId,
  plannedStartAt,
  plannedEndAt,
  durationMinutes,
  estimatedCost,
  currencyId,
  notes
}
```

Do not modify all frontend card components to match backend field names.

Map at service boundary.

Example:

```ts
function mapAddActivityInput(
  dayDate: string,
  input: AddActivityInput,
  currencyId?: string
) {
  return {
    catalogItemId: input.activityId,
    plannedStartAt: `${dayDate}T${input.startTime}:00`,
    plannedEndAt: `${dayDate}T${input.endTime}:00`,
    estimatedCost: input.estimatedCost,
    currencyId,
  };
}
```

Then:

```text
POST /trips/:tripId/days/:dayId/items
```

The current frontend service signature does not include `tripId` in `addActivity()` / `deleteActivity()`.

Change it to:

```ts
addActivity(tripId, dayId, input)
deleteActivity(tripId, dayId, itemId)
reorderActivities(tripId, dayId, orderedIds)
```

Update TanStack hooks accordingly.

---

# 14. Dashboard Integration

Current backend route is:

```text
GET /api/v1/dashboard/summary
```

Current frontend service conceptually calls dashboard data but is mock-backed.

Use:

```ts
apiClient<DashboardDto>('/dashboard/summary')
```

Do **not** call `/dashboard` unless the backend route is intentionally changed.

Frontend dashboard expects:

```ts
{
  upcomingTrip?: Trip;
  recentTrips: Trip[];
  recommendedDestinations: Location[];
  stats: {
    upcomingTripsCount: number;
    plannedCities: number;
    totalRemainingBudget: number;
    currency: string;
  };
}
```

Align backend DTO to this or map it in the service.

---

# 15. Budget Integration

Existing frontend page:

```text
/trips/[tripId]/budget
```

Existing backend routes include:

```text
GET /trips/:tripId/budget/summary
GET /trips/:tripId/budget
PUT /trips/:tripId/budget
POST /trips/:tripId/expenses
PATCH /trips/:tripId/expenses/:expenseId
DELETE /trips/:tripId/expenses/:expenseId
```

## Important mismatch

The frontend already calls `getExpenses(tripId)`, but the current `budget.routes.ts` does **not visibly expose**:

```text
GET /trips/:tripId/expenses
```

Add it if the service/controller implementation supports it, or implement it.

Required final expense routes:

```text
GET    /trips/:tripId/expenses
POST   /trips/:tripId/expenses
PATCH  /trips/:tripId/expenses/:expenseId
DELETE /trips/:tripId/expenses/:expenseId
```

Frontend `deleteExpense` must accept `tripId` because the endpoint requires it.

Change:

```ts
deleteExpense(expenseId)
```

to:

```ts
deleteExpense(tripId, expenseId)
```

---

# 16. Reference Data Integration

The backend already has:

```text
GET /reference/currencies
GET /reference/categories
GET /reference/expense-categories
```

Mount `referenceRoutes` in `app.ts`.

Create:

```text
frontend/src/services/reference.service.ts
```

with:

```ts
getCurrencies()
getActivityCategories()
getExpenseCategories()
```

And TanStack hooks:

```ts
useCurrencies()
useActivityCategories()
useExpenseCategories()
```

Use these for:

- Create Trip currency select;
- activity filters;
- budget expense category select.

This removes hardcoded catalog/reference values from the UI.

---

# 17. Recommendations Integration

Backend supports:

```text
POST /recommendations/generate
POST /recommendations/:recId/feedback
```

Current frontend recommendation service only does:

```ts
generate(tripId)
```

and uses mocks.

## Final implementation

### Generate

Prefer request:

```json
{
  "tripId": "uuid",
  "cityId": "uuid",
  "date": "2026-09-12",
  "limit": 8
}
```

The server should derive authoritative budget, preferences, already selected items, and spend from the database.

### Feedback

Add frontend:

```text
useRecommendationFeedback()
```

Actions:

```text
viewed
added
rejected
removed
completed
rated
```

When user clicks **Add**, submit feedback after successfully adding the itinerary item.

When user clicks **Not Interested**, submit `rejected` and update card UI.

---

# 18. Sharing Integration

Current frontend has:

```text
useCreateShareLink
usePublicTrip
useCopyTrip
```

Backend already has:

```text
POST   /trips/:tripId/share-links
GET    /trips/:tripId/share-links
DELETE /trips/:tripId/share-links/:linkId
GET    /public/trips/:token
POST   /public/trips/:token/copy
```

Replace mock methods with real calls.

Important: the share endpoint currently returns a share-link DTO, not necessarily exactly `{ token }`.

Map response to the frontend shape used by:

```ts
window.location.origin + '/shared/' + token
```

Public page must remain readable while logged out.

Copy requires authentication.

---

# 19. Profile Integration

Frontend already has `/profile` and hooks:

```text
useProfile
useUpdateProfile
```

Backend already has:

```text
GET   /users/me/profile
PATCH /users/me/profile
GET   /users/me/preferences
PUT   /users/me/preferences
```

Fix backend auth middleware first.

Then replace profile mock service with live API calls.

If the current profile page edits preferences together with profile fields, either:

### Option A — recommended

Split service mutations:

```ts
updateProfile(profileFields)
updatePreferences(preferenceFields)
```

and let UI submit the required requests.

### Option B

Create a backend combined profile endpoint if product requirements strongly need atomic combined updates.

For the current codebase, Option A is cleaner.

---

# 20. Frontend Components Already Present vs Missing

## Already present

The project already contains usable UI for:

- auth guard;
- landing page;
- app header;
- global search shell;
- trip cards;
- city cards;
- city details sheet;
- add-to-trip dialog;
- dashboard cards;
- create trip;
- builder;
- budget page;
- timeline page;
- shared trip page;
- profile page;
- empty/error/loading shared components.

Do not recreate these simply because backend integration is missing.

## Add or complete these functional components only where needed

### 1. Activity detail sheet

If the activities page only lists cards, add:

```text
frontend/src/features/discover/activity-details-sheet.tsx
```

Fields:

- image/gallery;
- title;
- city;
- category;
- rating;
- estimated cost;
- duration;
- best time;
- description;
- Add to itinerary.

### 2. Stop edit dialog

Add editable:

- city;
- arrival date;
- departure date;
- notes.

Connect PATCH stop API.

### 3. Activity edit dialog

Connect PATCH itinerary item API.

Allow:

- planned start;
- planned end;
- duration;
- estimated cost;
- notes.

### 4. Expense edit dialog

Backend already supports PATCH expense.

Add frontend hook and UI if not present.

### 5. Share management dialog

Optional but useful:

- create link;
- copy URL;
- list active links;
- revoke link.

### 6. Reference-data driven selects

Replace static currency/category dropdowns with backend reference queries.

---

# 21. TanStack Query Final Hook Set

Keep server state in TanStack Query.

Recommended final hooks:

```text
Auth
- useCurrentUser
- useLogin
- useRegister
- useLogout

Dashboard
- useDashboard

Trips
- useTrips
- useTrip
- useCreateTrip
- useUpdateTrip
- useDeleteTrip

Stops
- useTripStops
- useAddStop
- useUpdateStop
- useDeleteStop
- useReorderStops

Days / Itinerary
- useTripDays
- useAddActivity
- useUpdateActivity
- useDeleteActivity
- useReorderActivities

Discovery
- useLocations
- useLocation
- useActivities
- useActivity

Recommendations
- useGenerateRecommendations
- useRecommendationFeedback

Budget
- useTripBudget
- useTripExpenses
- useUpdateBudget
- useAddExpense
- useUpdateExpense
- useDeleteExpense

Sharing
- useCreateShareLink
- useShareLinks
- useRevokeShareLink
- usePublicTrip
- useCopyTrip

Profile
- useProfile
- useUpdateProfile
- usePreferences
- useUpdatePreferences

Reference
- useCurrencies
- useActivityCategories
- useExpenseCategories
```

---

# 22. Query Key Rules

Recommended keys:

```ts
['auth', 'me']
['dashboard', 'summary']
['trips', filters]
['trip', tripId]
['trip', tripId, 'stops']
['trip', tripId, 'days']
['trip', tripId, 'budget']
['trip', tripId, 'expenses']
['locations', 'search', filters]
['location', id]
['activities', filters]
['activity', id]
['recommendations', tripId, input]
['shareLinks', tripId]
['publicTrip', token]
['profile']
['preferences']
['reference', 'currencies']
['reference', 'categories']
['reference', 'expenseCategories']
```

Invalidate the smallest necessary key after each mutation.

---

# 23. DTO Mapping Layer

Do not couple React UI to Prisma relations.

Create a folder such as:

```text
frontend/src/lib/mappers/
├── trip.mapper.ts
├── location.mapper.ts
├── activity.mapper.ts
├── itinerary.mapper.ts
├── budget.mapper.ts
└── profile.mapper.ts
```

or keep small mappers beside each service.

Typical differences that must be normalized:

## Dates

Backend:

```text
DateTime / ISO timestamps
```

Frontend:

```text
YYYY-MM-DD or ISO string
```

## Money

Backend should return Decimal safely as strings or explicit money DTOs.

Frontend currently stores numbers.

Parse only at mapping boundary:

```ts
Number(dto.amount)
```

Never perform direct floating-point arithmetic in backend financial persistence.

## Media

Backend may return:

```text
mediaAssets[]
```

Frontend expects:

```text
image: string
coverImage: string
```

Mapper should choose the primary image and provide fallback image only when media is absent.

## Location

Backend may return nested Country.

Frontend expects:

```text
country: string
region: string
```

Flatten in mapper.

---

# 24. Search and Filter Integration

The UI already includes city/activity discovery pages and filter controls.

Make search truly server-driven.

## Cities

Use URL params:

```text
/discover/cities?q=rome&country=IT&region=europe
```

Debounce text input by approximately 300–400ms.

Query only when normalized filters change.

Backend:

```text
GET /locations/search
```

## Activities

URL params can include:

```text
q
cityId
category
minCost
maxCost
durationMax
ratingMin
```

Backend:

```text
GET /catalog/items
```

Filters should be shareable/bookmarkable when practical.

---

# 25. Global Search

The current frontend already contains:

```text
frontend/src/components/layout/global-search.tsx
```

Do not leave it as a static UI shell.

For MVP, implement federated frontend search with parallel queries:

```text
locations.search(query)
activities.search(query)
trips.getTrips/search local result set
```

Group results as:

```text
Trips
Cities
Activities
```

Later a dedicated `/search` backend endpoint can be added, but it is not required for MVP.

---

# 26. Error Handling Requirements

Backend errors should follow:

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

Frontend `ApiError` already understands:

- code;
- status;
- field errors;
- request ID.

Ensure React Hook Form maps `fieldErrors` to fields.

Do not convert every server error into a generic toast only.

Use:

- inline validation for form field errors;
- toast for mutation outcome;
- page error state for query failure;
- retry for transient GET requests.

---

# 27. Auth Guard Behavior

`/auth/me` may legitimately return 401 before login.

The backend should not log expected unauthenticated checks as fatal/unhandled server failures.

Treat `AuthRequiredError` as a normal 401 application error.

Frontend auth guard should:

```text
loading -> skeleton/spinner
authenticated -> render protected page
401 -> redirect to /login
server/network error -> render recoverable error
```

Do not continuously retry `/auth/me` on 401.

TanStack Query should use no/bounded retry for auth errors.

---

# 28. Cookie / CORS Configuration

Local frontend:

```text
http://localhost:3000
```

Local backend:

```text
http://localhost:5000
```

Backend:

```ts
cors({
  origin: env.CORS_ORIGIN,
  credentials: true,
})
```

Frontend API client:

```ts
credentials: 'include'
```

Current cookie names in this uploaded repository are:

```text
gt_access
gt_refresh
```

Keep setter and getter names identical.

For local development:

```text
secure=false
sameSite=lax
```

For a cross-site HTTPS production deployment:

```text
secure=true
sameSite=none
```

provided both deployment origins use HTTPS.

---

# 29. Environment Variables

## Backend `.env`

At minimum:

```env
NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/globetrotter?schema=public
JWT_SECRET=<long-secret>
COOKIE_SECRET=<long-secret>
SESSION_SECRET=<long-secret>
SESSION_MAX_AGE=7d
```

Use names expected by the actual `env.ts` schema.

## Frontend `.env.local`

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
```

Never expose backend secrets through `NEXT_PUBLIC_*` variables.

---

# 30. Database Seed Requirement

The frontend discovery screens depend on real DB-backed cities, catalog activities, categories and currencies.

Before testing discovery, ensure seed creates enough real development records for:

- currencies;
- countries;
- cities/locations;
- activity categories;
- catalog items;
- media assets;
- expense categories;
- statuses / visibility reference rows.

The UI should not depend on hardcoded canonical city/activity arrays after integration.

---

# 31. Exact Recommended Implementation Order

Do the work in this order to avoid repeatedly breaking downstream screens.

## Phase 0 — Backup

```bash
git checkout -b feat/fullstack-integration
```

Do not perform this work directly on `main` until stable.

---

## Phase 1 — Make backend boot reliably

1. fix `app.ts`;
2. fix imports;
3. ensure `createApp` export;
4. confirm env loading;
5. confirm Prisma singleton;
6. start PostgreSQL;
7. run migrations;
8. `prisma generate`;
9. start backend;
10. verify `/health/live` and `/health/ready`.

Exit condition:

```text
Backend starts with zero syntax/import errors.
```

---

## Phase 2 — Unify authentication

1. standardize cookie names;
2. use JWT `requireAuth.ts` globally;
3. remove old session middleware usage;
4. verify register;
5. verify login;
6. verify `/auth/me`;
7. verify refresh;
8. verify logout;
9. verify frontend AuthGuard.

Exit condition:

```text
Signup -> Dashboard works.
Refresh page -> user remains authenticated.
Logout -> protected page redirects to login.
```

---

## Phase 3 — Standardize backend envelope + route mounts

1. mount locations;
2. mount catalog;
3. mount users;
4. mount references;
5. mount proper trips;
6. fix nested stop/day routers;
7. convert raw controllers to `ok()`.

Exit condition:

Every endpoint used by the frontend returns an envelope compatible with `apiClient()`.

---

## Phase 4 — Implement Trip CRUD

Build proper trip routes/service/controller/schema.

Test with Postman before frontend integration.

Required manual tests:

```text
POST /trips
GET /trips
GET /trips/:id
PATCH /trips/:id
DELETE /trips/:id
```

Verify PostgreSQL rows:

```text
Trip
TripDay
TripBudget
TripStop (if selected)
```

---

## Phase 5 — Replace frontend trip mocks

Integrate:

```text
My Trips
Create Trip
Trip Overview
Update Trip
Delete Trip
Dashboard recent/upcoming trips
```

Do not move to itinerary until this works.

Exit condition:

Create Trip from browser persists in DB and appears after page refresh.

---

## Phase 6 — Integrate discovery

Integrate:

```text
Cities
Activities
```

Then connect Add-to-Trip city dialog.

Exit condition:

Search results come from PostgreSQL, not `mocks/db.ts`.

---

## Phase 7 — Integrate stops + days

Connect:

```text
add stop
edit stop
delete stop
reorder stops
trip days
```

Exit condition:

Builder reflects DB state after refresh.

---

## Phase 8 — Integrate activities

Connect:

```text
add item
edit item
delete item
reorder items
```

Implement service DTO mapping.

Exit condition:

Activity added to Day 1 remains after refresh and appears on Timeline.

---

## Phase 9 — Budget

Connect:

```text
budget summary
budget update
expense list
add expense
edit expense
delete expense
```

Exit condition:

Charts and totals update from backend persisted values.

---

## Phase 10 — Recommendations

Integrate recommendation generation + feedback.

Exit condition:

Recommendation comes from backend candidate records and can be added to itinerary.

---

## Phase 11 — Sharing

Connect create share link, public trip, copy trip, revoke link.

Exit condition:

Shared link opens in logged-out/incognito browser and exposes only allowed data.

---

## Phase 12 — Profile & preferences

Integrate real profile/preferences.

Exit condition:

Changes persist after refresh and feed recommendation generation.

---

## Phase 13 — Remove mock dependency

Search:

```bash
grep -R "@/mocks/db" frontend/src
```

Expected result for production app services:

```text
no service imports
```

Keep mock files only for tests/story development if needed.

---

# 32. Endpoint Checklist

## Auth

```text
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/logout
POST /api/v1/auth/refresh
GET  /api/v1/auth/me
```

## Dashboard

```text
GET /api/v1/dashboard/summary
```

## Trips

```text
GET    /api/v1/trips
POST   /api/v1/trips
GET    /api/v1/trips/:tripId
PATCH  /api/v1/trips/:tripId
DELETE /api/v1/trips/:tripId
```

## Stops

```text
POST   /api/v1/trips/:tripId/stops
PATCH  /api/v1/trips/:tripId/stops/:stopId
DELETE /api/v1/trips/:tripId/stops/:stopId
PUT    /api/v1/trips/:tripId/stops/reorder
```

## Days

```text
GET /api/v1/trips/:tripId/days
```

## Itinerary Items

```text
POST   /api/v1/trips/:tripId/days/:dayId/items
PATCH  /api/v1/trips/:tripId/days/:dayId/items/:itemId
DELETE /api/v1/trips/:tripId/days/:dayId/items/:itemId
PUT    /api/v1/trips/:tripId/days/:dayId/items/reorder
```

## Locations

```text
GET /api/v1/locations/search
GET /api/v1/locations/:id
```

## Catalog

```text
GET /api/v1/catalog/items
GET /api/v1/catalog/items/:id
```

## Budget

```text
GET    /api/v1/trips/:tripId/budget
PUT    /api/v1/trips/:tripId/budget
GET    /api/v1/trips/:tripId/budget/summary
GET    /api/v1/trips/:tripId/expenses       <-- add/verify
POST   /api/v1/trips/:tripId/expenses
PATCH  /api/v1/trips/:tripId/expenses/:expenseId
DELETE /api/v1/trips/:tripId/expenses/:expenseId
```

## Recommendations

```text
POST /api/v1/recommendations/generate
POST /api/v1/recommendations/:recId/feedback
```

## Sharing

```text
POST   /api/v1/trips/:tripId/share-links
GET    /api/v1/trips/:tripId/share-links
DELETE /api/v1/trips/:tripId/share-links/:linkId
GET    /api/v1/public/trips/:token
POST   /api/v1/public/trips/:token/copy
```

## Users

```text
GET   /api/v1/users/me/profile
PATCH /api/v1/users/me/profile
GET   /api/v1/users/me/preferences
PUT   /api/v1/users/me/preferences
```

## Reference

```text
GET /api/v1/reference/currencies
GET /api/v1/reference/categories
GET /api/v1/reference/expense-categories
```

---

# 33. Full End-to-End Acceptance Test

The application is not considered integrated merely because both servers start.

The final acceptance test must be executed from the browser.

## Test 1 — Account

1. Open `/signup`.
2. Register a new account.
3. Verify browser receives HTTP-only auth cookies.
4. Verify redirect to dashboard.
5. Refresh browser.
6. Verify user remains logged in.

## Test 2 — Create Trip

1. Click Plan a Trip.
2. Enter name, dates, budget, currency.
3. Search/select a real DB-backed city if first destination is enabled.
4. Submit.
5. Verify redirect to builder.
6. Verify Trip row in PostgreSQL.
7. Verify TripDay rows automatically exist.

## Test 3 — Multi-city itinerary

1. Add second stop.
2. Verify date validation.
3. Reorder stops.
4. Refresh page.
5. Verify same order persists.

## Test 4 — Activities

1. Search catalog for current city.
2. Apply filter.
3. Open activity details.
4. Add activity to Day 1.
5. Add another overlapping activity and verify warning behavior.
6. Refresh.
7. Verify persisted itinerary.

## Test 5 — Budget

1. Open Budget.
2. Verify estimated itinerary activity spend.
3. Add expense.
4. Edit expense.
5. Delete expense.
6. Verify summary/charts update.

## Test 6 — Recommendations

1. Generate recommendations.
2. Confirm real activity IDs.
3. Confirm reason + score + budget fit.
4. Add one recommendation.
5. Reject another.
6. Verify feedback rows if implemented.

## Test 7 — Timeline

1. Open timeline.
2. Verify real day grouping.
3. Verify time, duration and cost.
4. Ensure data matches Builder.

## Test 8 — Sharing

1. Create share link.
2. Open in incognito.
3. Verify read-only trip renders without login.
4. Verify no email/private expenses/internal IDs leak.
5. Login and Copy Trip.
6. Verify copied trip appears in My Trips.

## Test 9 — Profile

1. Update display name.
2. Update currency / travel preferences.
3. Refresh.
4. Verify persisted values.
5. Verify recommendation request uses current preferences indirectly through backend.

---

# 34. Build / Quality Gates

Before merging integration branch:

## Backend

```bash
cd backend
npm install
npx prisma generate
npm run build
npm test
```

Then start:

```bash
npm run dev
```

Check:

```text
GET /health/live
GET /health/ready
```

## Frontend

```bash
cd frontend
npm install
npm run build
```

If lint script is outdated for the installed Next.js version, fix the script/config rather than ignoring lint errors.

Then:

```bash
npm run dev
```

---

# 35. Do Not Do These During Integration

Do not:

- rebuild the frontend UI from zero;
- leave fake buttons that do nothing;
- create a second API client;
- use `fetch()` directly throughout page components;
- keep canonical city/activity data hardcoded after integration;
- use localStorage for long-lived auth tokens;
- create another Prisma client singleton;
- use both auth middlewares;
- return raw Prisma objects directly from public APIs;
- hide backend contract problems with frontend mocks;
- generate fake recommendation scores in the browser;
- assume USD/INR for every trip;
- let users access another user's trip by changing URL IDs;
- implement drag-only actions without accessible fallback.

---

# 36. Suggested Git Workflow

Use a dedicated integration branch:

```bash
git switch main
git pull origin main
git switch -c feat/fullstack-integration
```

Commit by domain instead of one giant commit:

```text
fix(backend): stabilize app bootstrap and route mounting
fix(auth): unify jwt cookie middleware
fix(api): standardize response envelopes
feat(trips): implement trip crud
feat(frontend): integrate trip services with api
feat(discovery): integrate locations and catalog
feat(itinerary): integrate stops days and activities
feat(budget): integrate expenses and summaries
feat(recommendations): connect recommendation flow
feat(sharing): connect public trip workflow
feat(profile): connect user settings and preferences
```

---

# 37. Definition of Done

GlobeTrotter integration is complete only when all conditions below are true:

- [ ] backend starts without syntax/import errors;
- [ ] PostgreSQL connects successfully;
- [ ] Prisma migrations/generation work;
- [ ] frontend builds successfully;
- [ ] CORS works from frontend origin;
- [ ] signup/login/me/logout work with HTTP-only cookies;
- [ ] frontend services no longer depend on mock DB for production features;
- [ ] dashboard reads real backend data;
- [ ] trip CRUD is real and persisted;
- [ ] multi-city stops persist;
- [ ] trip days are real;
- [ ] activities come from backend catalog;
- [ ] itinerary add/edit/delete/reorder persists;
- [ ] budget summary reads real DB values;
- [ ] expenses persist;
- [ ] recommendations use backend ranking;
- [ ] timeline reflects backend itinerary;
- [ ] public sharing works logged out;
- [ ] copy trip works after login;
- [ ] profile/preferences persist;
- [ ] users cannot access another user's private trip;
- [ ] loading/error/empty states still work;
- [ ] refresh does not lose application state that should be persisted;
- [ ] no major CTA is dead;
- [ ] end-to-end MVP acceptance flow passes.

---

# 38. Short Implementation Brief for an AI Coding Agent / Developer

Use the following as the execution instruction after reading this document:

> Inspect the existing GlobeTrotter repository before modifying anything. Preserve the current Next.js frontend and existing reusable UI components. First stabilize the Express backend, unify JWT cookie authentication, mount all existing route modules, standardize API envelopes, and replace the broken duplicated Trips module with real Trip CRUD. Then migrate each frontend service from `@/mocks/db` to the existing `apiClient`, using DTO mappers where backend relational structures differ from frontend view models. Implement only genuinely missing UI components or hooks, including stop/activity editing, reorder mutations, expense editing, reference-data selects, recommendation feedback, and optional share-link management. Do not create fake functionality or hardcoded canonical travel data. Every screen must operate on PostgreSQL-backed API data, preserve authentication with HTTP-only cookies, handle loading/error/empty states, and pass the full Signup → Create Trip → Add Stops → Add Activities → Budget → Recommendations → Timeline → Share → Copy Trip workflow. Run backend build, frontend build, migrations, and manual smoke tests before considering the work complete.

---

# Final Priority Summary

The most important work is **not more UI redesign**. The current frontend already has enough screen coverage for the MVP.

The actual priorities are:

1. fix backend bootstrap;
2. unify authentication;
3. mount all API modules;
4. fix response envelope consistency;
5. implement real Trip CRUD;
6. replace frontend mocks with `apiClient`;
7. normalize DTOs;
8. finish missing mutation hooks/actions;
9. verify persistence and authorization;
10. run the full end-to-end acceptance flow.

Once those ten items are complete, the existing UI becomes a real GlobeTrotter application instead of a polished frontend sitting over a mock data layer.
