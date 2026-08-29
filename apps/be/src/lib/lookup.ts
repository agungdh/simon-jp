import { Elysia, t } from "elysia";
import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "../db";
import { HttpError } from "../plugins/error";
import { resolveAuth, authGuard } from "../plugins/auth";

export interface LookupColumn {
  key: string;
  label: string;
}

export interface LookupConfig {
  name: string;
  table: any;
  columns: LookupColumn[];
}

export function buildLookupModule(config: LookupConfig) {
  const { name, table, columns } = config;

  const responseShape: Record<string, any> = { uuid: t.String() };
  const bodyShape: Record<string, any> = {};
  for (const c of columns) {
    responseShape[c.key] = t.String();
    bodyShape[c.key] = t.String({ minLength: 1 });
  }

  const responseSchema = t.Object(responseShape);
  const bodySchema = t.Object(bodyShape);

  const repository = {
    async list() {
      const sel: any = { uuid: table.uuid };
      for (const c of columns) sel[c.key] = (table as any)[c.key];
      return db
        .select(sel)
        .from(table)
        .where(isNull((table as any).deletedAt))
        .orderBy(desc((table as any)[columns[0].key]));
    },

    async getByUuid(uuid: string) {
      const sel: any = { uuid: table.uuid };
      for (const c of columns) sel[c.key] = (table as any)[c.key];
      const [row] = await db
        .select(sel)
        .from(table)
        .where(and(eq(table.uuid, uuid), isNull((table as any).deletedAt)))
        .limit(1);
      if (!row) throw new HttpError(404, "Not found");
      return row;
    },

    async create(values: any) {
      const [row] = await db
        .insert(table)
        .values(values)
        .returning({ uuid: table.uuid });
      return row;
    },

    async update(uuid: string, values: any) {
      await this.getByUuid(uuid);
      await db.update(table).set(values).where(eq(table.uuid, uuid));
      return this.getByUuid(uuid);
    },

    async remove(uuid: string) {
      await this.getByUuid(uuid);
      await db
        .update(table)
        .set({ deletedAt: new Date() })
        .where(eq(table.uuid, uuid));
    },
  };

  const controller = new Elysia()
    .derive(resolveAuth)
    .onBeforeHandle(authGuard)
    .get(`/${name}`, () => repository.list(), {
      response: t.Array(responseSchema),
    })
    .get(`/${name}/:uuid`, ({ params }) => repository.getByUuid(params.uuid), {
      response: responseSchema,
    })
    .post(
      `/${name}`,
      ({ body, auth }: any) => {
        if (auth!.tipe !== "admin") throw new HttpError(403, "Forbidden");
        return repository.create(body);
      },
      { body: bodySchema, response: responseSchema },
    )
    .put(
      `/${name}/:uuid`,
      ({ params, body, auth }: any) => {
        if (auth!.tipe !== "admin") throw new HttpError(403, "Forbidden");
        return repository.update(params.uuid, body);
      },
      { body: bodySchema, response: responseSchema },
    )
    .delete(`/${name}/:uuid`, ({ params, auth }: any) => {
      if (auth!.tipe !== "admin") throw new HttpError(403, "Forbidden");
      repository.remove(params.uuid);
      return { message: "Deleted" };
    });

  return { repository, controller };
}
