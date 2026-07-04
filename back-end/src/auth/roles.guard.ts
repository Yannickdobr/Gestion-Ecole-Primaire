import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { Role, roleFromUser } from './roles.enum';

/**
 * Contrôle d'accès par rôle (RBAC — BNF-03/04).
 * À utiliser APRÈS JwtAuthGuard (qui renseigne req.user).
 * Si la route n'a pas de @Roles, on laisse passer (authentification suffit).
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const user = context.switchToHttp().getRequest().user;
    const role = roleFromUser(user);
    if (role && required.includes(role)) return true;

    throw new ForbiddenException(
      "Accès refusé : votre rôle n'autorise pas cette action.",
    );
  }
}
