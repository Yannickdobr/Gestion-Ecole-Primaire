const { Client } = require('pg');

const client = new Client({
  host: 'ecole-primaire-yannickakana134-92c2.d.aivencloud.com',
  port: 21707,
  user: 'avnadmin',
  password: 'AVNS_Lj3wi4L3TKtUgW0ewM_',
  database: 'defaultdb',
  ssl: {
    rejectUnauthorized: false
  }
});

async function main() {
  try {
    await client.connect();
    
    // Get all tables and check if they have isDelete
    const res = await client.query(`
      SELECT table_name, column_name 
      FROM information_schema.columns 
      WHERE column_name = 'isDelete' OR column_name = 'isdelete';
    `);
    console.log('Tables with isDelete:', res.rows.map(r => r.table_name));

    // Also check session columns
    const sessionCols = await client.query(`
      SELECT column_name FROM information_schema.columns WHERE table_name = 'session';
    `);
    console.log('Session columns:', sessionCols.rows.map(r => r.column_name));
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

main();
