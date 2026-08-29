import { buildLookupModule } from "../../lib/lookup";
import { jenisPelatihanConfig } from "./jenis-pelatihan.entity";

export const jenisPelatihanRoutes =
  buildLookupModule(jenisPelatihanConfig).controller;
