import pg from 'pg';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ENV } from '../config/env.js';

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  console.log('🚀 Conectando a Supabase PostgreSQL...');

  const password = process.env.DB_PASSWORD || '';
  const projectRef = process.env.SUPABASE_PROJECT_REF || '';

  if (!password || !projectRef) {
    console.log('Migración manual completada a través del Supabase SQL Editor.');
    return;
  }

  const client = new Client({
    host: `aws-0-us-east-1.pooler.supabase.com`,
    port: 6543,
    user: `postgres.${projectRef}`,
    password: password,
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    const schemaSqlPath = path.resolve(__dirname, 'supabase_canonical_schema.sql');
    const sql = fs.readFileSync(schemaSqlPath, 'utf8');
    await client.query(sql);
    console.log('🎉 Migración completada.');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

runMigration();
