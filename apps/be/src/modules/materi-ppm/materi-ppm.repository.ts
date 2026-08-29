import { db } from "../../db";
import { and, desc, eq, isNull } from "drizzle-orm";
import { materiPpms } from "./materi-ppm.entity";

export const materiPpmRepository = {
  async list() {
    return db
      .select()
      .from(materiPpms)
      .where(isNull(materiPpms.deletedAt))
      .orderBy(desc(materiPpms.tanggalPelaksanaan));
  },

  async getByUuid(uuid: string) {
    const [row] = await db
      .select()
      .from(materiPpms)
      .where(and(eq(materiPpms.uuid, uuid), isNull(materiPpms.deletedAt)))
      .limit(1);
    return row;
  },

  async create(values: any) {
    const [row] = await db
      .insert(materiPpms)
      .values(values)
      .returning({ uuid: materiPpms.uuid });
    return row;
  },

  async update(uuid: string, values: any) {
    await db
      .update(materiPpms)
      .set(values)
      .where(eq(materiPpms.uuid, uuid));
    return this.getByUuid(uuid);
  },

  async remove(uuid: string) {
    await db
      .update(materiPpms)
      .set({ deletedAt: new Date() })
      .where(eq(materiPpms.uuid, uuid));
  },
};
