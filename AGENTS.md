# AGENTS.md

Guidelines for AI agents and contributors working in this repository.

## Database conventions (Drizzle ORM + Postgres)

Every table MUST follow the dual-identifier pattern defined in
`apps/be/src/db/columns.ts`. Use the shared helpers — do not hand-declare
`serial`/`uuid` columns inline.

### Identifiers

- `id` — `serial` primary key. **Internal only.** Used for joins, FKs, and
  storage. NEVER exposed to the client (API responses, DTOs, types).
- `uuid` — `uuid` column, `default gen_random_uuid()`, `notNull`, `unique`,
  with a **hash index** (`index(...).using("hash", table.uuid)`). This is the
  public identifier used in DTOs and APIs.

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

### Foreign keys reference `uuid`, not `id`

- A FK column is named `<singular_entity>_uuid` (e.g. `user_uuid`,
  `post_uuid`). It references the parent's `uuid` column.
- The referenced `uuid` is already `unique`, so the FK is valid.
- Define FKs via the `fkUuid` helper + `.references(() => parent.uuid)`.

```ts
import { pgTable, text } from "drizzle-orm/pg-core";
import { id, uuid, fkUuid } from "./columns";
import { users } from "./users";

export const posts = pgTable("posts", {
  id: id(),
  uuid: uuid(),
  userUuid: fkUuid("user_uuid").references(() => users.uuid),
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
