import { db } from "./index";
import { sql } from "drizzle-orm";

async function main() {
  const result = await db.execute(sql`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `);
  console.log("Tables in kamplug:");
  console.table(result);
  process.exit(0);
}

main();