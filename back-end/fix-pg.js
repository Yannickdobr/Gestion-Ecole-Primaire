const { Client } = require("pg");
const client = new Client({
  user: "postgres",
  host: "localhost",
  database: "ecole_primaire",
  password: "65732Pauline",
  port: 5433,
});

async function run() {
  await client.connect();
  const res = await client.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public';");
  const tables = res.rows.map(r => r.tablename);
  
  for (const table of tables) {
    try {
      await client.query(`ALTER TABLE "${table}" ADD COLUMN "isDelete" smallint NOT NULL DEFAULT 0;`);
      console.log(`Added isDelete to ${table}`);
    } catch (e) {
      if (e.code === "42701") { // duplicate column
        console.log(`isDelete already exists in ${table}`);
      } else {
        console.log(`Error on ${table}: ${e.message}`);
      }
    }
  }

  // Add groupeSanguin to eleve
  if (tables.includes("eleve")) {
    try {
      await client.query(`ALTER TABLE "eleve" ADD COLUMN "groupeSanguin" varchar(5) DEFAULT NULL;`);
      console.log(`Added groupeSanguin to eleve`);
    } catch (e) { console.log(e.message); }
  }

  // Add totalCopie to livres
  if (tables.includes("livres")) {
    try {
      await client.query(`ALTER TABLE "livres" ADD COLUMN "totalCopie" smallint NOT NULL DEFAULT 0;`);
      console.log(`Added totalCopie to livres`);
    } catch (e) { console.log(e.message); }
  }

  await client.end();
}
run().catch(console.error);
