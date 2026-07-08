const { Client } = require('pg');

async function fixDB(config, name) {
  const c = new Client(config);
  try {
    await c.connect();
    // Ensure all Personnes linked in 'enseignant' table have typePersonne = 1
    const res = await c.query(`
      UPDATE personne 
      SET "typePersonne" = 1 
      WHERE "idPers" IN (SELECT "idPers" FROM enseignant);
    `);
    console.log(`[${name}] Updated ${res.rowCount} personne(s) to typePersonne 1.`);
  } catch (err) {
    console.error(`[${name}] Error:`, err);
  } finally {
    await c.end();
  }
}

async function main() {
  const localConfig = { port: 5433, user: 'postgres', password: '65732Pauline', database: 'ecole_primaire' };
  const remoteConfig = {
    host: 'ecole-primaire-yannickakana134-92c2.d.aivencloud.com',
    port: 21707,
    user: 'avnadmin',
    password: 'AVNS_Lj3wi4L3TKtUgW0ewM_',
    database: 'defaultdb',
    ssl: { rejectUnauthorized: false }
  };
  
  await fixDB(localConfig, 'LOCAL');
  await fixDB(remoteConfig, 'REMOTE');
}

main();
