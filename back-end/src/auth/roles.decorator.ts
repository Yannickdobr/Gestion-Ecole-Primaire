import { SetMetadata } from '@nestjs/common';
import { Role } from './roles.enum';

export const ROLES_KEY = 'roles';

/**
 * Restreint une route (ou un contrôleur) aux rôles indiqués.
 * Ex. @Roles(...DIRECTION, Role.SCOLARITE)
 * Sans @Roles, la route reste accessible à tout utilisateur authentifié.
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
