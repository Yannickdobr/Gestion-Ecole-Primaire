import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

/**
 * Autorise les comptes de gestion : Root (0), Fondateur (2) et Directeur (3).
 * Bloque l'« Admin standard » (1) — agent de saisie — et tout compte non-admin.
 * À utiliser après JwtAuthGuard (qui renseigne req.user).
 *
 * Sert à protéger les actions de gestion : personnel, structure
 * (cycles/classes/salles), titulaires, messagerie de masse.
 */
@Injectable()
export class ManagerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const user = req.user;
    if (user?.role === 'admin' && [0, 2, 3].includes(Number(user.typeRole))) return true;
    throw new ForbiddenException(
      "Action réservée à la direction (Directeur, Fondateur). L'Admin standard n'a pas ce droit.",
    );
  }
}
