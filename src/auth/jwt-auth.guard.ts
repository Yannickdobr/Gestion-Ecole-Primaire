import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard JWT – à appliquer sur les routes qui nécessitent une authentification
 *
 * Usage dans un contrôleur :
 * @UseGuards(JwtAuthGuard)
 * @Get('profil')
 * getProfil(@Request() req) { return req.user; }
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}