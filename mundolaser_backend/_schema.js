const { Pool } = require('pg');
const fs = require('fs');
const src = fs.readFileSync('./index.js', 'utf8');
const password = src.match(/password: '([^']+)'/)[1];
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'mundolaser_db',
  password,
  port: 5432,
});

(async () => {
  const constraints = await pool.query(`
    SELECT conrelid::regclass AS tabla, conname, pg_get_constraintdef(oid) AS def
    FROM pg_constraint
    WHERE contype IN ('f', 'u', 'p')
    ORDER BY 1
  `);
  console.log(JSON.stringify(constraints.rows, null, 2));
  const counts = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM clientes) AS clientes,
      (SELECT COUNT(*) FROM tickets) AS tickets,
      (SELECT COUNT(*) FROM usuarios) AS usuarios
  `);
  console.log(counts.rows[0]);
  await pool.end();
})().catch(async (e) => {
  console.error(e.message);
  await pool.end();
});
