/**
 * scheduleMockData.js
 * Mock data for the Emploi du Temps (Schedule) page.
 * Mirrors: EmploiDuTemps, Cours, Classe, Personne (Enseignant), Salle tables.
 * Replace with real API calls when backend is ready.
 */

// ── Classes (Classe table) ────────────────────────────────
export const mockClasses = [
  { idClasse: 1, libelle: 'CP A',  idCycle: 1 },
  { idClasse: 2, libelle: 'CP B',  idCycle: 1 },
  { idClasse: 3, libelle: 'CE1 A', idCycle: 1 },
  { idClasse: 4, libelle: 'CE1 B', idCycle: 1 },
  { idClasse: 5, libelle: 'CE2 A', idCycle: 2 },
  { idClasse: 6, libelle: 'CE2 B', idCycle: 2 },
  { idClasse: 7, libelle: 'CM1 A', idCycle: 2 },
  { idClasse: 8, libelle: 'CM1 B', idCycle: 2 },
  { idClasse: 9, libelle: 'CM2 A', idCycle: 2 },
  { idClasse: 10, libelle: 'CM2 B', idCycle: 2 },
];

// ── Persons / Teachers (Personne + Enseignant tables) ─────
export const mockEnseignants = [
  { idPers: 1,  nom: 'Nguema',   prenom: 'Claire',    initiales: 'NC', couleur: '#d86310', specialite: 'Mathématiques',   mobile: '+237 677 001 001' },
  { idPers: 2,  nom: 'Bello',    prenom: 'Hamidou',   initiales: 'BH', couleur: '#7a3b1e', specialite: 'Sciences',         mobile: '+237 677 002 002' },
  { idPers: 3,  nom: 'Fono',     prenom: 'Laure',     initiales: 'FL', couleur: '#ac3b02', specialite: 'Français',         mobile: '+237 677 003 003' },
  { idPers: 4,  nom: 'Mbarga',   prenom: 'Samuel',    initiales: 'MS', couleur: '#4a3728', specialite: 'Histoire-Géo',     mobile: '+237 677 004 004' },
  { idPers: 5,  nom: 'Atanga',   prenom: 'Béatrice',  initiales: 'AB', couleur: '#8a7060', specialite: 'Anglais',          mobile: '+237 677 005 005' },
  { idPers: 6,  nom: 'Eyinga',   prenom: 'Paul',      initiales: 'EP', couleur: '#d86310', specialite: 'EPS',              mobile: '+237 677 006 006' },
  { idPers: 7,  nom: 'Nkoa',     prenom: 'Estelle',   initiales: 'NE', couleur: '#7a3b1e', specialite: 'Arts Plastiques',  mobile: '+237 677 007 007' },
  { idPers: 8,  nom: 'Fouda',    prenom: 'Richard',   initiales: 'FR', couleur: '#ac3b02', specialite: 'Éducation Civique',mobile: '+237 677 008 008' },
];

// ── Salles (Salle table) ──────────────────────────────────
export const mockSalles = [
  { idSalle: 1,  libelle: 'Salle 101', position: 'Bâtiment A — Rez-de-chaussée', surface: '48m²', idClasse: 1 },
  { idSalle: 2,  libelle: 'Salle 102', position: 'Bâtiment A — Rez-de-chaussée', surface: '48m²', idClasse: 2 },
  { idSalle: 3,  libelle: 'Salle 201', position: 'Bâtiment A — 1er étage',        surface: '52m²', idClasse: 3 },
  { idSalle: 4,  libelle: 'Salle 202', position: 'Bâtiment A — 1er étage',        surface: '52m²', idClasse: 4 },
  { idSalle: 5,  libelle: 'Salle 301', position: 'Bâtiment B — Rez-de-chaussée', surface: '55m²', idClasse: 5 },
  { idSalle: 6,  libelle: 'Salle 302', position: 'Bâtiment B — Rez-de-chaussée', surface: '55m²', idClasse: 6 },
  { idSalle: 7,  libelle: 'Salle 401', position: 'Bâtiment B — 1er étage',        surface: '60m²', idClasse: 7 },
  { idSalle: 8,  libelle: 'Salle 402', position: 'Bâtiment B — 1er étage',        surface: '60m²', idClasse: 8 },
  { idSalle: 9,  libelle: 'Salle 501', position: 'Bâtiment C — Rez-de-chaussée', surface: '58m²', idClasse: 9 },
  { idSalle: 10, libelle: 'Salle 502', position: 'Bâtiment C — Rez-de-chaussée', surface: '58m²', idClasse: 10 },
  { idSalle: 11, libelle: 'Gymnase',   position: 'Annexe Sport',                  surface: '200m²', idClasse: null },
  { idSalle: 12, libelle: 'Salle Arts',position: 'Bâtiment C — 1er étage',        surface: '45m²', idClasse: null },
];

