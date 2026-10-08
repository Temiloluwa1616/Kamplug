import { db } from "./index";
import * as schema from "./schema";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Schema exports:", Object.keys(schema));

  const tables = await db.execute(sql`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' ORDER BY table_name
  `);
  console.log("DB tables:");
  console.table(tables);

  console.log("db.query keys:", Object.keys((db as any).query ?? {}));

  process.exit(0);
}

main();