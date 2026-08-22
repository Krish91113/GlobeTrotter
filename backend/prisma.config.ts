import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed-travel-dataset.ts",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
