const { Client } = require('pg');
const client = new Client({
  host: 'localhost',
  port: 5433,
  user: 'postgres',
  password: '65732Pauline',
  database: 'ecole_primaire'
});

client.connect()
  .then(() => Promise.all([
    client.query('SELECT COUNT(*) FROM eleve;'),
    client.query('SELECT COUNT(*) FROM eleve WHERE actif = 1 AND "isDelete" = 0;'),
    client.query('SELECT COUNT(*) FROM emploidutemps;'),
    client.query('SELECT jour, COUNT(*) FROM emploidutemps GROUP BY jour;')
  ]))
  .then(res => {
    console.log('Total Eleves:', res[0].rows);
    console.log('Active Eleves:', res[1].rows);
    console.log('Total Cours:', res[2].rows);
    console.log('Cours par jour:', res[3].rows);
    client.end();
  })
  .catch(err => {
    console.error(err);
    client.end();
  });
