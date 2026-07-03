import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { EmploiService } from './emploi.service';
import { CreateEmploiDuTempsDto, UpdateEmploiDuTempsDto, CreateJourSemaineDto, UpdateJourSemaineDto } from './dto/emploi.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Emploi du Temps')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('emploi')
export class EmploiController {
  constructor(private readonly emploiService: EmploiService) {}

  // ── Jours ─────────────────────────────────────────────────────────────
  @Get('jours')
  @ApiOperation({ summary: 'Lister les jours de la semaine' })
  findAllJours() { return this.emploiService.findAllJours(); }

  @Post('jours')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer un jour' })
  createJour(@Body() dto: CreateJourSemaineDto) { return this.emploiService.createJour(dto); }

  @Post('jours/seed')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '⚡ Initialiser Lundi → Samedi (à faire une seule fois)' })
  seedJours() { return this.emploiService.seedJours(); }

  @Get('jours/:id')
  @ApiOperation({ summary: 'Détail d\'un jour' })
  findJour(@Param('id', ParseIntPipe) id: number) { return this.emploiService.findJourById(id); }

  @Put('jours/:id')
  @ApiOperation({ summary: 'Modifier un jour' })
  updateJour(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateJourSemaineDto) { return this.emploiService.updateJour(id, dto); }

  @Delete('jours/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer un jour' })
  removeJour(@Param('id', ParseIntPipe) id: number) { return this.emploiService.removeJour(id); }

  // ── Créneaux ──────────────────────────────────────────────────────────
  @Get()
  @ApiOperation({ summary: 'Tous les créneaux (toutes classes confondues)' })
  findAll() { return this.emploiService.findAll(); }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer un créneau (détecte automatiquement les conflits)' })
  createCreneau(@Body() dto: CreateEmploiDuTempsDto) { return this.emploiService.createCreneau(dto); }

  @Post('verifier-conflits')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Vérifier les conflits sans créer le créneau' })
  verifierConflits(@Body() dto: CreateEmploiDuTempsDto) { return this.emploiService.verifierConflits(dto); }

  @Get('classe/:idClasse')
  @ApiOperation({ summary: 'Emploi du temps d\'une classe (trié par jour et heure)' })
  findByClasse(@Param('idClasse', ParseIntPipe) idClasse: number) { return this.emploiService.findByClasse(idClasse); }

  @Get('cours/:idCours')
  @ApiOperation({ summary: 'Créneaux d\'un cours dans toutes les classes' })
  findByCours(@Param('idCours', ParseIntPipe) idCours: number) { return this.emploiService.findByCours(idCours); }

  @Get('jour')
  @ApiOperation({ summary: 'Emploi du temps d\'un jour donné' })
  @ApiQuery({ name: 'jour', required: true, example: 'Lundi' })
  findByJour(@Query('jour') jour: string) { return this.emploiService.findByJour(jour ?? 'Lundi'); }

  @Get('interim')
  @ApiOperation({ summary: 'Plan d\'intérim dérivé (échanges matière de difficulté ↔ intérimaire)' })
  planInterim() { return this.emploiService.planInterim(); }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'un créneau' })
  findCreneau(@Param('id', ParseIntPipe) id: number) { return this.emploiService.findCreneauById(id); }

  @Put(':id')
  @ApiOperation({ summary: 'Modifier un créneau' })
  updateCreneau(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEmploiDuTempsDto) { return this.emploiService.updateCreneau(id, dto); }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer un créneau' })
  removeCreneau(@Param('id', ParseIntPipe) id: number) { return this.emploiService.removeCreneau(id); }

  @Delete('classe/:idClasse/reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Vider l\'emploi du temps d\'une classe' })
  resetEmploiClasse(@Param('idClasse', ParseIntPipe) idClasse: number) { return this.emploiService.removeAllByClasse(idClasse); }
}