import "dotenv/config";

import type { Config } from "drizzle-kit";
export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: {
    host: process.env.DB_HOST!,
    port: parseInt(process.env.DB_PORT!),
    database: process.env.DB_DATABASE!,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
} satisfies Config;
