import { serial, uuid as uuidColumn } from "drizzle-orm/pg-core";

export const id = () => serial("id").primaryKey();

export const uuid = (name = "uuid") =>
  uuidColumn(name).defaultRandom().notNull().unique();

export const fkUuid = (name: string) => uuidColumn(name).notNull();
