import { buildTrainingModule } from "../../lib/training";
import { mentoringConfig } from "./mentoring.entity";

export const mentoringRoutes = buildTrainingModule(mentoringConfig).controller;
