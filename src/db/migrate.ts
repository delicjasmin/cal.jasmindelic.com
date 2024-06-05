import "dotenv/config";
import { migrate } from "drizzle-orm/mysql2/migrator";
import { db, poolConnection } from "./index";

async function asyncMain() {
  await migrate(db, { migrationsFolder: "./drizzle" });
  await poolConnection.end();
}

asyncMain();
