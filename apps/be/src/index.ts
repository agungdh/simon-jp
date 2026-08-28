import { Elysia } from "elysia";
import { authRoutes } from "./routes/auth";
import { userRoutes } from "./routes/users";

const app = new Elysia()
  .get("/", () => ({ message: "Hello from Elysia BE" }))
  .get("/health", () => ({ status: "ok" }))
  .use(authRoutes)
  .use(userRoutes);

const port = Number(process.env.PORT) || 4000;

app.listen(port, () => {
  console.log(`🦊 Elysia BE running at http://localhost:${port}`);
});
