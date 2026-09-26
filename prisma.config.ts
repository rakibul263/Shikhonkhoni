import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import { defineConfig } from "prisma/config";

// Read DATABASE_URL from .env or process.env
const envPath = resolve(process.cwd(), ".env");
let databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl && existsSync(envPath)) {
  const envContent = readFileSync(envPath, "utf-8");
  const match = envContent.match(/^DATABASE_URL\s*=\s*"?(.+?)"?\s*$/m);
  databaseUrl = match?.[1];
}

databaseUrl = databaseUrl ?? "postgresql://placeholder:placeholder@localhost:5432/placeholder";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: databaseUrl,
  },
});

