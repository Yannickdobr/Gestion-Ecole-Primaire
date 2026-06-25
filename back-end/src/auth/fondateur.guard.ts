import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

/**
 * Autorise uniquement le Fondateur (Admin.typeAdmin === 2).
 * À utiliser après JwtAuthGuard (qui renseigne req.user).
 */
@Injectable()
export class FondateurGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const user = req.user;
    // Fondateur (2) — et Root (0) le super-admin. Directeur (3) et Admin (1) exclus.
    if (user?.role === 'admin' && [0, 2].includes(Number(user.typeRole))) return true;
    throw new ForbiddenException('Action réservée au Fondateur');
  }
}
