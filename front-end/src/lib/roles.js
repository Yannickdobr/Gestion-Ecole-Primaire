// Aiguillage central des rôles → tableau de bord.
// Admin : root/admin/fondateur/directeur (typeRole 0..3)
// Personne typeRole : 1=Enseignant, 2=Administratif, 3=Scolarité, 4=Parent, 5=Autres

export function homePathFor(user) {
  if (!user) return "/login";
  if (user.role === "admin") return "/dashboard/director";
  if (user.role === "personne") {
    if (user.typeRole === 1) return "/dashboard/teacher";
    if (user.typeRole === 2 || user.typeRole === 3) return "/dashboard/scolarite";
    if (user.typeRole === 4) return "/dashboard/parent";
    if (user.typeRole === 5) return "/dashboard/autres";
  }
  return "/dashboard/autres";
}

// ─── Hiérarchie admin ──────────────────────────────────────────────────────
// typeAdmin : 0=Root, 1=Admin standard, 2=Fondateur, 3=Directeur

/** Compte de gestion : Root, Fondateur ou Directeur (peut gérer personnel/structure). */
export function estManager(user) {
  return user?.role === "admin" && [0, 2, 3].includes(Number(user?.typeRole));
}

/** Admin standard (agent de saisie) : pas de gestion personnel/structure. */
export function estAdminStandard(user) {
  return user?.role === "admin" && Number(user?.typeRole) === 1;
}

/** L'utilisateur a-t-il le droit d'accéder à une zone (role + typeRoles autorisés) ? */
export function isAllowed(user, { role, typeRoles } = {}) {
  if (!user) return false;
  if (role && user.role !== role) return false;
  if (typeRoles && user.role === "personne" && !typeRoles.includes(user.typeRole)) return false;
  return true;
}
