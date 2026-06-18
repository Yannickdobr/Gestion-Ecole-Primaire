import {
  Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EvaluationsService } from './evaluations.service';
import {
  CreateTrimestreDto, UpdateTrimestreDto, CreateSessionDto, UpdateSessionDto,
  CreateNatureEpreuveDto, UpdateNatureEpreuveDto, CreateEpreuveDto, UpdateEpreuveDto,
  CreateEvaluationDto, UpdateEvaluationDto, CreateRapportDto, UpdateRapportDto,
} from './dto/evaluations.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Évaluations')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('evaluations')
export class EvaluationsController {
  constructor(private readonly evaluationsService: EvaluationsService) {}

  // ── Trimestres ────────────────────────────────────────────────────────
  @Get('trimestres')
  @ApiOperation({ summary: 'Lister les trimestres' })
  findAllTrimestres() { return this.evaluationsService.findAllTrimestres(); }

  @Post('trimestres')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer un trimestre' })
  createTrimestre(@Body() dto: CreateTrimestreDto) { return this.evaluationsService.createTrimestre(dto); }

  @Get('trimestres/par-annee/:idAnnee')
  @ApiOperation({ summary: 'Trimestres d\'une année académique' })
  findTrimestresByAnnee(@Param('idAnnee', ParseIntPipe) idAnnee: number) { return this.evaluationsService.findTrimestresByAnnee(idAnnee); }

  @Get('trimestres/:id')
  @ApiOperation({ summary: 'Détail d\'un trimestre' })
  findTrimestre(@Param('id', ParseIntPipe) id: number) { return this.evaluationsService.findTrimestreById(id); }

  @Put('trimestres/:id')
  @ApiOperation({ summary: 'Modifier un trimestre' })
  updateTrimestre(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTrimestreDto) { return this.evaluationsService.updateTrimestre(id, dto); }

