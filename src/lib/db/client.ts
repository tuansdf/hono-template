import { env, isDevelopment } from "@/lib/config/env";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const pool = new Pool({
  connectionString: env.DATABASE_URL,
});
export const db = drizzle({ client: pool, schema, logger: isDevelopment });

await db.execute("select 1");
