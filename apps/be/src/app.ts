import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { errorHandler } from "./plugins/error";
import { authRoutes } from "./modules/auth";
import { userRoutes } from "./modules/user";
import { bidangRoutes } from "./modules/bidang";
import { pangkatGolonganRoutes } from "./modules/pangkat-golongan";
import { jenisPelatihanRoutes } from "./modules/jenis-pelatihan";
import { diklatRoutes } from "./modules/diklat";
import { ppmRoutes } from "./modules/ppm";
import { seminarRoutes } from "./modules/seminar";
import { webinarRoutes } from "./modules/webinar";
import { lcRoutes } from "./modules/lc";
import { belajarMandiriRoutes } from "./modules/belajar-mandiri";
import { mentoringRoutes } from "./modules/mentoring";
import { coachingRoutes } from "./modules/coaching";
import { workshopRoutes } from "./modules/workshop";
import { materiPpmRoutes } from "./modules/materi-ppm";
import { dashboardRoutes } from "./modules/dashboard";

export const app = new Elysia()
  .use(
    swagger({
      path: "/docs",
      documentation: {
        info: {
          title: "Simon JP API",
          version: "1.0.0",
        },
      },
    }),
  )
  .onError(errorHandler)
  .get("/", () => ({ message: "Hello from Elysia BE" }))
  .get("/health", () => ({ status: "ok" }))
  .use(authRoutes)
  .use(userRoutes)
  .use(bidangRoutes)
  .use(pangkatGolonganRoutes)
  .use(jenisPelatihanRoutes)
  .use(diklatRoutes)
  .use(ppmRoutes)
  .use(seminarRoutes)
  .use(webinarRoutes)
  .use(lcRoutes)
  .use(belajarMandiriRoutes)
  .use(mentoringRoutes)
  .use(coachingRoutes)
  .use(workshopRoutes)
  .use(materiPpmRoutes)
  .use(dashboardRoutes);

export type App = typeof app;
