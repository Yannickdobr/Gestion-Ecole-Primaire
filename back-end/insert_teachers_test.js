const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function run() {
  await client.connect();
  
  try {
    console.log("Connecté à la BD locale");
    
    // 1. Get the class 'Français' or create/rename one
    const coursRes = await client.query(`SELECT * FROM cours WHERE libelle ILIKE '%Français%' LIMIT 1`);
    let idCoursFrancais = coursRes.rows[0]?.idCours;
    if (!idCoursFrancais) {
      console.log("Cours 'Français' non trouvé. Modification du premier cours existant...");
      const existingCours = await client.query("SELECT * FROM cours LIMIT 1");
      if (existingCours.rows.length === 0) {
          console.error("Aucun cours trouvé dans la BD ! Impossible de continuer.");
          return;
      }
      idCoursFrancais = existingCours.rows[0].idCours;
      await client.query(`UPDATE cours SET libelle = 'Français' WHERE "idCours" = $1`, [idCoursFrancais]);
    }
    console.log("ID Cours Français:", idCoursFrancais);

    // Need idAdmin
    const adminRes = await client.query("SELECT * FROM personne WHERE \"typePersonne\" = 2 LIMIT 1");
    const idAdmin = adminRes.rows[0]?.idPers || 1;

    // 2. Insert Enseignant A (Toutes matières = pas de difficulté)
    const emailA = 'polyvalent.test@ecole.fr';
    let persARes = await client.query(`SELECT * FROM personne WHERE username = $1`, [emailA]);
    let idPersA = persARes.rows[0]?.idPers;
    
    if (!idPersA) {
      const insertPersA = await client.query(`
        INSERT INTO personne ("typePersonne", nom, prenom, "dateNaissance", "lieuNaissance", username, password, created_at, "isDelete", "idAdmin") 
        VALUES (1, 'DUPONT', 'Jean (Polyvalent)', '1980-01-01', 'Paris', $1, 'hashed_password', NOW(), 0, $2) 
        RETURNING "idPers"`, [emailA, idAdmin]);
      idPersA = insertPersA.rows[0].idPers;
      await client.query(`INSERT INTO enseignant ("idEnseignant", "isDirecteur", difficulte) VALUES ($1, false, false)`, [idPersA]);
    } else {
      await client.query(`UPDATE personne SET "isDelete" = 0 WHERE "idPers" = $1`, [idPersA]);
      await client.query(`UPDATE enseignant SET difficulte = false, "idCours" = NULL WHERE "idEnseignant" = $1`, [idPersA]);
    }
    console.log("Enseignant A (Polyvalent) ID:", idPersA);

    // 3. Insert Enseignant B (Difficulté: Français)
    const emailB = 'francais.difficulte@ecole.fr';
    let persBRes = await client.query(`SELECT * FROM personne WHERE username = $1`, [emailB]);
    let idPersB = persBRes.rows[0]?.idPers;

    if (!idPersB) {
      const insertPersB = await client.query(`
        INSERT INTO personne ("typePersonne", nom, prenom, "dateNaissance", "lieuNaissance", username, password, created_at, "isDelete", "idAdmin") 
        VALUES (1, 'MARTIN', 'Sophie (Diff. Français)', '1985-05-12', 'Lyon', $1, 'hashed_password', NOW(), 0, $2) 
        RETURNING "idPers"`, [emailB, idAdmin]);
      idPersB = insertPersB.rows[0].idPers;
      await client.query(`INSERT INTO enseignant ("idEnseignant", "isDirecteur", difficulte, "idCours") VALUES ($1, false, true, $2)`, [idPersB, idCoursFrancais]);
    } else {
      await client.query(`UPDATE personne SET "isDelete" = 0 WHERE "idPers" = $1`, [idPersB]);
      await client.query(`UPDATE enseignant SET difficulte = true, "idCours" = $2 WHERE "idEnseignant" = $1`, [idPersB, idCoursFrancais]);
    }
    console.log("Enseignant B (Diff. Français) ID:", idPersB);

    // 4. Get two distinct classes
    const classesRes = await client.query("SELECT * FROM classe LIMIT 2");
    if (classesRes.rows.length < 2) {
        console.log("Pas assez de classes trouvées !");
        return;
    }
    const idClasseA = classesRes.rows[0].idClasse;
    const idClasseB = classesRes.rows[1].idClasse;
    console.log("Classe A ID:", idClasseA, "Classe B ID:", idClasseB);

    // 5. Assign them as Titulaires
    await client.query(`DELETE FROM titulaire WHERE "idClasse" IN ($1, $2) OR "idEnseignant" IN ($1, $2)`, [idClasseA, idClasseB, idPersA, idPersB]);
    
    // A -> Classe A
    await client.query(`
      INSERT INTO titulaire ("idEnseignant", "idClasse", "anneeScolaire", "dateAttribution", actif, "typeTitulaire") 
      VALUES ($1, $2, '2025-2026', NOW(), 1, 'Principal')
    `, [idPersA, idClasseA]);
    
    // B -> Classe B
    await client.query(`
      INSERT INTO titulaire ("idEnseignant", "idClasse", "anneeScolaire", "dateAttribution", actif, "typeTitulaire") 
      VALUES ($1, $2, '2025-2026', NOW(), 1, 'Principal')
    `, [idPersB, idClasseB]);

    console.log("Affectations réussies !");

    // 6. Ensure some EmploiDuTemps for Class B exists with Français
    const creneauxClasseB = await client.query(`SELECT * FROM emploidutemps WHERE "idClasse" = $1 AND "isDelete" = 0 LIMIT 1`, [idClasseB]);
    if (creneauxClasseB.rows.length === 0) {
        // Need idAdmin
        const adminRes = await client.query("SELECT * FROM personne WHERE \"typePersonne\" = 2 LIMIT 1");
        const idAdmin = adminRes.rows[0]?.idPers || 1;
        await client.query(`
            INSERT INTO emploidutemps (jour, heure, "idClasse", "idCours", "isDelete", "idAdmin")
            VALUES ('Lundi', '08:00', $1, $2, 0, $3)
        `, [idClasseB, idCoursFrancais, idAdmin]);
        console.log("Créneau Français ajouté pour la classe B.");
    } else {
        await client.query(`UPDATE emploidutemps SET "idCours" = $2 WHERE "idTemps" = $1`, [creneauxClasseB.rows[0].idTemps, idCoursFrancais]);
        console.log("Créneau mis à jour en Français pour la classe B.");
    }

  } catch (err) {
    console.error("Erreur:", err);
  } finally {
    await client.end();
  }
}

run();
