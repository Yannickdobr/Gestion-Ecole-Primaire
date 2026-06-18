import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Se connecter', description: 'Retourne un token JWT valable 8h' })
  @ApiResponse({ status: 200, description: 'Connexion réussie → access_token retourné' })
  @ApiResponse({ status: 401, description: 'Identifiants incorrects' })
  @ApiResponse({ status: 404, description: 'Utilisateur introuvable' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profil')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Mon profil', description: 'Retourne les infos du compte connecté' })
  @ApiResponse({ status: 200, description: 'Profil retourné' })
  @ApiResponse({ status: 401, description: 'Token manquant ou invalide' })
  getProfil(@Request() req) {
    return { message: 'Authentifié avec succès', user: req.user };
  }

  @Post('seed-admin')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '⚠️ Créer le premier admin',
    description: 'À utiliser une seule fois lors de l\'initialisation. Supprimer en production.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['nom', 'username', 'password'],
      properties: {
        nom:      { type: 'string', example: 'Directeur' },
        username: { type: 'string', example: 'admin' },
        password: { type: 'string', example: 'motdepasse123' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Premier admin créé' })
  async seedAdmin(
    @Body() body: { nom: string; username: string; password: string },
  ) {
    return this.authService.createFirstAdmin(body.nom, body.username, body.password);
  }
}