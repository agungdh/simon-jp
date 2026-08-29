import { buildTrainingModule } from "../../lib/training";
import { workshopConfig } from "./workshop.entity";

export const workshopRoutes = buildTrainingModule(workshopConfig).controller;
