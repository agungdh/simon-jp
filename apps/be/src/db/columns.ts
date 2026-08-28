import { integer, serial, uuid as uuidColumn } from "drizzle-orm/pg-core";

export const id = () => serial("id").primaryKey();

export const uuid = (name = "uuid") =>
  uuidColumn(name).defaultRandom().notNull();

export const fkId = (name: string) => integer(name).notNull();
