import { buildTrainingModule } from "../../lib/training";
import { coachingConfig } from "./coaching.entity";

export const coachingRoutes = buildTrainingModule(coachingConfig).controller;
