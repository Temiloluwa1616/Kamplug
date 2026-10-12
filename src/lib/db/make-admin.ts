import { db } from "./index";
import { users } from "./schema";
import { eq } from "drizzle-orm";

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: tsx make-admin.ts your@email.com");
    process.exit(1);
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) {
    console.error("No user found with email:", email);
    process.exit(1);
  }

  await db
    .update(users)
    .set({ isAdmin: true })
    .where(eq(users.id, user.id));

  console.log(`Done. @${user.username} is now an admin.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});