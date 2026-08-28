import { Elysia } from "elysia";

const app = new Elysia()
  .get("/", () => ({ message: "Hello from Elysia BE" }))
  .get("/health", () => ({ status: "ok" }));

const port = Number(process.env.PORT) || 4000;

app.listen(port, () => {
  console.log(`🦊 Elysia BE running at http://localhost:${port}`);
});