// ── Cours subjects (Cours table) ─────────────────────────
export const mockCours = [
  { idCours: 1,  libelle: 'Mathématiques',    coefficient: 3, departement: 'Sciences',   couleur: '#d86310' },
  { idCours: 2,  libelle: 'Français',         coefficient: 3, departement: 'Langues',    couleur: '#7a3b1e' },
  { idCours: 3,  libelle: 'Sciences',         coefficient: 2, departement: 'Sciences',   couleur: '#ac3b02' },
  { idCours: 4,  libelle: 'Histoire-Géo',     coefficient: 2, departement: 'Humanités',  couleur: '#4a3728' },
  { idCours: 5,  libelle: 'Anglais',          coefficient: 2, departement: 'Langues',    couleur: '#8a7060' },
  { idCours: 6,  libelle: 'EPS',              coefficient: 1, departement: 'Sport',      couleur: '#16a34a' },
  { idCours: 7,  libelle: 'Arts Plastiques',  coefficient: 1, departement: 'Arts',       couleur: '#d97706' },
  { idCours: 8,  libelle: 'Éducation Civique',coefficient: 1, departement: 'Humanités',  couleur: '#2563eb' },
];

/**
 * EmploiDuTemps entries.
 * `heure` = "08:00" start time; `duree` = duration in minutes (not in DB but needed for layout).
 * `status`: 'normal' | 'examen' | 'annule' | 'conflit'
 * `idPers`: teacher assigned (join from Enseignant → Personne)
 * `idSalle`: room assigned
 */
