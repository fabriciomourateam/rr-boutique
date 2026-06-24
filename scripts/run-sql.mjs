// Aplica arquivos .sql num Postgres via DATABASE_URL.
// Uso: DATABASE_URL="postgresql://..." node scripts/run-sql.mjs supabase/migrations/0001_init.sql ...
import { readFileSync } from 'node:fs'
import pg from 'pg'

const url = process.env.DATABASE_URL
if (!url) {
  console.error('Falta a variável DATABASE_URL')
  process.exit(1)
}

const files = process.argv.slice(2)
if (files.length === 0) {
  console.error('Informe ao menos um arquivo .sql')
  process.exit(1)
}

const client = new pg.Client({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
})

try {
  await client.connect()
  for (const f of files) {
    const sql = readFileSync(f, 'utf8')
    console.log(`Aplicando ${f} ...`)
    await client.query(sql)
    console.log(`  OK`)
  }
  console.log('Todas as migrações aplicadas com sucesso.')
} catch (err) {
  console.error('ERRO ao aplicar SQL:', err.message)
  process.exitCode = 1
} finally {
  await client.end()
}
