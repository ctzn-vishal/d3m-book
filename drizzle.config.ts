import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// Drizzle Studio (`pnpm studio`) connects to the live Turso `gallery` registry.
// Load a DB-SCOPED token: prefer .env.local (gitignored — where `pnpm mint-db-token`
// puts it), fall back to .env. The token in .env is a platform token the DB 401s.
config({ path: ['.env.local', '.env'] });

export default defineConfig({
  schema: './db/schema.ts',
  out: './drizzle',
  dialect: 'turso',
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  },
});
