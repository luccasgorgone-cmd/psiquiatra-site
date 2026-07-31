import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import { sslFor } from "./ssl";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL não definida");
  const pool = new Pool({
    connectionString: url,
    ssl: sslFor(url),
  });
  const db = drizzle(pool);
  console.log("Rodando migrações...");
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("Migrações aplicadas com sucesso.");
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
