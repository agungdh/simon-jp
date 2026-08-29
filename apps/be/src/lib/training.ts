import { Elysia, t } from "elysia";
import { and, desc, eq, ilike, isNull, or, sql } from "drizzle-orm";
import { db } from "../db";
import { HttpError } from "../plugins/error";
import { resolveAuth, authGuard } from "../plugins/auth";
import { users } from "../modules/user/user.entity";
import { jenisPelatihans } from "../modules/jenis-pelatihan/jenis-pelatihan.entity";
import {
  getPresignedPutUrl,
  getPresignedGetUrl,
  deleteObject,
} from "../lib/s3";

export interface TrainingColumnConfig {
  materi: string;
  jam: string;
  dateMode: "single" | "range";
  singleDate?: string;
  dari?: string;
  sampai?: string;
  nomorSurat?: string;
  jenisPelatihan?: string;
  filename?: boolean;
}

export interface TrainingConfig {
  name: string;
  table: any;
  owner: boolean;
  adminOnlyWrite: boolean;
  columns: TrainingColumnConfig;
  bulkCreate?: boolean;
}

export function buildTrainingModule(config: TrainingConfig) {
  const { name, table, owner, adminOnlyWrite, columns: c, bulkCreate } = config;

  const responseShape: Record<string, any> = { uuid: t.String() };
  if (owner) responseShape.userUuid = t.String();
  if (c.nomorSurat) responseShape[c.nomorSurat] = t.String();
  responseShape[c.materi] = t.String();
  if (c.dateMode === "single") responseShape[c.singleDate!] = t.String();
  else {
    responseShape[c.dari!] = t.String();
    responseShape[c.sampai!] = t.String();
  }
  responseShape[c.jam] = t.Number();
  if (c.jenisPelatihan) responseShape.jenisPelatihanUuid = t.String();
  if (c.filename) responseShape.filename = t.Nullable(t.String());

  const createShape: Record<string, any> = {};
  if (owner) createShape.userUuid = t.Optional(t.String());
  if (c.nomorSurat) createShape[c.nomorSurat] = t.String();
  createShape[c.materi] = t.String({ minLength: 1 });
  if (c.dateMode === "single") createShape[c.singleDate!] = t.String();
  else {
    createShape[c.dari!] = t.String();
    createShape[c.sampai!] = t.String();
  }
  createShape[c.jam] = t.Number();
  if (c.jenisPelatihan) createShape.jenisPelatihanUuid = t.String();

  const updateShape: Record<string, any> = {};
  if (owner) updateShape.userUuid = t.Optional(t.String());
  if (c.nomorSurat) updateShape[c.nomorSurat] = t.Optional(t.String());
  updateShape[c.materi] = t.Optional(t.String());
  if (c.dateMode === "single")
    updateShape[c.singleDate!] = t.Optional(t.String());
  else {
    updateShape[c.dari!] = t.Optional(t.String());
    updateShape[c.sampai!] = t.Optional(t.String());
  }
  updateShape[c.jam] = t.Optional(t.Number());
  if (c.jenisPelatihan)
    updateShape.jenisPelatihanUuid = t.Optional(t.String());
  if (c.filename) updateShape.filename = t.Optional(t.String());

  const responseSchema = t.Object(responseShape);
  const createSchema = t.Object(createShape);
  const updateSchema = t.Object(updateShape);

  const listQuerySchema = t.Object({
    tahun: t.Optional(t.Number()),
    search: t.Optional(t.String()),
  });

  const repository = {
    async resolveUserId(uuid: string): Promise<number> {
      try {
        const [row] = await db
          .select({ id: users.id })
          .from(users)
          .where(and(eq(users.uuid, uuid), isNull(users.deletedAt)))
          .limit(1);
        if (!row) throw new Error("not found");
        return row.id;
      } catch (e) {
        if (e instanceof HttpError) throw e;
        throw new HttpError(400, "userUuid tidak valid");
      }
    },

    async resolveJenisPelatihanId(uuid: string): Promise<number> {
      try {
        const [row] = await db
          .select({ id: jenisPelatihans.id })
          .from(jenisPelatihans)
          .where(
            and(
              eq(jenisPelatihans.uuid, uuid),
              isNull(jenisPelatihans.deletedAt),
            ),
          )
          .limit(1);
        if (!row) throw new Error("not found");
        return row.id;
      } catch (e) {
        if (e instanceof HttpError) throw e;
        throw new HttpError(400, "jenisPelatihanUuid tidak valid");
      }
    },

    buildSelect() {
      const sel: any = { uuid: table.uuid };
      if (owner) sel.userUuid = users.uuid;
      if (c.nomorSurat) sel[c.nomorSurat] = (table as any)[c.nomorSurat];
      sel[c.materi] = (table as any)[c.materi];
      if (c.dateMode === "single")
        sel[c.singleDate!] = (table as any)[c.singleDate!];
      else {
        sel[c.dari!] = (table as any)[c.dari!];
        sel[c.sampai!] = (table as any)[c.sampai!];
      }
      sel[c.jam] = (table as any)[c.jam];
      if (c.jenisPelatihan) sel.jenisPelatihanUuid = jenisPelatihans.uuid;
      if (c.filename) sel.filename = (table as any).filename;
      return sel;
    },

    applyJoins(q: any) {
      if (owner) q = q.innerJoin(users, eq((table as any).userId, users.id));
      if (c.jenisPelatihan)
        q = q.innerJoin(
          jenisPelatihans,
          eq((table as any)[c.jenisPelatihan], jenisPelatihans.id),
        );
      return q;
    },

    async list(opts: {
      userId?: number;
      isAdmin: boolean;
      tahun?: number;
      search?: string;
    }) {
      let q = this.applyJoins(db.select(this.buildSelect()).from(table));
      const wheres: any[] = [isNull((table as any).deletedAt)];
      if (owner && !opts.isAdmin)
        wheres.push(eq((table as any).userId, opts.userId!));
      if (opts.tahun) {
        const dateCol =
          c.dateMode === "single"
            ? (table as any)[c.singleDate!]
            : (table as any)[c.dari!];
        wheres.push(sql`EXTRACT(YEAR FROM ${dateCol}) = ${opts.tahun}`);
      }
      if (opts.search) {
        const like = `%${opts.search}%`;
        const conds = [ilike((table as any)[c.materi], like)];
        if (c.nomorSurat) conds.push(ilike((table as any)[c.nomorSurat], like));
        wheres.push(or(...conds));
      }
      q = q.where(and(...wheres));
      const orderCol =
        c.dateMode === "single"
          ? (table as any)[c.singleDate!]
          : (table as any)[c.dari!];
      q = q.orderBy(desc(orderCol));
      return q;
    },

    async getByUuid(uuid: string, userId?: number, isAdmin = false) {
      let q = this.applyJoins(db.select(this.buildSelect()).from(table));
      const [row] = await q
        .where(and(eq(table.uuid, uuid), isNull((table as any).deletedAt)))
        .limit(1);
      if (!row) throw new HttpError(404, "Not found");
      if (owner && !isAdmin && row.userId !== userId)
        throw new HttpError(403, "Forbidden");
      return row;
    },

    async create(data: any, userId: number, isAdmin: boolean) {
      if (adminOnlyWrite && !isAdmin) throw new HttpError(403, "Forbidden");
      const values: any = {};
      if (owner) {
        const targetUserId =
          isAdmin && data.userUuid
            ? await this.resolveUserId(data.userUuid)
            : userId;
        values.userId = targetUserId;
      }
      if (c.nomorSurat) values[c.nomorSurat] = data[c.nomorSurat];
      values[c.materi] = data[c.materi];
      if (c.dateMode === "single")
        values[c.singleDate!] = data[c.singleDate!];
      else {
        values[c.dari!] = data[c.dari!];
        values[c.sampai!] = data[c.sampai!];
      }
      values[c.jam] = data[c.jam];
      if (c.jenisPelatihan)
        values[c.jenisPelatihan] = await this.resolveJenisPelatihanId(
          data.jenisPelatihanUuid,
        );
      if (c.filename) values.filename = data.filename ?? null;
      const [row] = await db
        .insert(table)
        .values(values)
        .returning({ uuid: table.uuid });
      return this.getByUuid(row.uuid, userId, isAdmin);
    },

    async bulkCreate(body: any, _userId: number, isAdmin: boolean) {
      if (!isAdmin) throw new HttpError(403, "Forbidden");
      const uuids: string[] = body.userUuids;
      if (!Array.isArray(uuids) || uuids.length === 0)
        throw new HttpError(400, "userUuids wajib diisi");
      const values: any[] = [];
      for (const u of uuids) {
        const v: any = { userId: await this.resolveUserId(u) };
        if (c.nomorSurat) v[c.nomorSurat] = body[c.nomorSurat];
        v[c.materi] = body[c.materi];
        if (c.dateMode === "single")
          v[c.singleDate!] = body[c.singleDate!];
        else {
          v[c.dari!] = body[c.dari!];
          v[c.sampai!] = body[c.sampai!];
        }
        v[c.jam] = body[c.jam];
        values.push(v);
      }
      return db.insert(table).values(values).returning({ uuid: table.uuid });
    },

    async update(uuid: string, data: any, userId: number, isAdmin: boolean) {
      const [existing] = await db
        .select({ id: table.id, userId: (table as any).userId })
        .from(table)
        .where(and(eq(table.uuid, uuid), isNull((table as any).deletedAt)))
        .limit(1);
      if (!existing) throw new HttpError(404, "Not found");
      if (adminOnlyWrite && !isAdmin) throw new HttpError(403, "Forbidden");
      if (owner && !isAdmin && existing.userId !== userId)
        throw new HttpError(403, "Forbidden");

      const values: any = {};
      if (c.nomorSurat && data[c.nomorSurat] !== undefined)
        values[c.nomorSurat] = data[c.nomorSurat];
      if (data[c.materi] !== undefined) values[c.materi] = data[c.materi];
      if (c.dateMode === "single") {
        if (data[c.singleDate!] !== undefined)
          values[c.singleDate!] = data[c.singleDate!];
      } else {
        if (data[c.dari!] !== undefined) values[c.dari!] = data[c.dari!];
        if (data[c.sampai!] !== undefined) values[c.sampai!] = data[c.sampai!];
      }
      if (data[c.jam] !== undefined) values[c.jam] = data[c.jam];
      if (c.jenisPelatihan && data.jenisPelatihanUuid !== undefined)
        values[c.jenisPelatihan] = await this.resolveJenisPelatihanId(
          data.jenisPelatihanUuid,
        );
      if (c.filename && data.filename !== undefined)
        values.filename = data.filename ?? null;
      if (owner && isAdmin && data.userUuid)
        values.userId = await this.resolveUserId(data.userUuid);

      if (Object.keys(values).length > 0)
        await db.update(table).set(values).where(eq(table.uuid, uuid));
      return this.getByUuid(uuid, userId, isAdmin);
    },

    async remove(uuid: string, userId: number, isAdmin: boolean) {
      const sel: any = { id: table.id, userId: (table as any).userId };
      if (c.filename) sel.filename = (table as any).filename;
      const [existing] = await db
        .select(sel)
        .from(table)
        .where(and(eq(table.uuid, uuid), isNull((table as any).deletedAt)))
        .limit(1);
      if (!existing) throw new HttpError(404, "Not found");
      if (adminOnlyWrite && !isAdmin) throw new HttpError(403, "Forbidden");
      if (owner && !isAdmin && existing.userId !== userId)
        throw new HttpError(403, "Forbidden");
      if (c.filename && existing.filename) {
        try {
          await deleteObject(`${name}/${uuid}`);
        } catch {
          /* ignore cleanup failure */
        }
      }
      await db
        .update(table)
        .set({ deletedAt: new Date() })
        .where(eq(table.uuid, uuid));
    },

    async presignFile(
      uuid: string,
      userId: number,
      isAdmin: boolean,
      body: { fileName: string; contentType?: string },
    ) {
      await this.getByUuid(uuid, userId, isAdmin);
      const key = `${name}/${uuid}`;
      const url = await getPresignedPutUrl(key, body.contentType);
      return { url, key, method: "PUT" };
    },

    async getFileUrl(uuid: string, userId: number, isAdmin: boolean) {
      const [row] = await db
        .select({ userId: (table as any).userId, filename: (table as any).filename })
        .from(table)
        .where(and(eq(table.uuid, uuid), isNull((table as any).deletedAt)))
        .limit(1);
      if (!row) throw new HttpError(404, "Not found");
      if (owner && !isAdmin && row.userId !== userId)
        throw new HttpError(403, "Forbidden");
      if (!row.filename) throw new HttpError(404, "File tidak tersedia");
      const key = `${name}/${uuid}`;
      return { downloadUrl: await getPresignedGetUrl(key) };
    },
  };

  let controller: any = new Elysia()
    .derive(resolveAuth)
    .onBeforeHandle(authGuard)
    .get(
      `/${name}`,
      ({ query, auth }: any) =>
        repository.list({
          userId: auth!.id,
          isAdmin: auth!.tipe === "admin",
          tahun: query.tahun ? Number(query.tahun) : undefined,
          search: query.search,
        }),
      { query: listQuerySchema, response: t.Array(responseSchema) },
    )
    .get(
      `/${name}/:uuid`,
      ({ params, auth }: any) =>
        repository.getByUuid(params.uuid, auth!.id, auth!.tipe === "admin"),
      { response: responseSchema },
    )
    .post(
      `/${name}`,
      ({ body, auth }: any) =>
        repository.create(body, auth!.id, auth!.tipe === "admin"),
      { body: createSchema, response: responseSchema },
    )
    .post(
      `/${name}/bulk`,
      ({ body, auth }: any) => {
        if (!bulkCreate) throw new HttpError(404, "Not found");
        return repository.bulkCreate(body, auth!.id, auth!.tipe === "admin");
      },
      {
        body: t.Object({
          userUuids: t.Array(t.String()),
          ...createShape,
        }),
        response: t.Array(t.Object({ uuid: t.String() })),
      },
    )
    .put(
      `/${name}/:uuid`,
      ({ params, body, auth }: any) =>
        repository.update(
          params.uuid,
          body,
          auth!.id,
          auth!.tipe === "admin",
        ),
      { body: updateSchema, response: responseSchema },
    )
    .delete(`/${name}/:uuid`, ({ params, auth }: any) => {
      repository.remove(params.uuid, auth!.id, auth!.tipe === "admin");
      return { message: "Deleted" };
    });

  if (c.filename) {
    controller = controller
      .post(
        `/${name}/:uuid/presign`,
        ({ params, body, auth }: any): any =>
          repository.presignFile(
            params.uuid,
            auth!.id,
            auth!.tipe === "admin",
            body,
          ),
        {
          body: t.Object({
            fileName: t.String(),
            contentType: t.Optional(t.String()),
          }),
          response: t.Object({
            url: t.String(),
            key: t.String(),
            method: t.String(),
          }),
        },
      )
      .get(
        `/${name}/:uuid/file`,
        ({ params, auth }: any): any =>
          repository.getFileUrl(params.uuid, auth!.id, auth!.tipe === "admin"),
        { response: t.Object({ downloadUrl: t.String() }) },
      );
  }

  return { repository, controller };
}
