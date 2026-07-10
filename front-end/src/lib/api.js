// Petit client HTTP centralisé pour parler au backend NestJS.
// L'URL de base est configurable via NEXT_PUBLIC_API_URL (.env.local).
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

/**
 * Appel générique à l'API.
 * - Ajoute automatiquement le token JWT (s'il existe) dans l'en-tête Authorization.
 * - Lève une Error avec un message lisible si la réponse n'est pas OK.
 */
export async function apiFetch(path, options = {}) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch {
    throw new Error(
      "Impossible de joindre le serveur. Vérifie que le backend est démarré.",
    );
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    // NestJS ConflictException avec un objet : { message: { requireRestoreChoice, restoreId, ... }, statusCode: 409 }
    const payload = typeof data.message === 'object' && data.message !== null && !Array.isArray(data.message) ? data.message : data;
    const msg = Array.isArray(data.message)
      ? data.message.join(", ")
      : (typeof data.message === 'string' ? data.message : payload.message) || `Erreur ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.requireConfirmation = payload.requireConfirmation || data.requireConfirmation;
    err.impact = payload.impact || data.impact;
    err.requireRestoreChoice = payload.requireRestoreChoice || data.requireRestoreChoice;
    err.restoreId = payload.restoreId || data.restoreId;
    err.ancienNom = payload.ancienNom || data.ancienNom;
    throw err;
  }

  return data;
}

/** Téléverse un fichier (multipart) : POST /upload → { url, filename, ... } */
export async function uploadFichier(file) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const fd = new FormData();
  fd.append("file", file);
  let res;
  try {
    res = await fetch(`${API_URL}/upload`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: fd, // NE PAS fixer Content-Type : le navigateur ajoute le boundary
    });
  } catch {
    throw new Error("Impossible de joindre le serveur pour l'upload.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Erreur ${res.status}`);
  return data;
}

