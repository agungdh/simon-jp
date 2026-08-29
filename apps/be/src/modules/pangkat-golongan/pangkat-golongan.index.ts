import { buildLookupModule } from "../../lib/lookup";
import { pangkatGolonganConfig } from "./pangkat-golongan.entity";

export const pangkatGolonganRoutes =
  buildLookupModule(pangkatGolonganConfig).controller;
