import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe, UseGuards, HttpCode, HttpStatus, Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EvaluationsService } from './evaluations.service';
import {
  CreateTrimestreDto, UpdateTrimestreDto, CreateSessionDto, UpdateSessionDto,
  CreateNatureEpreuveDto, UpdateNatureEpreuveDto, CreateEpreuveDto, UpdateEpreuveDto,
  CreateEvaluationDto, UpdateEvaluationDto, CreateRapportDto, UpdateRapportDto,
} from './dto/evaluations.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role, DIRECTION } from '../auth/roles.enum';
import { AccessControlService } from '../common/access-control.service';

@ApiTags('Évaluations')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
// Défaut : personnel pédagogique (consultations). Les écritures sont restreintes ci-dessous.
@Roles(...DIRECTION, Role.ENSEIGNANT, Role.SCOLARITE)
@Controller('evaluations')
export class EvaluationsController {
  constructor(
    private readonly evaluationsService: EvaluationsService,
    private readonly acl: AccessControlService,
  ) {}

  // ── Trimestres ────────────────────────────────────────────────────────
  @Get('trimestres')
  @ApiOperation({ summary: 'Lister les trimestres' })
  findAllTrimestres() { return this.evaluationsService.findAllTrimestres(); }

  @Post('trimestres')
  @Roles(...DIRECTION)
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
  @Roles(...DIRECTION)
  @ApiOperation({ summary: 'Modifier un trimestre' })
  updateTrimestre(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTrimestreDto) { return this.evaluationsService.updateTrimestre(id, dto); }

  @Delete('trimestres/:id')
  @Roles(...DIRECTION)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer un trimestre' })
  removeTrimestre(@Param('id', ParseIntPipe) id: number) { return this.evaluationsService.removeTrimestre(id); }

  // ── Sessions ──────────────────────────────────────────────────────────
  @Get('sessions')
  @ApiOperation({ summary: 'Lister les sessions d\'examen' })
  findAllSessions() { return this.evaluationsService.findAllSessions(); }

  @Post('sessions')
  @Roles(...DIRECTION)
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
  @Roles(...DIRECTION)
  @ApiOperation({ summary: 'Modifier une session' })
  updateSession(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSessionDto) { return this.evaluationsService.updateSession(id, dto); }

  @Delete('sessions/:id')
  @Roles(...DIRECTION)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer une session' })
  removeSession(@Param('id', ParseIntPipe) id: number) { return this.evaluationsService.removeSession(id); }

  // ── Natures d'épreuves ────────────────────────────────────────────────
  @Get('natures')
  @ApiOperation({ summary: 'Lister les natures d\'épreuves (CC, examen…)' })
  findAllNatures() { return this.evaluationsService.findAllNatures(); }

