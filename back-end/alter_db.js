const { Client } = require('pg');
const client = new Client({
  host: 'localhost',
  port: 5433,
  user: 'postgres',
  password: '65732Pauline',
  database: 'ecole_primaire'
});

async function main() {
  try {
    await client.connect();
    await client.query('ALTER TABLE session ADD COLUMN IF NOT EXISTS date_passage DATE;');
    await client.query(`UPDATE session SET date_passage = '2025-12-31' WHERE date_passage IS NULL;`);
    console.log('Database updated successfully.');
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

main();
