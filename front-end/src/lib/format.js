// Helpers d'affichage.
// Les colonnes NOT NULL du schéma (imposé) sont parfois remplies par des
// valeurs de remplissage ('INDEFINI', '000'). On évite de les montrer telles
// quelles à l'utilisateur : on affiche un tiret à la place.
const REMPLISSAGE = new Set(["INDEFINI", "000", "0", "NULL", "UNDEFINED"]);

/** Renvoie une valeur lisible, ou `fallback` si vide / valeur de remplissage. */
export function propre(value, fallback = "—") {
  if (value === null || value === undefined) return fallback;
  const s = String(value).trim();
  if (s === "" || REMPLISSAGE.has(s.toUpperCase())) return fallback;
  return value;
}
