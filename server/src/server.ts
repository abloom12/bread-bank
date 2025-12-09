import express from "express";
import { SHARED_VERSION } from "@app/shared";

console.log("shared:", SHARED_VERSION);

const app = express();
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/", (_req, res) => {
  res.send("API is running.");
});

const port = Number(process.env.PORT) || 3000;

app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});
