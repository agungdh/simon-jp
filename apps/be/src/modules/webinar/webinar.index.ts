import { buildTrainingModule } from "../../lib/training";
import { webinarConfig } from "./webinar.entity";

export const webinarRoutes = buildTrainingModule(webinarConfig).controller;
