import { buildTrainingModule } from "../../lib/training";
import { ppmConfig } from "./ppm.entity";

export const ppmRoutes = buildTrainingModule(ppmConfig).controller;
