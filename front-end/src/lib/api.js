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
    // NestJS renvoie message en string ou en tableau (erreurs de validation)
    const msg = Array.isArray(data.message)
      ? data.message.join(", ")
      : data.message || `Erreur ${res.status}`;
    throw new Error(msg);
  }

  return data;
}

/** Profil du compte connecté : GET /auth/profil (token requis) */
export const getProfil = () => apiFetch("/auth/profil");

/** Liste des comptes administrateurs */
export const getAdmins = () => apiFetch("/auth/admins");
export const createAdmin = (data) =>
  apiFetch("/auth/admins", { method: "POST", body: JSON.stringify(data) });
export const deleteAdmin = (id) => apiFetch(`/auth/admins/${id}`, { method: "DELETE" });

/** Changer son mot de passe : PATCH /auth/password */
export const changePassword = (data) =>
  apiFetch("/auth/password", { method: "PATCH", body: JSON.stringify(data) });

/** Renouvelle le token (session glissante) : POST /auth/refresh */
export const refreshToken = () => apiFetch("/auth/refresh", { method: "POST" });

/** Authentification : POST /auth/login */
export function login(username, password) {
  return apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

// ─── Ressources (lecture) ────────────────────────────────────────────────
// Chaque fonction correspond à un endpoint GET du backend NestJS.

export const getEleves = () => apiFetch("/eleves");
export const getElevesActifs = () => apiFetch("/eleves/actifs");
export const getEleve = (matricule) => apiFetch(`/eleves/${matricule}`);
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
export const getParentsEleve = (matricule) =>
  apiFetch(`/eleves/${matricule}/parents`);

export const getEnseignants = () => apiFetch("/professeurs/enseignants");
export const getEnseignantsActifs = () =>
  apiFetch("/professeurs/enseignants/actifs");
export const getTitulaires = () => apiFetch("/professeurs/titulaires");
export const getPersonnes = () => apiFetch("/professeurs/personnes");
export const createPersonne = (data) =>
  apiFetch("/professeurs/personnes", { method: "POST", body: JSON.stringify(data) });
export const deletePersonne = (id) =>
  apiFetch(`/professeurs/personnes/${id}`, { method: "DELETE" });
export const addParentToEleve = (matricule, data) =>
  apiFetch(`/eleves/${matricule}/parents`, { method: "POST", body: JSON.stringify(data) });

// Actions sur le personnel
export const createEnseignant = (data) =>
  apiFetch("/professeurs/enseignants", { method: "POST", body: JSON.stringify(data) });
export const createTitulaire = (data) =>
  apiFetch("/professeurs/titulaires", { method: "POST", body: JSON.stringify(data) });
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
export const createClasse = (data) =>
  apiFetch("/classes", { method: "POST", body: JSON.stringify(data) });
export const createSalle = (data) =>
  apiFetch("/classes/salles", { method: "POST", body: JSON.stringify(data) });
export const updateSalle = (id, data) =>
  apiFetch(`/classes/salles/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const createCours = (data) =>
  apiFetch("/cours", { method: "POST", body: JSON.stringify(data) });

export const getVilles = () => apiFetch("/villes");
export const seedVilles = () => apiFetch("/villes/seed", { method: "POST" });

export const getCours = () => apiFetch("/cours");

// ─── Bibliothèque (livres / spécialités) ───────────────────────────────────
export const getLivres = () => apiFetch("/cours/livres");
export const createLivre = (data) =>
  apiFetch("/cours/livres", { method: "POST", body: JSON.stringify(data) });
export const getSpecialites = () => apiFetch("/cours/specialites");
export const createSpecialite = (data) =>
  apiFetch("/cours/specialites", { method: "POST", body: JSON.stringify(data) });

// ─── Classement d'une session (bulletins) ──────────────────────────────────
export const getClassementSession = (idSession) =>
  apiFetch(`/evaluations/classement/session/${idSession}`);

export const getEmploi = () => apiFetch("/emploi");
export const getEmploiParClasse = (idClasse) =>
  apiFetch(`/emploi/classe/${idClasse}`);
export const createEmploi = (data) =>
  apiFetch("/emploi", { method: "POST", body: JSON.stringify(data) });
export const deleteEmploi = (id) =>
  apiFetch(`/emploi/${id}`, { method: "DELETE" });
export const verifierConflitsEmploi = (data) =>
  apiFetch("/emploi/verifier-conflits", { method: "POST", body: JSON.stringify(data) });

export const getPaiementsEleve = (matricule) =>
  apiFetch(`/paiements/eleve/${matricule}`);
export const getPaiementsAnnee = (idAca) => apiFetch(`/paiements/annee/${idAca}`);

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
export const validerMessage = (id) =>
  apiFetch(`/messagerie/${id}/valider`, { method: "PATCH" });
export const supprimerMessage = (id) =>
  apiFetch(`/messagerie/${id}`, { method: "DELETE" });

export const getRapportsEleve = (matricule) =>
  apiFetch(`/evaluations/rapports/eleve/${matricule}`);
export const createRapport = (data) =>
  apiFetch("/evaluations/rapports", { method: "POST", body: JSON.stringify(data) });
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
