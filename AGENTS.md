# AGENTS.md

Guidelines for AI agents and contributors working in this repository.

## Backend structure (clean architecture)

The `apps/be/src` backend follows a Spring-Boot-style, per-feature (per-module)
clean architecture. Each domain lives in its own folder under `src/modules/`
with the layers strictly separated:

```
src/modules/<feature>/
  <feature>.entity.ts       # DB model (Drizzle table definition)
  <feature>.dto.ts          # request/response schemas (Elysia `t`) + inferred types
  <feature>.repository.ts   # data-access only — all Drizzle queries live here
  <feature>.service.ts      # business logic — calls the repository, never the DB
  <feature>.controller.ts   # thin Elysia route — wires HTTP ↔ service
  index.ts                  # re-exports the Elysia group as `<feature>Routes`
```

Rules:

- **Controllers never touch the DB or Drizzle directly.** They receive the
  request, call a service method, and shape the response. Route validation uses
  Elysia `t.*` schemas supplied via the `body`/`response` options.
- **Services contain business logic** and depend on repositories, not on
  `db`. A service may throw `HttpError` (from `src/plugins/error.ts`) to signal
  HTTP errors — do NOT set `set.status` inside services.
- **Repositories own all Drizzle queries** (select/insert/update/delete), filter
  out soft-deleted rows by default (`deleted_at IS NULL`), and return only
  public columns: `uuid` (never `id`), and for every foreign key the parent's
  `uuid` exposed as `<entity>Uuid` (resolved via JOIN), never `id` / `<x>_id` /
  `<x>_by`.
- Cross-feature data access reuses the other module's repository (e.g.
  `auth` calls `userRepository.findByNip`), never another module's controller.
- `src/db/` holds shared infra only: `columns.ts` (id/uuid/fkId helpers),
  `schema.ts` (re-exports every `<feature>.entity.ts` so drizzle-kit still sees
  the whole schema), `index.ts` (drizzle client), `seed.ts`.
- `src/plugins/` holds cross-cutting Elysia plugins: `auth.ts` (session
  resolution + guard) and `error.ts` (global error handler).
- `src/lib/` holds framework-agnostic helpers (`token.ts`, `cookie.ts`,
  `valkey.ts`).

### Adding a new feature

1. Create `src/modules/<feature>/` with the four layers + `index.ts`.
2. Define the table in `<feature>.entity.ts` (see DB conventions below) and
   re-export it from `src/db/schema.ts` so migrations/introspection pick it up.
3. Mount it in `src/app.ts`: `import { <feature>Routes } from "./modules/<feature>"`
   then `.use(<feature>Routes)`.

## Database conventions (Drizzle ORM + Postgres, Postgres-only)

Every table MUST follow the dual-identifier + audit pattern defined in
`apps/be/src/db/columns.ts`. Use the shared helpers — do not hand-declare
`serial`/`uuid`/`timestamp` columns inline. The schema targets Postgres only, so
optimize for it: hash indexes for `uuid` equality, `timestamptz` everywhere, and
partial indexes for soft-delete-safe uniqueness.

### Identifiers

- `id` — `serial` primary key. **Internal only.** Used for storage and FK
  targets. NEVER exposed to the client (API responses, DTOs, types).
- `uuid` — `uuid` column, `default gen_random_uuid()`, `notNull`, with a
  **hash index** (`index(...).using("hash", table.uuid)`). NOT unique (uuid v4
  is unique enough). This is the public identifier used in DTOs and APIs.
