const { Client } = require('pg');
const c = new Client({ port: 5433, user: 'postgres', password: '65732Pauline', database: 'ecole_primaire' });
c.connect()
 .then(() => c.query('INSERT INTO enseignant("idPers", "Actif", "idAdmin") VALUES (62, 1, 1) RETURNING *'))
 .then(r => console.log('Inserted Enseignant:', r.rows))
 .catch(err => console.error(err))
 .finally(() => c.end());
