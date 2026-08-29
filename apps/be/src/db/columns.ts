import { integer, serial, timestamp, uuid as uuidColumn } from "drizzle-orm/pg-core";

export const id = () => serial("id").primaryKey();

export const uuid = (name = "uuid") =>
  uuidColumn(name).defaultRandom().notNull();

export const fkId = (name: string) => integer(name).notNull();

export const createdAt = () =>
  timestamp("created_at", { withTimezone: true }).defaultNow().notNull();

export const updatedAt = () =>
  timestamp("updated_at", { withTimezone: true }).defaultNow().notNull();

export const deletedAt = () =>
  timestamp("deleted_at", { withTimezone: true });

export const createdBy = () => integer("created_by");

export const updatedBy = () => integer("updated_by");

export const deletedBy = () => integer("deleted_by");
