# GlobeTrotter — RULE.md

## 1. What To Do
- Build from the approved documents, not from ad-hoc AI guesses.
- Keep PostgreSQL as source of truth.
- Keep travel catalog data out of frontend constants.
- Validate every request on backend.
- Mirror useful validation on frontend for UX.
- Use UUID/internal IDs for entities.
- Use decimal money + explicit currency.
- Use IANA timezones.
- Use transactions for multi-row business operations.
- Keep feature modules isolated.
- Add tests with each critical rule.
- Keep API errors structured and stable.
- Track completed work in MEMORY.md.

## 2. What To Avoid
- No city/activity arrays hardcoded in React.
- No fake API data after the integration phase.
- No LLM-generated canonical activity IDs.
- No floating-point DB money columns.
- No raw password/token logging.
- No business logic inside UI components.
- No direct DB access from frontend.
- No huge `utils.ts` dumping ground.
- No premature microservices.
- No Kubernetes for MVP.
- No Redis unless there is a clear cache/rate-limit/session use.
- No provider API call for every normal catalog search.
- No blind optimistic updates for destructive operations.
- No hiding backend errors with generic frontend “Something went wrong” when a useful safe message exists.

## 3. AI Coding Boundaries
AI may:
- scaffold boilerplate;
- propose code;
- write tests;
- refactor;
- explain errors;
- generate migrations after schema approval;
- generate API clients/types from approved contracts.

AI must not:
- silently change database architecture;
- invent endpoints not documented without flagging them;
- invent catalog data;
- replace secure auth with localStorage shortcuts;
- weaken validation to make tests pass;
- skip authorization;
- add dependencies without explaining why;
- alter recommendation weights/contracts silently;
- rewrite working modules wholesale when a targeted fix is sufficient.

Before AI changes a module:
1. read relevant requirements;
2. inspect current code;
3. list intended files;
4. implement;
5. run lint/typecheck/tests;
6. update MEMORY.md.

## 4. Error Handling Rules
Backend error taxonomy:
- `VALIDATION_ERROR`
- `AUTH_REQUIRED`
- `AUTH_INVALID`
- `FORBIDDEN`
- `NOT_FOUND`
- `CONFLICT`
- `RATE_LIMITED`
- domain errors e.g. `TRIP_DATE_INVALID`, `ITINERARY_OVERLAP`
- `INTERNAL_ERROR`

Frontend:
- field validation errors near inputs;
- business errors in context;
- page-level retry for failed fetch;
- toast for successful/failed mutation;
- never show raw stack traces.

## 5. Security Rules
- hash passwords;
- secure cookie auth preferred;
- rate-limit login and public share endpoints;
- authorize by resource ownership;
- sanitize logs;
- validate uploads;
- limit request body size;
- CORS allowlist;
- secrets only through environment/secret store;
- no secrets committed to Git.

## 6. Git Rules
- feature branches;
- small commits;
- never commit `.env`;
- migrations committed;
- lockfile committed;
- PR/check before merge when team workflow exists.

## 7. Definition of Done
A feature is not done until:
- UI exists;
- API integrated;
- server-side validation exists;
- authorization checked;
- loading/empty/error states exist;
- test for critical path exists;
- lint/typecheck pass;
- MEMORY.md updated.