  @Delete('trimestres/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer un trimestre' })
  removeTrimestre(@Param('id', ParseIntPipe) id: number) { return this.evaluationsService.removeTrimestre(id); }

  // ── Sessions ──────────────────────────────────────────────────────────
  @Get('sessions')
  @ApiOperation({ summary: 'Lister les sessions d\'examen' })
  findAllSessions() { return this.evaluationsService.findAllSessions(); }

  @Post('sessions')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer une session d\'examen' })
  createSession(@Body() dto: CreateSessionDto) { return this.evaluationsService.createSession(dto); }

  @Get('sessions/par-trimestre/:idTrimes')
  @ApiOperation({ summary: 'Sessions d\'un trimestre' })
  findSessionsByTrimestre(@Param('idTrimes', ParseIntPipe) idTrimes: number) { return this.evaluationsService.findSessionsByTrimestre(idTrimes); }

  @Get('sessions/:id')
  @ApiOperation({ summary: 'Détail d\'une session' })
  findSession(@Param('id', ParseIntPipe) id: number) { return this.evaluationsService.findSessionById(id); }

  @Put('sessions/:id')
  @ApiOperation({ summary: 'Modifier une session' })
  updateSession(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSessionDto) { return this.evaluationsService.updateSession(id, dto); }

  @Delete('sessions/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer une session' })
  removeSession(@Param('id', ParseIntPipe) id: number) { return this.evaluationsService.removeSession(id); }

  // ── Natures d'épreuves ────────────────────────────────────────────────
  @Get('natures')
  @ApiOperation({ summary: 'Lister les natures d\'épreuves (CC, examen…)' })
  findAllNatures() { return this.evaluationsService.findAllNatures(); }

  @Post('natures')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer une nature d\'épreuve' })
  createNature(@Body() dto: CreateNatureEpreuveDto) { return this.evaluationsService.createNature(dto); }

  @Get('natures/:id')
  @ApiOperation({ summary: 'Détail d\'une nature' })
  findNature(@Param('id', ParseIntPipe) id: number) { return this.evaluationsService.findNatureById(id); }

  @Put('natures/:id')
  @ApiOperation({ summary: 'Modifier une nature' })
  updateNature(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateNatureEpreuveDto) { return this.evaluationsService.updateNature(id, dto); }

  @Delete('natures/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer une nature' })
  removeNature(@Param('id', ParseIntPipe) id: number) { return this.evaluationsService.removeNature(id); }

  // ── Épreuves ──────────────────────────────────────────────────────────
  @Get('epreuves')
  @ApiOperation({ summary: 'Lister les épreuves' })
  findAllEpreuves() { return this.evaluationsService.findAllEpreuves(); }

  @Post('epreuves')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer une épreuve' })
  createEpreuve(@Body() dto: CreateEpreuveDto) { return this.evaluationsService.createEpreuve(dto); }

  @Get('epreuves/:id')
  @ApiOperation({ summary: 'Détail d\'une épreuve' })
  findEpreuve(@Param('id', ParseIntPipe) id: number) { return this.evaluationsService.findEpreuveById(id); }

  @Put('epreuves/:id')
  @ApiOperation({ summary: 'Modifier une épreuve' })
  updateEpreuve(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEpreuveDto) { return this.evaluationsService.updateEpreuve(id, dto); }

  @Delete('epreuves/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer une épreuve' })
  removeEpreuve(@Param('id', ParseIntPipe) id: number) { return this.evaluationsService.removeEpreuve(id); }

  // ── Notes ─────────────────────────────────────────────────────────────
  @Post('notes')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Saisir une note pour un élève' })
  saisirNote(@Body() dto: CreateEvaluationDto) { return this.evaluationsService.saisirNote(dto); }

  @Get('notes/eleve/:matricule')
  @ApiOperation({ summary: 'Toutes les notes d\'un élève' })
  findNotesByEleve(@Param('matricule', ParseIntPipe) matricule: number) { return this.evaluationsService.findNotesByEleve(matricule); }

  @Get('notes/session/:idSession')
  @ApiOperation({ summary: 'Notes d\'une session' })
  findNotesBySession(@Param('idSession', ParseIntPipe) idSession: number) { return this.evaluationsService.findNotesBySession(idSession); }

  @Get('notes/cours/:idCours')
  @ApiOperation({ summary: 'Notes d\'un cours' })
  findNotesByCours(@Param('idCours', ParseIntPipe) idCours: number) { return this.evaluationsService.findNotesByCours(idCours); }

  @Get('notes/moyenne/:matricule/session/:idSession')
  @ApiOperation({ summary: 'Calculer la moyenne d\'un élève pour une session' })
  calculerMoyenne(
    @Param('matricule', ParseIntPipe) matricule: number,
    @Param('idSession', ParseIntPipe) idSession: number,
  ) { return this.evaluationsService.calculerMoyenne(matricule, idSession); }

  @Put('notes/:id')
  @ApiOperation({ summary: 'Corriger une note' })
  updateNote(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEvaluationDto) { return this.evaluationsService.updateNote(id, dto); }

  @Delete('notes/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer une note' })
  removeNote(@Param('id', ParseIntPipe) id: number) { return this.evaluationsService.removeNote(id); }

  // ── Rapports ──────────────────────────────────────────────────────────
  @Post('rapports')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer un bulletin de notes' })
  createRapport(@Body() dto: CreateRapportDto) { return this.evaluationsService.createRapport(dto); }

  @Get('rapports/eleve/:matricule')
  @ApiOperation({ summary: 'Bulletins d\'un élève (tous trimestres)' })
  findRapportsByEleve(@Param('matricule', ParseIntPipe) matricule: number) { return this.evaluationsService.findRapportsByEleve(matricule); }

  @Get('rapports/:id')
  @ApiOperation({ summary: 'Détail d\'un bulletin' })
  findRapport(@Param('id', ParseIntPipe) id: number) { return this.evaluationsService.findRapportById(id); }

  @Put('rapports/:id')
  @ApiOperation({ summary: 'Modifier un bulletin' })
  updateRapport(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRapportDto) { return this.evaluationsService.updateRapport(id, dto); }

  @Delete('rapports/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer un bulletin' })
  removeRapport(@Param('id', ParseIntPipe) id: number) { return this.evaluationsService.removeRapport(id); }
}