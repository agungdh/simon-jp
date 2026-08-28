import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { authRoutes } from "./routes/auth";
import { userRoutes } from "./routes/users";

const app = new Elysia()
  .use(
    swagger({
      path: "/api/swagger",
      documentation: {
        info: {
          title: "Simon JP API",
          version: "1.0.0",
        },
      },
    }),
  )
  .get("/", () => ({ message: "Hello from Elysia BE" }))
  .get("/health", () => ({ status: "ok" }))
  .use(authRoutes)
  .use(userRoutes);

const port = Number(process.env.PORT) || 4000;

app.listen(port, () => {
  console.log(`🦊 Elysia BE running at http://localhost:${port}`);
});
