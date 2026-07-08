const { Client } = require('pg');
const c = new Client({ port: 5433, user: 'postgres', password: '65732Pauline', database: 'ecole_primaire' });
c.connect()
 .then(() => c.query('SELECT "typePersonne", count(*) FROM personne GROUP BY "typePersonne"'))
 .then(r => console.log('LOCAL DB Personne counts:', r.rows))
 .finally(() => c.end());