/** Transforme un chemin /uploads/... en URL absolue servie par le backend. */
export function fichierURL(path) {
  if (!path || path === "INDEFINI") return null;
  if (/^https?:\/\//i.test(path)) return path;
  const base = API_URL.replace(/\/api\/?$/, "");
  return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
}

/** Profil du compte connecté : GET /auth/profil (token requis) */
export const getProfil = () => apiFetch("/auth/profil");

/** Liste des comptes administrateurs */
export const getAdmins = () => apiFetch("/auth/admins");
export const createAdmin = (data) =>
  apiFetch("/auth/admins", { method: "POST", body: JSON.stringify(data) });
export const deleteAdmin = (id, force = false) =>
  apiFetch(`/auth/admins/${id}${force ? '?force=true' : ''}`, { method: 'DELETE' });

/** Changer son mot de passe : PATCH /auth/password */
export const changePassword = (data) =>
  apiFetch("/auth/password", { method: "PATCH", body: JSON.stringify(data) });

/** Renouvelle le token (session glissante) : POST /auth/refresh */
export const refreshToken = () => apiFetch("/auth/refresh", { method: "POST" });

/** Mot de passe oublié : POST /auth/forgot-password (réponse générique) */
export const forgotPassword = (username) =>
  apiFetch("/auth/forgot-password", { method: "POST", body: JSON.stringify({ username }) });

/** Authentification : POST /auth/login */
export function login(username, password) {
  return apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export const getLoginStats = () => apiFetch("/public/login-stats", { cache: 'no-store' });

// ─── Ressources (lecture) ────────────────────────────────────────────────
// Chaque fonction correspond à un endpoint GET du backend NestJS.

export const getEleves = () => apiFetch("/eleves");
export const getElevesActifs = () => apiFetch("/eleves/actifs");
// Élèves rattachés à une année (affectés cette année + non encore affectés)
export const getElevesByAnnee = (idAca) => apiFetch(`/eleves/par-annee/${idAca}`);
export const getEleve = (matricule) => apiFetch(`/eleves/${matricule}`);
export const deleteEleve = (matricule, force = false) =>
  apiFetch(`/eleves/${matricule}${force ? '?force=true' : ''}`, { method: 'DELETE' });
export const getElevesByParent = (idPers) =>
  apiFetch(`/eleves/parent/${idPers}`);
export const affecterEleve = (data) =>
  apiFetch("/classes/affecter", { method: "POST", body: JSON.stringify(data) });
export const getFrequenteBySalle = (idSalle) =>
  apiFetch(`/classes/frequente/salle/${idSalle}`);
export const getFrequenteByEleve = (matricule) =>
  apiFetch(`/classes/frequente/eleve/${matricule}`);
export const reaffecterEleve = (data) =>
  apiFetch("/classes/reaffecter", { method: "POST", body: JSON.stringify(data) });
export const createEleve = (data) =>
  apiFetch("/eleves", { method: "POST", body: JSON.stringify(data) });
export const desactiverEleve = (matricule) =>
  apiFetch(`/eleves/${matricule}/desactiver`, { method: "PATCH" });
export const activerEleve = (matricule) =>
  apiFetch(`/eleves/${matricule}/activer`, { method: "PATCH" });
export const getParentsEleve = (matricule) =>
  apiFetch(`/eleves/${matricule}/parents`);

export const getEnseignants = () => apiFetch("/professeurs/enseignants");
export const getEnseignantsActifs = () =>
  apiFetch("/professeurs/enseignants/actifs");
export const getTitulaires = () => apiFetch("/professeurs/titulaires");
export const getPersonnes = () => apiFetch("/professeurs/personnes");
export const createPersonne = (data) =>
  apiFetch("/professeurs/personnes", { method: "POST", body: JSON.stringify(data) });
export const updatePersonne = (id, data) =>
  apiFetch(`/professeurs/personnes/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deletePersonne = (id, force = false) =>
  apiFetch(`/professeurs/personnes/${id}${force ? '?force=true' : ''}`, { method: 'DELETE' });
export const addParentToEleve = (matricule, data) =>
  apiFetch(`/eleves/${matricule}/parents`, { method: "POST", body: JSON.stringify(data) });

// Actions sur le personnel
export const createEnseignant = (data) =>
  apiFetch("/professeurs/enseignants", { method: "POST", body: JSON.stringify(data) });
export const createTitulaire = (data) =>
  apiFetch("/professeurs/titulaires", { method: "POST", body: JSON.stringify(data) });
export const updateTitulaireSalle = (idTitulaire, idSalle) =>
  apiFetch(`/professeurs/titulaires/${idTitulaire}/salle`, { method: "PATCH", body: JSON.stringify({ idSalle }) });
export const activerEnseignant = (id) =>
  apiFetch(`/professeurs/enseignants/${id}/activer`, { method: "PATCH" });
export const desactiverEnseignant = (id) =>
  apiFetch(`/professeurs/enseignants/${id}/desactiver`, { method: "PATCH" });
export const desactiverTitulaire = (id) =>
  apiFetch(`/professeurs/titulaires/${id}/desactiver`, { method: "PATCH" });

export const getClasses = () => apiFetch("/classes");
export const getCycles = () => apiFetch("/classes/cycles");
export const getSalles = () => apiFetch("/classes/salles");
export const getAnnees = () => apiFetch("/classes/annees");
export const createCycle = (data) =>
  apiFetch("/classes/cycles", { method: "POST", body: JSON.stringify(data) });
export const updateCycle = (id, data) =>
  apiFetch(`/classes/cycles/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteCycle = (id, force = false) =>
  apiFetch(`/classes/cycles/${id}${force ? '?force=true' : ''}`, { method: 'DELETE' });
export const createClasse = (data) =>
  apiFetch("/classes", { method: "POST", body: JSON.stringify(data) });
export const updateClasse = (id, data) =>
  apiFetch(`/classes/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteClasse = (id, force = false) =>
  apiFetch(`/classes/${id}${force ? '?force=true' : ''}`, { method: 'DELETE' });
export const createSalle = (data) =>
  apiFetch("/classes/salles", { method: "POST", body: JSON.stringify(data) });
export const updateSalle = (id, data) =>
  apiFetch(`/classes/salles/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteSalle = (id, force = false) =>
  apiFetch(`/classes/salles/${id}${force ? '?force=true' : ''}`, { method: 'DELETE' });
export const createCours = (data) =>
  apiFetch("/cours", { method: "POST", body: JSON.stringify(data) });
export const updateCours = (id, data) =>
  apiFetch(`/cours/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteCours = (id, force = false) =>
  apiFetch(`/cours/${id}${force ? '?force=true' : ''}`, { method: 'DELETE' });

export const getVilles = () => apiFetch("/villes");
export const seedVilles = () => apiFetch("/villes/seed", { method: "POST" });

export const getCours = () => apiFetch("/cours");

// Matière de difficulté d'un enseignant (écrit idCours existant ; null pour effacer)
export const setMatiereDifficulte = (idEnseignant, idCours) =>
  apiFetch(`/professeurs/enseignants/${idEnseignant}/difficulte`, { method: "PATCH", body: JSON.stringify({ idCours: idCours ?? null }) });

// ─── Bibliothèque (livres / spécialités) ───────────────────────────────────
export const getLivres = () => apiFetch("/cours/livres");
export const createLivre = (data) =>
  apiFetch("/cours/livres", { method: "POST", body: JSON.stringify(data) });
export const updateLivre = (id, data) =>
  apiFetch(`/cours/livres/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteLivre = (id, force = false) =>
  apiFetch(`/cours/livres/${id}${force ? '?force=true' : ''}`, { method: 'DELETE' });
export const getSpecialites = () => apiFetch("/cours/specialites");
export const createSpecialite = (data) =>
  apiFetch("/cours/specialites", { method: "POST", body: JSON.stringify(data) });

// ─── Classement d'une session (bulletins) ──────────────────────────────────
export const getClassementSession = (idSession) =>
  apiFetch(`/evaluations/classement/session/${idSession}`);

export const getEmploi = () => apiFetch("/emploi");
// Plan d'intérim dérivé (échanges matière de difficulté ↔ intérimaire)
export const getPlanInterim = () => apiFetch("/emploi/interim");
export const getEmploiParClasse = (idClasse) =>
  apiFetch(`/emploi/classe/${idClasse}`);
export const createEmploi = (data) =>
  apiFetch("/emploi", { method: "POST", body: JSON.stringify(data) });
export const deleteEmploi = (id, force = false) =>
  apiFetch(`/emploi/${id}${force ? '?force=true' : ''}`, { method: 'DELETE' });
export const verifierConflitsEmploi = (data) =>
  apiFetch("/emploi/verifier-conflits", { method: "POST", body: JSON.stringify(data) });

export const getPaiementsEleve = (matricule) =>
  apiFetch(`/paiements/eleve/${matricule}`);
export const getPaiementsAnnee = (idAca) => apiFetch(`/paiements/annee/${idAca}`);
/** BF-23 : envoie les rappels d'impayés aux parents (Direction/Scolarité). */
export const envoyerRappelsImpayes = (idAca) =>
  apiFetch(`/paiements/rappels-impayes/${idAca}`, { method: "POST" });

export const getModes = () => apiFetch("/paiements/modes");
export const createModePaiement = (data) =>
  apiFetch("/paiements/modes", { method: "POST", body: JSON.stringify(data) });

export const getScolarites = () => apiFetch("/paiements/scolarites");
export const createScolarite = (data) =>
  apiFetch("/paiements/scolarites", { method: "POST", body: JSON.stringify(data) });
export const createTranche = (data) =>
  apiFetch("/paiements/tranches", { method: "POST", body: JSON.stringify(data) });
export const enregistrerPaiement = (data) =>
  apiFetch("/paiements", { method: "POST", body: JSON.stringify(data) });
export const getArrieres = (matricule, idAca, idCycle) =>
  apiFetch(`/paiements/arrieres/${matricule}/annee/${idAca}/cycle/${idCycle}`);
// Version auto : le cycle est déduit de la classe de l'élève
export const getArrieresAuto = (matricule, idAca) =>
  apiFetch(`/paiements/arrieres/${matricule}/annee/${idAca}`);

// ─── Messagerie ──────────────────────────────────────────────────────────
export const getPersonnesTous = () => apiFetch("/professeurs/personnes/tous");

export const getMessages = () => apiFetch("/messagerie");
// Messages du compte connecté : reçus (si parent) ou envoyés (sinon)
export const getMesMessages = () => apiFetch("/messagerie/mes-messages");
export const getMessagesEnvoyes = () => apiFetch("/messagerie/envoyes");
export const getMessagesBrouillons = () => apiFetch("/messagerie/brouillons");
export const getMessagesStats = () => apiFetch("/messagerie/stats");
export const envoyerMessage = (data) =>
  apiFetch("/messagerie", { method: "POST", body: JSON.stringify(data) });
export const envoyerMessageMasse = (data) =>
  apiFetch("/messagerie/masse", { method: "POST", body: JSON.stringify(data) });
/** Réunion parent-titulaire : convoque tous les parents des élèves d'une salle. */
export const convoquerParentsClasse = (idSalle, data) =>
  apiFetch(`/messagerie/convocation-classe/${idSalle}`, { method: "POST", body: JSON.stringify(data) });
export const validerMessage = (id) =>
  apiFetch(`/messagerie/${id}/valider`, { method: "PATCH" });
export const modifierMessage = (id, data) =>
  apiFetch(`/messagerie/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const supprimerMessage = (id) =>
  apiFetch(`/messagerie/${id}`, { method: "DELETE" });

export const getRapportsEleve = (matricule) =>
  apiFetch(`/evaluations/rapports/eleve/${matricule}`);
// Assiduité dérivée des rapports (absences/retards), optionnellement par année
export const getStatsAbsences = (idAca) =>
  apiFetch(`/evaluations/rapports/stats-absences${idAca ? `?idAca=${idAca}` : ""}`);
export const createRapport = (data) =>
  apiFetch("/evaluations/rapports", { method: "POST", body: JSON.stringify(data) });

// ─── Administration (lot B) ────────────────────────────────────────────────
// Justificatifs d'absence
export const getJustificatifs = () => apiFetch("/justificatifs");
export const getJustificatifsByRapport = (idRapport) =>
  apiFetch(`/justificatifs/rapport/${idRapport}`);
export const createJustificatif = (data) =>
  apiFetch("/justificatifs", { method: "POST", body: JSON.stringify(data) });
export const validerJustificatif = (id) =>
  apiFetch(`/justificatifs/${id}/valider`, { method: "PATCH" });
export const deleteJustificatif = (id, force = false) =>
  apiFetch(`/justificatifs/${id}${force ? '?force=true' : ''}`, { method: 'DELETE' });

// Fiches enseignant (suivi RH)
export const getFichesEnseignant = (idEnseignant) =>
  apiFetch(`/fiches-enseignant/enseignant/${idEnseignant}`);
export const createFicheEnseignant = (data) =>
  apiFetch("/fiches-enseignant", { method: "POST", body: JSON.stringify(data) });
export const deleteFicheEnseignant = (idRap, force = false) =>
  apiFetch(`/fiches-enseignant/${idRap}${force ? '?force=true' : ''}`, { method: 'DELETE' });

// Résidence (quartiers / résidents)
export const getQuartiers = () => apiFetch("/residence/quartiers");
export const createQuartier = (data) =>
  apiFetch("/residence/quartiers", { method: "POST", body: JSON.stringify(data) });
export const deleteQuartier = (id, force = false) =>
  apiFetch(`/residence/quartiers/${id}${force ? '?force=true' : ''}`, { method: 'DELETE' });
export const getResidents = () => apiFetch("/residence/residents");
export const createResident = (data) =>
  apiFetch("/residence/residents", { method: "POST", body: JSON.stringify(data) });
export const deleteResident = (id, force = false) =>
  apiFetch(`/residence/residents/${id}${force ? '?force=true' : ''}`, { method: 'DELETE' });
export const getNotesEleve = (matricule) =>
  apiFetch(`/evaluations/notes/eleve/${matricule}`);

// Référentiels d'évaluation
export const getTrimestres = () => apiFetch("/evaluations/trimestres");
export const getSessions = () => apiFetch("/evaluations/sessions");
export const getNatures = () => apiFetch("/evaluations/natures");
export const getEpreuves = () => apiFetch("/evaluations/epreuves");
export const createAnnee = (data) =>
  apiFetch("/classes/annees", { method: "POST", body: JSON.stringify(data) });
export const createTrimestre = (data) =>
  apiFetch("/evaluations/trimestres", { method: "POST", body: JSON.stringify(data) });
export const createSession = (data) =>
  apiFetch("/evaluations/sessions", { method: "POST", body: JSON.stringify(data) });
export const createNature = (data) =>
  apiFetch("/evaluations/natures", { method: "POST", body: JSON.stringify(data) });
export const createEpreuve = (data) =>
  apiFetch("/evaluations/epreuves", { method: "POST", body: JSON.stringify(data) });
export const saisirNote = (data) =>
  apiFetch("/evaluations/notes", { method: "POST", body: JSON.stringify(data) });

export const updateAnnee = (id, data) => apiFetch(`/classes/annees/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteAnnee = (id, force = false) =>
  apiFetch(`/classes/annees/${id}${force ? '?force=true' : ''}`, { method: 'DELETE' });
export const updateTrimestre = (id, data) => apiFetch(`/evaluations/trimestres/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteTrimestre = (id, force = false) =>
  apiFetch(`/evaluations/trimestres/${id}${force ? '?force=true' : ''}`, { method: 'DELETE' });
export const updateSession = (id, data) => apiFetch(`/evaluations/sessions/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteSession = (id, force = false) =>
  apiFetch(`/evaluations/sessions/${id}${force ? '?force=true' : ''}`, { method: 'DELETE' });
export const updateNature = (id, data) => apiFetch(`/evaluations/natures/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteNature = (id, force = false) =>
  apiFetch(`/evaluations/natures/${id}${force ? '?force=true' : ''}`, { method: 'DELETE' });
export const updateEpreuve = (id, data) => apiFetch(`/evaluations/epreuves/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteEpreuve = (id, force = false) =>
  apiFetch(`/evaluations/epreuves/${id}${force ? '?force=true' : ''}`, { method: 'DELETE' });

// --- Ajouts Suite Audit Fonctionnel ---
export const updateNote = (id, data) => apiFetch(`/evaluations/notes/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteNote = (id, force = false) => apiFetch(`/evaluations/notes/${id}${force ? '?force=true' : ''}`, { method: 'DELETE' });

export const updateSpecialite = (id, data) => apiFetch(`/cours/specialites/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteSpecialite = (id, force = false) => apiFetch(`/cours/specialites/${id}${force ? '?force=true' : ''}`, { method: 'DELETE' });

export const updateScolarite = (id, data) => apiFetch(`/paiements/scolarites/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteScolarite = (id, force = false) => apiFetch(`/paiements/scolarites/${id}${force ? '?force=true' : ''}`, { method: 'DELETE' });

export const updateTranche = (id, data) => apiFetch(`/paiements/tranches/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteTranche = (id, force = false) => apiFetch(`/paiements/tranches/${id}${force ? '?force=true' : ''}`, { method: 'DELETE' });

export const updatePaiement = (id, data) => apiFetch(`/paiements/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deletePaiement = (id, force = false) => apiFetch(`/paiements/${id}${force ? '?force=true' : ''}`, { method: 'DELETE' });

export const updateModePaiement = (id, data) => apiFetch(`/paiements/modes/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteModePaiement = (id, force = false) => apiFetch(`/paiements/modes/${id}${force ? '?force=true' : ''}`, { method: 'DELETE' });
