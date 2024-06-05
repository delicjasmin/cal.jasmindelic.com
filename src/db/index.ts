import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2";

export const poolConnection = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT!),
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

export const db = drizzle(poolConnection);
