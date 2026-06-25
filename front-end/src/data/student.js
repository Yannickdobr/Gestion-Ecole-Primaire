// resolvedStudentSession.js
// Ce fichier simule l'état hydraté après les jointures SQL de votre mockData.json

export const currentStudentSession = {
  // Contexte de l'authentification (Table: Personne)
  auth: {
    idPers: 601,
    username: "c_eboutou",
    role: "student",
    typePersonne: 4, // Parent/Tuteur gérant le compte élève
    tokenSimule: "AL-PERS-601"
  },

  // Identité de l'élève actif (Tables: Parents + Eleve)
  studentProfile: {
    matricule: 20260001,
    idParent: 1001,
    nom: "EBOUTOU",
    prenom: "Marc",
    langue: "Français",
    photoURL: "/uploads/students/20260001.jpg", // Affiché dans l'avatar de la Navbar
    sexe: 1, // Utilisé pour accorder les adjectifs si nécessaire
  },

  // Contexte Scolaire Actuel (Tables: Frequente + Salle + Classe + AnneeAcademique)
  academicContext: {
    idAnnee: 2026,
    anneeLibelle: "Année Académique 2025/2026",
    idSalle: 6,
    salleLibelle: "Salle CM2 Élite",
    sallePosition: "1er Étage gauche",
    idClasse: 106,
    classeLibelle: "CM2",
    idCycle: 1 // Cycle Francophone
  },

  // Liste des Notifications de la Navbar (Générée via Tables: Evaluation + Cours + Paiement)
  notifications: [
    {
      idNotif: "notif-9001",
      idEval: 9001,
      type: "EVALUATION",
      title: "Nouvelle note disponible",
      // Jointure effectuée avec la table Cours (idCours: 1001)
      subject: "Mathématiques (Calcul)", 
      note: 15.5,
      appreciation: "Bien. Poursuivez ainsi.",
      timestamp: "2026-10-12T14:00:00Z",
      isRead: false
    },
    {
      idNotif: "notif-3001",
      idPaiement: 3001,
      type: "FINANCE",
      title: "Reçu de paiement disponible",
      montant: 45000.0,
      commentaire: "Première tranche scolarité",
      urlReceipt: "/uploads/receipts/rec_3001.pdf",
      timestamp: "2025-09-05T10:30:00Z",
      isRead: true
    }
  ],

  // Méta-données de contrôle pour l'UI de la Navbar
  uiCounters: {
    unreadCount: 1, // Nombre de points oranges sur la cloche
    activeLanguage: "FR"
  }
};