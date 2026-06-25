/**
 * directorMockData.js
 * Mock data for the Director Dashboard.
 * All data structures mirror the SQL schema (Ecole-primaire.sql).
 * Replace each section with real API calls when the backend is ready.
 */

// ── Admin (typeAdmin: 3 = Directeur) ─────────────────────
export const mockDirecteur = {
  ID: 1,
  nom: 'TIOKANG',
  prenom: 'Jorel',
  username: 'directeur.tiokang',
  typeAdmin: 3,
  mobile: '+237 699 123 456',
  initiales: 'TJ',
};

// ── KPI Metrics ───────────────────────────────────────────
export const mockKPIs = {
  totalEleves: 312,
  deltaEleves: '+14',          // vs last month
  totalEnseignants: 24,
  deltaEnseignants: '+2',
  totalClasses: 12,
  sallesDisponibles: 14,
  tauxPresence: 87,            // percentage 0–100
  deltaPresence: '+3%',
  justificatifsEnAttente: 5,
  rapportsEnAttente: 3,
};

// ── Attendance trend (last 7 months) ── Evaluation / session data ─
export const mockAttendanceTrend = [
  { mois: 'Sep', present: 91, absent: 9 },
  { mois: 'Oct', present: 88, absent: 12 },
  { mois: 'Nov', present: 85, absent: 15 },
  { mois: 'Dec', present: 90, absent: 10 },
  { mois: 'Jan', present: 78, absent: 22 },
  { mois: 'Fév', present: 84, absent: 16 },
  { mois: 'Mar', present: 87, absent: 13 },
];

// ── Class performance (avg grade per class) ── Evaluation table ─
export const mockClassPerformance = [
  { classe: 'CP',  moyenne: 13.2 },
  { classe: 'CE1', moyenne: 12.8 },
  { classe: 'CE2', moyenne: 14.1 },
  { classe: 'CM1', moyenne: 11.9 },
  { classe: 'CM2', moyenne: 13.7 },
];

// ── Annonces ── Messages (type_message = 1) ───────────────
export const mockAnnonces = [
  {
    idMessages: 1,
    auteur: 'Mme Nguema Claire',
    role: 'Mathématiques — CM2 B',
    initiales: 'NC',
    couleur: '#d86310',
    objet: 'Composition de Mathématiques',
    information: 'Rappel : la composition de mathématiques du 1er trimestre est prévue le jeudi 5 juin. Préparez-vous sérieusement.',
    created_at: '2026-05-25T08:42:00',
  },
  {
    idMessages: 2,
    auteur: 'M. Bello Hamidou',
    role: 'Sciences — CE2 A',
    initiales: 'BH',
    couleur: '#7a3b1e',
    objet: 'Sortie Pédagogique confirmée',
    information: 'La sortie au Jardin Botanique de Yaoundé est confirmée pour le 12 juin. Autorisations parentales à remettre avant le 8 juin.',
    created_at: '2026-05-25T07:15:00',
  },
  {
    idMessages: 3,
    auteur: 'Administration',
    role: 'Direction Générale',
    initiales: 'AD',
    couleur: '#ac3b02',
    objet: 'Cahiers de textes numérisés',
    information: 'Tous les enseignants doivent soumettre leurs cahiers de textes numérisés avant vendredi 6 juin à 17h00.',
    created_at: '2026-05-24T14:00:00',
  },
  {
    idMessages: 4,
    auteur: 'Mme Fono Laure',
    role: 'Français — CM1 A',
    initiales: 'FL',
    couleur: '#4a3728',
    objet: 'Résultats dictée de contrôle',
    information: 'Résultats disponibles. Moyenne générale : 13,2/20. Félicitations à tous les élèves de CM1 A.',
    created_at: '2026-05-24T11:30:00',
  },
];

