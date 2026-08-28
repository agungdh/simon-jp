# AGENTS.md

Guidelines for AI agents and contributors working in this repository.

## Database conventions (Drizzle ORM + Postgres)

Every table MUST follow the dual-identifier pattern defined in
`apps/be/src/db/columns.ts`. Use the shared helpers — do not hand-declare
`serial`/`uuid` columns inline.

### Identifiers

- `id` — `serial` primary key. **Internal only.** Used for joins, FKs, and
  storage. NEVER exposed to the client (API responses, DTOs, types).
- `uuid` — `uuid` column, `default gen_random_uuid()`, `notNull`, with a
  **hash index** (`index(...).using("hash", table.uuid)`). NOT unique. This is
  the public identifier used in DTOs and APIs. Uniqueness is enforced by the
  app layer / default, not a DB unique constraint.

Rule of thumb: the client only ever sees `uuid`. `id` stays server-side.

### How to define a table

```ts
import { index, pgTable, text } from "drizzle-orm/pg-core";
import { id, uuid } from "./columns";

export const users = pgTable(
  "users",
  {
    id: id(),
    uuid: uuid(),
    name: text("name").notNull(),
  },
  (table) => ({
    uuidIdx: index("users_uuid_idx").using("hash", table.uuid),
  }),
);
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
import { id, uuid, fkId } from "./columns";
import { users } from "./users";

export const posts = pgTable("posts", {
  id: id(),
  uuid: uuid(),
  userId: fkId("user_id").references(() => users.id),
  title: text("title").notNull(),
});
```

### DTOs / API responses

- Select and return `uuid` (and other fields) explicitly. Never return the raw
  `db.select().from(table)` row, since that leaks `id`.
- Prefer explicit column projection:

```ts
db.select({ uuid: users.uuid, name: users.name }).from(users);
```

### Migrations

- After editing the schema run `bun run db:generate` then `bun run db:migrate`
  (from `apps/be`). Never hand-edit generated SQL unless adding a hash index
  that drizzle-kit cannot express — prefer `.using("hash", ...)` in the schema.

## Auth conventions

- **Opaque token** (random 32-byte hex), NOT JWT. Token is stored in Valkey
  under key `session:<token>` with a 7-day TTL (`src/lib/token.ts`).
- The token is delivered two ways (nginx proxies `/api` to BE, rest to FE):
  - **Bearer** header `Authorization: Bearer <token>` — for mobile + desktop.
  - **HttpOnly cookie** `session=<token>` (`SameSite=Lax`, `Secure` in prod) —
    for web browsers.
- `extractSessionToken(req)` reads Bearer first, then the cookie. Each protected
  route plugin resolves the Valkey session into `ctx.auth`
  (`{ uuid, nip, nama }`) via its own `.resolve(...)`, then an `.onBeforeHandle`
  returns `401` when `ctx.auth` is null. See `src/routes/users.ts` for the
  pattern, or reuse `src/plugins/auth.ts` (`auth` plugin, optional auth). `id` is
  never used as the token subject — only `uuid`.
- Never expose `password` in any response.
- Valkey connection (`src/lib/valkey.ts`) reads `VALKEY_HOST` / `VALKEY_PORT` /
  `VALKEY_PASSWORD` (defaults `localhost` / `6379` / `admin`).
- Seeding: `make db-seed` (or `bun run db:seed`) inserts a default user using
  `Bun.password.hash`. Credentials from `SEED_NIP` / `SEED_PASSWORD`.
