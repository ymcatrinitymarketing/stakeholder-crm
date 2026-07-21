import { neon } from '@neondatabase/serverless';

export function getDb() {
  if (!process.env.POSTGRES_URL) {
    throw new Error('POSTGRES_URL is missing in environment variables');
  }
  const url = process.env.POSTGRES_URL.replace(/^"|"$/g, '');
  return neon(url);
}