- `<entity>_id` — foreign key column (integer) referencing the parent's `id`
  (the serial PK). **Internal only**, never exposed. In the API it is surfaced
  as `<Entity>Uuid` (the parent's `uuid`), resolved via JOIN in the repository.

Rule of thumb: the client only ever sees `uuid` and `*Uuid`. `id` / `*_id` /
`*_by` stay server-side.

### Audit columns (required on every table)

Every table MUST carry these six columns (use the shared helpers from
`columns.ts`):

- `createdAt` — `timestamptz`, `default now()`, notNull.
- `createdBy` — `integer` referencing `users.id`, nullable (system/seed rows
  have no creator). **Not indexed.**
- `updatedAt` — `timestamptz`, `default now()`, notNull.
- `updatedBy` — `integer` referencing `users.id`, nullable. **Not indexed.**
- `deletedAt` — `timestamptz`, nullable. `NULL` = active, non-`NULL` =
  soft-deleted.
- `deletedBy` — `integer` referencing `users.id`, nullable. **Not indexed.**

The `*_by` columns conceptually reference `users.id`. For **cross-table** FKs
(e.g. `post.userId → users.id`) use `.references(() => parent.id)`. For the
audit `*_by` columns on the `users` table itself, omit `.references` — a
self-reference makes TS infer `users` as circular/`any`. Postgres does NOT
auto-create an index on the child side, so "no index" still holds. They are
never exposed in DTOs.

### Soft delete

- A row is "deleted" when `deleted_at IS NOT NULL`.
- **Repositories MUST filter soft-deleted rows by default**: append
  `where(isNull(table.deletedAt))` to every `select`/`update`/`delete` unless the
  query explicitly needs tombstones (e.g. an admin restore flow).
- Inserts set `created_at`/`created_by` and `updated_at`/`updated_by` (from the
  authenticated user's `users.id`); `deleted_at`/`deleted_by` stay `NULL`.
  Updates bump `updated_at`/`updated_by`. Deletes set `deleted_at`/`deleted_by`
  — never a hard `delete`.

### How to define a table

The table definition lives in `src/modules/<feature>/<feature>.entity.ts`. Then
`src/db/schema.ts` re-exports every entity so drizzle-kit still sees the full
schema (do NOT put raw `pgTable` definitions directly in `db/schema.ts`):

```ts
// src/modules/user/user.entity.ts
import { index, pgTable, text, uniqueIndex, sql } from "drizzle-orm/pg-core";
import {
  createdAt, createdBy, deletedAt, deletedBy,
  id, updatedAt, updatedBy, uuid,
} from "../../db/columns";

export const users = pgTable(
  "users",
  {
    id: id(),
    uuid: uuid(),
    nip: text("nip").notNull(),
    password: text("password").notNull(),
    nama: text("nama").notNull(),
    createdAt: createdAt(),
    createdBy: createdBy(),
    updatedAt: updatedAt(),
    updatedBy: updatedBy(),
    deletedAt: deletedAt(),
    deletedBy: deletedBy(),
  },
  (table) => ({
    uuidIdx: index("users_uuid_idx").using("hash", table.uuid),
  }),
);
```

```ts
// src/db/schema.ts
export { users } from "../modules/user/user.entity";
```

### Foreign keys reference `id`, not `uuid`

- `uuid` is intentionally NOT unique (only hash-indexed), so a foreign key
  **cannot** reference it — Postgres requires the referenced column to be
  `unique` or a `PK`.
- A FK column is therefore named `<singular_entity>_id` (e.g. `user_id`,
  `post_id`) and references the parent's `id` (the serial PK). This is fine:
  FKs are internal and never leave the server, so the "never expose `id`" rule
  still holds.
- Define FKs via the `fkId` helper + `.references(() => parent.id)`.

```ts
import { pgTable, text } from "drizzle-orm/pg-core";
import { id, uuid, fkId } from "../../db/columns";
import { users } from "../user/user.entity";

export const posts = pgTable("posts", {
  id: id(),
  uuid: uuid(),
  userId: fkId("user_id").references(() => users.id),
  title: text("title").notNull(),
  createdAt: createdAt(),
  createdBy: createdBy().references(() => users.id),
  updatedAt: updatedAt(),
  updatedBy: updatedBy().references(() => users.id),
  deletedAt: deletedAt(),
  deletedBy: deletedBy().references(() => users.id),
});
```

### DTOs / API responses

- Request/response schemas live in `src/modules/<feature>/<feature>.dto.ts`,
  defined with Elysia's `t.*` builders plus a `typeof x.static` type alias.
  Response bodies are **standard JSON in camelCase** (e.g. `createdAt`,
  `userUuid`).
  ```ts
  import { t } from "elysia";
  export const userResponseSchema = t.Object({
    uuid: t.String(),
    nip: t.String(),
    nama: t.String(),
    createdAt: t.Date(),
  });
  export type UserResponse = typeof userResponseSchema.static;
  ```
- Controllers pass these to the route's `body`/`response` options so endpoints
  are validated and auto-documented by Swagger.
- Select and return `uuid` (and other fields) explicitly. Never return the raw
  `db.select().from(table)` row — it leaks `id`. Repositories do this
  projection so services/controllers never see `id`.
- For a foreign key, expose the parent's `uuid` as `<Entity>Uuid`, resolved by
  JOIN in the repository — never the raw `<entity>_id`:
  ```ts
  db.select({
    uuid: posts.uuid,
    title: posts.title,
    userUuid: users.uuid, // surfaced as userUuid in the DTO, NOT userId
  })
  .from(posts)
  .innerJoin(users, eq(posts.userId, users.id))
  .where(isNull(posts.deletedAt));
  ```
  ```ts
  // DTO
  export const postResponseSchema = t.Object({
    uuid: t.String(),
    title: t.String(),
    userUuid: t.String(),
  });
  ```

### Unique constraints → partial indexes (soft-delete-safe)

Any column that must be unique (e.g. `nip`, `email`) MUST be enforced with a
**partial unique index** that ignores soft-deleted rows, so a deleted row never
blocks re-creating the same value:

```ts
import { uniqueIndex, sql } from "drizzle-orm/pg-core";

uniqueIndex("users_nip_active_uniq")
  .on(table.nip)
  .where(sql`${table.deletedAt} IS NULL`);
```

### Postgres optimization notes

- All timestamps use `timestamptz` (timezone-aware), never bare `timestamp`.
- `uuid` gets a **hash index** — equality lookups (`WHERE uuid = $1`) are the
  only access pattern, and hash indexes are smaller/faster for equality than a
  B-tree.
- FKs are narrow `integer` → `id`, keeping joins cheap; child-side `*_by`
  columns are intentionally unindexed.
- Unique constraints are partial on `deleted_at IS NULL`.

### Migrations

- After editing the schema run `bun run db:generate` then `bun run db:migrate`
  (from `apps/be`). Never hand-edit generated SQL unless adding a hash index
  that drizzle-kit cannot express — prefer `.using("hash", ...)` in the schema.
- For a clean reset (early-stage schema churn): delete `apps/be/drizzle/*.sql`
  and `apps/be/drizzle/meta/`, run `bun run db:generate` to emit a fresh `0000`,
  then `make db-reset` (wipes the Postgres volume) + `make db-seed`.

## Auth conventions

- **Opaque token** (random 32-byte hex), NOT JWT. Token is stored in Valkey
  under key `session:<token>` with a 7-day TTL (`src/lib/token.ts`). The TTL is
  **sliding** — every authenticated request calls `getSession`, which runs
  `EXPIRE` to reset the TTL back to 7 days. 7 days of inactivity = expiry.
- The token is delivered two ways (nginx strips `/api` and proxies the rest to
  BE; FE serves everything else):
  - **Bearer** header `Authorization: Bearer <token>` — for mobile + desktop.
  - **HttpOnly cookie** `session=<token>` (`SameSite=Lax`, `Secure` in prod) —
    for web browsers. Internally routes have no `/api` prefix (e.g.
    `/auth/login`); externally they are reached at `/api/auth/login`.
- `extractSessionToken(req)` reads Bearer first, then the cookie. Session
  resolution uses the shared `resolveAuth` helper from `src/plugins/auth.ts`.
  In a controller, apply it via `.derive(resolveAuth)` then
  `.onBeforeHandle(authGuard)` (both exported from `src/plugins/auth.ts`). The
  guard returns `401` when `ctx.auth` is null. `id` is never used as the token
  subject — only `uuid`.
- Note: in this Elysia version, `.use(plugin)` does **not** propagate the
  derived `auth` type into handler context, so resolve/guard are applied
  directly on the controller instance (`.derive(...)`), not via a wrapping
  plugin. The `auth` plugin in `src/plugins/auth.ts` is the *optional* variant
  (does not reject unauthenticated requests).
- Never expose `password` in any response.
- Valkey connection (`src/lib/valkey.ts`) reads `VALKEY_HOST` / `VALKEY_PORT` /
  `VALKEY_PASSWORD` (defaults `localhost` / `6379` / `admin`).
- Seeding: `make db-seed` (or `bun run db:seed`) inserts a default user using
  `Bun.password.hash`. Credentials from `SEED_NIP` / `SEED_PASSWORD`.

## Error handling

- Business logic signals HTTP failures by throwing `HttpError` (from
  `src/plugins/error.ts`): `throw new HttpError(401, "Invalid nip or password")`.
  Services must NOT set `set.status` themselves — let the global handler do it.
- `src/plugins/error.ts` exports an `errorHandler` callback (mounted once in
  `src/app.ts` via `.onError(errorHandler)`) that maps any thrown `HttpError` to
  its `status` + `{ message }` body, and everything else to `500`
  `{ message: "Internal Server Error" }` (this is the Elysia equivalent of a
  Spring `@ControllerAdvice` / `@ExceptionHandler`). Do NOT wrap it in a
  `.use()` plugin — Elysia fails to JSON-serialize `onError` return values that
  come from a nested plugin, sending plain text instead.
- **Validation errors** (Elysia `ValidationError`, status `422`) are normalized
  by `errorHandler` into a flat per-field shape the frontend can render directly:
  ```json
  { "message": "Validation failed", "errors": { "nip": "NIP wajib diisi", "password": "Password wajib diisi" } }
  ```
  Request schemas enforce constraints via Elysia `t.*` (e.g.
  `t.String({ minLength: 1 })`). The frontend only displays the messages — all
  validation lives on the BE.

## API docs (Swagger)

- `@elysiajs/swagger` is mounted in `src/app.ts` at `/docs`
  (UI) and `/docs/json` (OpenAPI spec). Routes have **no** `/api` prefix —
  nginx strips `/api` and proxies the rest to the BE, so the docs are
  reachable at `/api/docs` from the outside.
- Route validation uses Elysia's `t.*` schemas so endpoints are documented
  automatically — keep request/response schemas explicit.
