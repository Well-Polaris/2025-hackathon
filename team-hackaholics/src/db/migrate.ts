import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as schema from './schema';
import 'dotenv/config';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Enable pgvector extension and run migrations
async function runMigration() {
  const sql = postgres(process.env.DATABASE_URL, { max: 1 });
  const db = drizzle(sql, { schema });
  
  // Enable pgvector extension
  await sql`CREATE EXTENSION IF NOT EXISTS vector;`;
  
  // Run migrations
  await migrate(db, { migrationsFolder: './drizzle' });
  
  await sql.end();
}

runMigration().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
}); 