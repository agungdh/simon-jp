import { buildTrainingModule } from "../../lib/training";
import { lcConfig } from "./lc.entity";

export const lcRoutes = buildTrainingModule(lcConfig).controller;
