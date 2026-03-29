import { defineConfig } from 'drizzle-kit';
import { envOrThrow } from './src/utils';

process.loadEnvFile();

const DB_URL = envOrThrow("DB_URL");

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: DB_URL,
  },
});
