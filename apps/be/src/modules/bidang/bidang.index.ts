import { buildLookupModule } from "../../lib/lookup";
import { bidangConfig } from "./bidang.entity";

export const bidangRoutes = buildLookupModule(bidangConfig).controller;
