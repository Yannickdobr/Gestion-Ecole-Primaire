/**
 * Rôles applicatifs unifiés (comptes Admin + comptes Personne).
 * Le JWT porte { role: 'admin'|'personne', typeRole: number } ; on le traduit
 * ici en un rôle métier lisible utilisé par @Roles(...) et RolesGuard.
 */
export enum Role {
  // Comptes Admin (typeAdmin)
  ROOT = 'ROOT', // 0
  ADMIN_STD = 'ADMIN_STD', // 1 (déprécié)
  FONDATEUR = 'FONDATEUR', // 2
  DIRECTEUR = 'DIRECTEUR', // 3
  // Comptes Personne (typePersonne)
  ENSEIGNANT = 'ENSEIGNANT', // 1
  ADMINISTRATIF = 'ADMINISTRATIF', // 2
  SCOLARITE = 'SCOLARITE', // 3
  PARENT = 'PARENT', // 4
  AUTRES = 'AUTRES', // 5
}

/** La direction : accès de gestion complet. */
export const DIRECTION: Role[] = [Role.ROOT, Role.FONDATEUR, Role.DIRECTEUR];

/** Personnel de gestion (Secrétariat & Scolarité) : partagent les mêmes droits administratifs */
export const PERSONNEL: Role[] = [Role.ADMINISTRATIF, Role.SCOLARITE];

/** Déduit le rôle métier à partir du payload JWT (req.user). */
export function roleFromUser(
  user: { role?: string; typeRole?: number } | undefined,
): Role | null {
  if (!user) return null;
  const t = Number(user.typeRole);
  if (user.role === 'admin') {
    return (
      { 0: Role.ROOT, 1: Role.ADMIN_STD, 2: Role.FONDATEUR, 3: Role.DIRECTEUR }[
        t
      ] ?? null
    );
  }
  if (user.role === 'personne') {
    return (
      {
        1: Role.ENSEIGNANT,
        2: Role.ADMINISTRATIF,
        3: Role.SCOLARITE,
        4: Role.PARENT,
        5: Role.AUTRES,
      }[t] ?? null
    );
  }
  return null;
}
