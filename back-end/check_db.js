const { Client } = require('pg');
const c = new Client({ port: 5433, user: 'postgres', password: '65732Pauline', database: 'ecole_primaire' });
c.connect()
 .then(() => Promise.all([
    c.query('SELECT "idPers", nom, prenom, "typePersonne" FROM personne ORDER BY "idPers" DESC LIMIT 5'),
    c.query('SELECT * FROM enseignant ORDER BY "idEnseignant" DESC LIMIT 5')
 ]))
 .then(([p, e]) => {
    console.log('Recent Personnes:', p.rows);
    console.log('Recent Enseignants:', e.rows);
 })
 .catch(err => console.error(err))
 .finally(() => c.end());
