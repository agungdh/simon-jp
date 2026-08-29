import { buildTrainingModule } from "../../lib/training";
import { diklatConfig } from "./diklat.entity";

export const diklatRoutes = buildTrainingModule(diklatConfig).controller;
