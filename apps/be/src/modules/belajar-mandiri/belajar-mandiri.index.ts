import { buildTrainingModule } from "../../lib/training";
import { belajarMandiriConfig } from "./belajar-mandiri.entity";

export const belajarMandiriRoutes =
  buildTrainingModule(belajarMandiriConfig).controller;
