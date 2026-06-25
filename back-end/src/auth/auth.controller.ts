import {
  Controller,
  Post,
  Patch,
  Delete,
  Param,
  ParseIntPipe,
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
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LoginRateLimitGuard } from './login-rate-limit.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(LoginRateLimitGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Se connecter', description: 'Retourne un token JWT valable 8h (rate-limité)' })
  @ApiResponse({ status: 200, description: 'Connexion réussie → access_token retourné' })
  @ApiResponse({ status: 401, description: 'Identifiants incorrects' })
  @ApiResponse({ status: 404, description: 'Utilisateur introuvable' })
  @ApiResponse({ status: 429, description: 'Trop de tentatives de connexion' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Renouveler son token', description: 'Session glissante : émet un nouveau token si le token courant est encore valide' })
  @ApiResponse({ status: 200, description: 'Nouveau access_token retourné' })
  refresh(@Request() req) {
    return this.authService.refresh(req.user);
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

  @UseGuards(JwtAuthGuard)
  @Patch('password')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Changer mon mot de passe' })
  @ApiResponse({ status: 200, description: 'Mot de passe modifié' })
  @ApiResponse({ status: 401, description: 'Ancien mot de passe incorrect' })
  @HttpCode(HttpStatus.OK)
  changePassword(@Request() req, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(req.user, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('admins')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Lister les administrateurs (selon la visibilité du demandeur)' })
  listAdmins(@Request() req) {
    return this.authService.listAdmins(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('admins')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Créer un compte admin (Root/Fondateur, selon hiérarchie)' })
  createAdmin(@Request() req, @Body() dto: CreateAdminDto) {
    return this.authService.createAdmin(dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('admins/:id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Supprimer un administrateur (Root/Fondateur uniquement)' })
  removeAdmin(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.authService.removeAdmin(id, req.user);
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