import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';

/**
 * Limiteur de débit simple (en mémoire, sans dépendance externe) pour /auth/login.
 * Bloque une IP qui dépasse LIMIT tentatives dans une fenêtre de WINDOW ms
 * → atténue le brute-force sur les mots de passe.
 */
@Injectable()
export class LoginRateLimitGuard implements CanActivate {
  private readonly hits = new Map<string, { count: number; resetAt: number }>();
  private readonly LIMIT = 8;          // tentatives autorisées
  private readonly WINDOW = 60_000;    // par minute

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const ip =
      (req.headers?.['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.ip || req.socket?.remoteAddress || 'inconnue';
    const now = Date.now();

    // Purge paresseuse des entrées expirées (évite la croissance illimitée de la Map)
    for (const [k, v] of this.hits) if (now > v.resetAt) this.hits.delete(k);

    const entry = this.hits.get(ip);
    if (!entry || now > entry.resetAt) {
      this.hits.set(ip, { count: 1, resetAt: now + this.WINDOW });
      return true;
    }
    entry.count += 1;
    if (entry.count > this.LIMIT) {
      const secondes = Math.ceil((entry.resetAt - now) / 1000);
      throw new HttpException(
        `Trop de tentatives de connexion. Réessayez dans ${secondes} s.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    return true;
  }
}