  @Post('natures')
  @Roles(...DIRECTION)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer une nature d\'épreuve' })
  createNature(@Body() dto: CreateNatureEpreuveDto) { return this.evaluationsService.createNature(dto); }

  @Get('natures/:id')
  @ApiOperation({ summary: 'Détail d\'une nature' })
  findNature(@Param('id', ParseIntPipe) id: number) { return this.evaluationsService.findNatureById(id); }

  @Put('natures/:id')
  @Roles(...DIRECTION)
  @ApiOperation({ summary: 'Modifier une nature' })
  updateNature(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateNatureEpreuveDto) { return this.evaluationsService.updateNature(id, dto); }

  @Delete('natures/:id')
  @Roles(...DIRECTION)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer une nature' })
  removeNature(@Param('id', ParseIntPipe) id: number) { return this.evaluationsService.removeNature(id); }

  // ── Épreuves ──────────────────────────────────────────────────────────
  @Get('epreuves')
  @ApiOperation({ summary: 'Lister les épreuves' })
  findAllEpreuves() { return this.evaluationsService.findAllEpreuves(); }

  @Post('epreuves')
  @Roles(...DIRECTION)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer une épreuve' })
  createEpreuve(@Body() dto: CreateEpreuveDto) { return this.evaluationsService.createEpreuve(dto); }

  @Get('epreuves/:id')
  @ApiOperation({ summary: 'Détail d\'une épreuve' })
  findEpreuve(@Param('id', ParseIntPipe) id: number) { return this.evaluationsService.findEpreuveById(id); }

  @Put('epreuves/:id')
  @Roles(...DIRECTION)
  @ApiOperation({ summary: 'Modifier une épreuve' })
  updateEpreuve(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEpreuveDto) { return this.evaluationsService.updateEpreuve(id, dto); }

  @Delete('epreuves/:id')
  @Roles(...DIRECTION)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer une épreuve' })
  removeEpreuve(@Param('id', ParseIntPipe) id: number) { return this.evaluationsService.removeEpreuve(id); }

  // ── Notes ─────────────────────────────────────────────────────────────
  @Post('notes')
  @Roles(...DIRECTION, Role.ENSEIGNANT) // seuls la direction et l'enseignant saisissent les notes
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Saisir une note pour un élève' })
  saisirNote(@Body() dto: CreateEvaluationDto) { return this.evaluationsService.saisirNote(dto); }

  @Get('notes/eleve/:matricule')
  @Roles(...DIRECTION, Role.ENSEIGNANT, Role.SCOLARITE, Role.PARENT) // parent : ses enfants
  @ApiOperation({ summary: 'Toutes les notes d\'un élève' })
  async findNotesByEleve(@Request() req, @Param('matricule', ParseIntPipe) matricule: number) {
    await this.acl.assertEleveAccess(req.user, matricule);
    return this.evaluationsService.findNotesByEleve(matricule);
  }

  @Get('notes/session/:idSession')
  @ApiOperation({ summary: 'Notes d\'une session' })
  findNotesBySession(@Param('idSession', ParseIntPipe) idSession: number) { return this.evaluationsService.findNotesBySession(idSession); }

  @Get('notes/cours/:idCours')
  @ApiOperation({ summary: 'Notes d\'un cours' })
  findNotesByCours(@Param('idCours', ParseIntPipe) idCours: number) { return this.evaluationsService.findNotesByCours(idCours); }

  @Get('classement/session/:idSession')
  @ApiOperation({ summary: 'Classement d\'une session (moyennes + rangs)' })
  classementSession(@Param('idSession', ParseIntPipe) idSession: number) { return this.evaluationsService.classementSession(idSession); }

  @Get('notes/moyenne/:matricule/session/:idSession')
  @Roles(...DIRECTION, Role.ENSEIGNANT, Role.SCOLARITE, Role.PARENT)
  @ApiOperation({ summary: 'Calculer la moyenne d\'un élève pour une session' })
  async calculerMoyenne(
    @Request() req,
    @Param('matricule', ParseIntPipe) matricule: number,
    @Param('idSession', ParseIntPipe) idSession: number,
  ) {
    await this.acl.assertEleveAccess(req.user, matricule);
    return this.evaluationsService.calculerMoyenne(matricule, idSession);
  }

  @Put('notes/:id')
  @Roles(...DIRECTION, Role.ENSEIGNANT)
  @ApiOperation({ summary: 'Corriger une note' })
  updateNote(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEvaluationDto) { return this.evaluationsService.updateNote(id, dto); }

  @Delete('notes/:id')
  @Roles(...DIRECTION, Role.ENSEIGNANT)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer une note' })
  removeNote(@Param('id', ParseIntPipe) id: number) { return this.evaluationsService.removeNote(id); }

  // ── Rapports ──────────────────────────────────────────────────────────
  @Post('rapports')
  @Roles(...DIRECTION, Role.ENSEIGNANT)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer un bulletin de notes' })
  createRapport(@Body() dto: CreateRapportDto) { return this.evaluationsService.createRapport(dto); }

  @Get('rapports/eleve/:matricule')
  @Roles(...DIRECTION, Role.ENSEIGNANT, Role.SCOLARITE, Role.PARENT)
  @ApiOperation({ summary: 'Bulletins d\'un élève (tous trimestres)' })
  async findRapportsByEleve(@Request() req, @Param('matricule', ParseIntPipe) matricule: number) {
    await this.acl.assertEleveAccess(req.user, matricule);
    return this.evaluationsService.findRapportsByEleve(matricule);
  }

  @Get('rapports/stats-absences')
  @ApiOperation({ summary: 'Assiduité : comptage des absences/retards (dérivé des rapports)' })
  statsAbsences(@Query('idAca') idAca?: string) {
    return this.evaluationsService.statsAbsences(idAca ? Number(idAca) : undefined);
  }

  @Get('rapports/:id')
  @ApiOperation({ summary: 'Détail d\'un bulletin' })
  findRapport(@Param('id', ParseIntPipe) id: number) { return this.evaluationsService.findRapportById(id); }

  @Put('rapports/:id')
  @Roles(...DIRECTION, Role.ENSEIGNANT)
  @ApiOperation({ summary: 'Modifier un bulletin' })
  updateRapport(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRapportDto) { return this.evaluationsService.updateRapport(id, dto); }

  @Delete('rapports/:id')
  @Roles(...DIRECTION, Role.ENSEIGNANT)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer un bulletin' })
  removeRapport(@Param('id', ParseIntPipe) id: number) { return this.evaluationsService.removeRapport(id); }
}