// ── Événements ── Epreuve / Session / Trimestre ───────────
export const mockEvenements = [
  {
    id: 1,
    jour: '06',
    mois: 'JUN',
    titre: 'Conseil des Maîtres — T1',
    heure: '14h00 – 17h00',
    lieu: 'Salle de conférence',
    type: 'conseil',
  },
  {
    id: 2,
    jour: '12',
    mois: 'JUN',
    titre: 'Sortie Pédagogique CE2',
    heure: '07h30 – 16h00',
    lieu: 'Jardin Botanique, Yaoundé',
    type: 'sortie',
  },
  {
    id: 3,
    jour: '19',
    mois: 'JUN',
    titre: 'Réunion Parents-Professeurs',
    heure: '09h00 – 12h00',
    lieu: 'Amphithéâtre principal',
    type: 'reunion',
  },
  {
    id: 4,
    jour: '27',
    mois: 'JUN',
    titre: 'Remise des bulletins',
    heure: '08h00 – 11h00',
    lieu: 'Toutes les classes',
    type: 'bulletin',
  },
];

// ── Trimestre ─────────────────────────────────────────────
export const mockTrimestre = {
  idTrimestre: 1,
  libelle: '1er Trimestre',
  periode: 'Septembre 2025 – Janvier 2026',
  debut: '2025-09-01',
  fin: '2026-01-31',
  sessionExamen: '15 – 28 Jan. 2026',
  avancement: 68,             // percent
  prochain: '2ème Trimestre — Fév. 2026',
};

// ── Justificatifs en attente ───────────────────────────────
export const mockJustificatifs = [
  {
    id: 1,
    eleve: 'Kamga Paul-Eric',
    classe: 'CM2 A',
    motif: 'Absence maladie — 3 jours',
    date: '02 Jun 2025',
  },
  {
    id: 2,
    eleve: 'Mvondo Awa',
    classe: 'CE1 B',
    motif: 'Décès familial',
    date: '29 Mai 2025',
  },
  {
    id: 3,
    eleve: 'Talla Simon',
    classe: 'CE2 A',
    motif: 'Consultation médicale',
    date: '28 Mai 2025',
  },
];

// ── Rapports disciplinaires ── Rapport table ──────────────
export const mockRapports = [
  {
    idRap: 1,
    eleve: 'Nkoa Junior',
    classe: 'CM1 B',
    libelle: 'Comportement perturbateur',
    points: -5,
    event_date: '03 Jun',
  },
  {
    idRap: 2,
    eleve: 'Essama Diane',
    classe: 'CE2 B',
    libelle: 'Absentéisme répété',
    points: -8,
    event_date: '01 Jun',
  },
  {
    idRap: 3,
    eleve: 'Bilong Marc',
    classe: 'CM2 B',
    libelle: 'Insolence envers un enseignant',
    points: -10,
    event_date: '30 Mai',
  },
];

// ── Distribution élèves ── Eleve table ────────────────────
export const mockDistribution = {
  eleves: { filles: 162, garcons: 150, total: 312 },
  enseignants: { femmes: 14, hommes: 10, total: 24 },
  parClasse: [
    { nom: 'CP',  effectif: 48 },
    { nom: 'CE1', effectif: 55 },
    { nom: 'CE2', effectif: 52 },
    { nom: 'CM1', effectif: 60 },
    { nom: 'CM2', effectif: 57 },
  ],
};

// ── Pupils preview ── Eleve + Personne ───────────────────
export const mockTopEleves = [
  { matricule: 'BS-2025-001', nom: 'Abena Sophie',   classe: 'CM2 A', moyenne: 17.4, photo: null, initiales: 'AS', couleur: '#d86310' },
  { matricule: 'BS-2025-002', nom: 'Fouda Emmanuel',  classe: 'CM1 B', moyenne: 16.9, photo: null, initiales: 'FE', couleur: '#7a3b1e' },
  { matricule: 'BS-2025-003', nom: 'Mballa Christelle',classe: 'CE2 A', moyenne: 16.2, photo: null, initiales: 'MC', couleur: '#ac3b02' },
  { matricule: 'BS-2025-004', nom: 'Nanga Patrick',   classe: 'CM2 B', moyenne: 15.8, photo: null, initiales: 'NP', couleur: '#4a3728' },
];
