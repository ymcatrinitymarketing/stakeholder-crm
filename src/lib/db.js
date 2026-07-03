import { neon } from '@neondatabase/serverless';

export function getDb() {
  if (!process.env.POSTGRES_URL) {
    throw new Error('POSTGRES_URL is missing in environment variables');
  }
  return neon(process.env.POSTGRES_URL);
}