export const mockEmploiDuTemps = [
  // ── LUNDI ────────────────────────────────────────────
  { idTemps: 1,  jour: 'Lundi',    heure: '08:00', duree: 90,  idClasse: 9,  idCours: 1, idPers: 1, idSalle: 9,  status: 'normal'  },
  { idTemps: 2,  jour: 'Lundi',    heure: '08:00', duree: 90,  idClasse: 7,  idCours: 2, idPers: 3, idSalle: 7,  status: 'normal'  },
  { idTemps: 3,  jour: 'Lundi',    heure: '08:00', duree: 90,  idClasse: 5,  idCours: 3, idPers: 2, idSalle: 5,  status: 'normal'  },
  { idTemps: 4,  jour: 'Lundi',    heure: '09:30', duree: 90,  idClasse: 9,  idCours: 2, idPers: 3, idSalle: 9,  status: 'examen'  },
  { idTemps: 5,  jour: 'Lundi',    heure: '09:30', duree: 90,  idClasse: 7,  idCours: 4, idPers: 4, idSalle: 7,  status: 'normal'  },
  { idTemps: 6,  jour: 'Lundi',    heure: '09:30', duree: 90,  idClasse: 5,  idCours: 1, idPers: 1, idSalle: 5,  status: 'conflit' },
  // 11:00-11:15 = Récré (break — no slot)
  { idTemps: 7,  jour: 'Lundi',    heure: '11:15', duree: 90,  idClasse: 9,  idCours: 4, idPers: 4, idSalle: 9,  status: 'normal'  },
  { idTemps: 8,  jour: 'Lundi',    heure: '11:15', duree: 90,  idClasse: 7,  idCours: 5, idPers: 5, idSalle: 7,  status: 'normal'  },
  { idTemps: 9,  jour: 'Lundi',    heure: '11:15', duree: 90,  idClasse: 5,  idCours: 2, idPers: 3, idSalle: 5,  status: 'annule'  },
  // 12:45-14:00 = Pause déjeuner
  { idTemps: 10, jour: 'Lundi',    heure: '14:00', duree: 90,  idClasse: 9,  idCours: 5, idPers: 5, idSalle: 9,  status: 'normal'  },
  { idTemps: 11, jour: 'Lundi',    heure: '14:00', duree: 90,  idClasse: 7,  idCours: 6, idPers: 6, idSalle: 11, status: 'normal'  },
  { idTemps: 12, jour: 'Lundi',    heure: '15:30', duree: 90,  idClasse: 9,  idCours: 6, idPers: 6, idSalle: 11, status: 'normal'  },
  { idTemps: 13, jour: 'Lundi',    heure: '15:30', duree: 90,  idClasse: 7,  idCours: 3, idPers: 2, idSalle: 7,  status: 'normal'  },

  // ── MARDI ────────────────────────────────────────────
  { idTemps: 14, jour: 'Mardi',    heure: '08:00', duree: 90,  idClasse: 10, idCours: 1, idPers: 1, idSalle: 10, status: 'normal'  },
  { idTemps: 15, jour: 'Mardi',    heure: '08:00', duree: 90,  idClasse: 8,  idCours: 4, idPers: 4, idSalle: 8,  status: 'normal'  },
  { idTemps: 16, jour: 'Mardi',    heure: '09:30', duree: 90,  idClasse: 10, idCours: 3, idPers: 2, idSalle: 10, status: 'normal'  },
  { idTemps: 17, jour: 'Mardi',    heure: '09:30', duree: 90,  idClasse: 8,  idCours: 2, idPers: 3, idSalle: 8,  status: 'examen'  },
  { idTemps: 18, jour: 'Mardi',    heure: '11:15', duree: 90,  idClasse: 10, idCours: 2, idPers: 3, idSalle: 10, status: 'normal'  },
  { idTemps: 19, jour: 'Mardi',    heure: '11:15', duree: 90,  idClasse: 8,  idCours: 5, idPers: 5, idSalle: 8,  status: 'normal'  },
  { idTemps: 20, jour: 'Mardi',    heure: '14:00', duree: 90,  idClasse: 10, idCours: 7, idPers: 7, idSalle: 12, status: 'normal'  },
  { idTemps: 21, jour: 'Mardi',    heure: '14:00', duree: 90,  idClasse: 8,  idCours: 8, idPers: 8, idSalle: 8,  status: 'normal'  },

  // ── MERCREDI ─────────────────────────────────────────
  { idTemps: 22, jour: 'Mercredi', heure: '08:00', duree: 90,  idClasse: 3,  idCours: 1, idPers: 1, idSalle: 3,  status: 'normal'  },
  { idTemps: 23, jour: 'Mercredi', heure: '08:00', duree: 90,  idClasse: 1,  idCours: 2, idPers: 3, idSalle: 1,  status: 'normal'  },
  { idTemps: 24, jour: 'Mercredi', heure: '09:30', duree: 90,  idClasse: 3,  idCours: 3, idPers: 2, idSalle: 3,  status: 'normal'  },
  { idTemps: 25, jour: 'Mercredi', heure: '09:30', duree: 90,  idClasse: 1,  idCours: 1, idPers: 1, idSalle: 1,  status: 'conflit' },
  { idTemps: 26, jour: 'Mercredi', heure: '11:15', duree: 60,  idClasse: 3,  idCours: 5, idPers: 5, idSalle: 3,  status: 'normal'  },

  // ── JEUDI ────────────────────────────────────────────
  { idTemps: 27, jour: 'Jeudi',    heure: '08:00', duree: 90,  idClasse: 9,  idCours: 3, idPers: 2, idSalle: 9,  status: 'normal'  },
  { idTemps: 28, jour: 'Jeudi',    heure: '08:00', duree: 90,  idClasse: 7,  idCours: 1, idPers: 1, idSalle: 7,  status: 'normal'  },
  { idTemps: 29, jour: 'Jeudi',    heure: '09:30', duree: 90,  idClasse: 9,  idCours: 7, idPers: 7, idSalle: 12, status: 'normal'  },
  { idTemps: 30, jour: 'Jeudi',    heure: '09:30', duree: 90,  idClasse: 7,  idCours: 8, idPers: 8, idSalle: 7,  status: 'normal'  },
  { idTemps: 31, jour: 'Jeudi',    heure: '11:15', duree: 90,  idClasse: 9,  idCours: 8, idPers: 8, idSalle: 9,  status: 'normal'  },
  { idTemps: 32, jour: 'Jeudi',    heure: '14:00', duree: 90,  idClasse: 9,  idCours: 2, idPers: 3, idSalle: 9,  status: 'normal'  },
  { idTemps: 33, jour: 'Jeudi',    heure: '15:30', duree: 90,  idClasse: 9,  idCours: 4, idPers: 4, idSalle: 9,  status: 'normal'  },

  // ── VENDREDI ─────────────────────────────────────────
  { idTemps: 34, jour: 'Vendredi', heure: '08:00', duree: 90,  idClasse: 10, idCours: 5, idPers: 5, idSalle: 10, status: 'normal'  },
  { idTemps: 35, jour: 'Vendredi', heure: '08:00', duree: 90,  idClasse: 8,  idCours: 1, idPers: 1, idSalle: 8,  status: 'normal'  },
  { idTemps: 36, jour: 'Vendredi', heure: '09:30', duree: 90,  idClasse: 10, idCours: 4, idPers: 4, idSalle: 10, status: 'normal'  },
  { idTemps: 37, jour: 'Vendredi', heure: '09:30', duree: 90,  idClasse: 8,  idCours: 3, idPers: 2, idSalle: 8,  status: 'normal'  },
  { idTemps: 38, jour: 'Vendredi', heure: '11:15', duree: 90,  idClasse: 10, idCours: 6, idPers: 6, idSalle: 11, status: 'normal'  },
  { idTemps: 39, jour: 'Vendredi', heure: '11:15', duree: 90,  idClasse: 8,  idCours: 7, idPers: 7, idSalle: 12, status: 'normal'  },
  { idTemps: 40, jour: 'Vendredi', heure: '14:00', duree: 90,  idClasse: 10, idCours: 8, idPers: 8, idSalle: 10, status: 'normal'  },
  { idTemps: 41, jour: 'Vendredi', heure: '15:30', duree: 90,  idClasse: 10, idCours: 2, idPers: 3, idSalle: 10, status: 'normal'  },

  // ── SAMEDI (demi-journée) ─────────────────────────────
  { idTemps: 42, jour: 'Samedi',   heure: '08:00', duree: 90,  idClasse: 9,  idCours: 1, idPers: 1, idSalle: 9,  status: 'normal'  },
  { idTemps: 43, jour: 'Samedi',   heure: '08:00', duree: 90,  idClasse: 7,  idCours: 2, idPers: 3, idSalle: 7,  status: 'normal'  },
  { idTemps: 44, jour: 'Samedi',   heure: '09:30', duree: 90,  idClasse: 9,  idCours: 5, idPers: 5, idSalle: 9,  status: 'normal'  },
  { idTemps: 45, jour: 'Samedi',   heure: '09:30', duree: 90,  idClasse: 7,  idCours: 3, idPers: 2, idSalle: 7,  status: 'normal'  },
  { idTemps: 46, jour: 'Samedi',   heure: '11:15', duree: 60,  idClasse: 9,  idCours: 7, idPers: 7, idSalle: 12, status: 'normal'  },
];

// ── Breaks (not in DB — fixed school schedule) ────────────
export const SCHOOL_BREAKS = [
  { label_key: 'break_recre',    debut: '11:00', fin: '11:15', color: 'rgba(216,99,16,0.06)' },
  { label_key: 'break_dejeuner', debut: '12:45', fin: '14:00', color: 'rgba(122,59,30,0.06)' },
];

// ── Time slots on grid ────────────────────────────────────
export const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00',
  '11:15', '11:30', '12:00', '12:30', '12:45',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00',
];

export const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']; 
