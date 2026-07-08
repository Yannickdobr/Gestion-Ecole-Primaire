const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
  db.all("SELECT idCours, libelle FROM cours", (err, rows) => {
    if (err) console.error(err); else console.log('COURS:', rows);
  });
  db.all("SELECT idClasse, libelle FROM classe", (err, rows) => {
    if (err) console.error(err); else console.log('CLASSES:', rows);
  });
  db.all("SELECT idPers, nom, prenom, email FROM personne WHERE typePersonne = 1", (err, rows) => {
    if (err) console.error(err); else console.log('ENSEIGNANTS:', rows);
  });
  db.all("PRAGMA table_info(enseignant)", (err, rows) => {
    if (err) console.error(err); else console.log('SCHEMA ENSEIGNANT:', rows);
  });
  db.all("SELECT * FROM titulaire", (err, rows) => {
    if (err) console.error(err); else console.log('TITULAIRE:', rows);
  });
});
