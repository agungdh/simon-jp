import { buildTrainingModule } from "../../lib/training";
import { seminarConfig } from "./seminar.entity";

export const seminarRoutes = buildTrainingModule(seminarConfig).controller;
