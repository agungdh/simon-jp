import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { errorHandler } from "./plugins/error";
import { authRoutes } from "./modules/auth";
import { userRoutes } from "./modules/user";

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
  .use(userRoutes);

export type App = typeof app;
