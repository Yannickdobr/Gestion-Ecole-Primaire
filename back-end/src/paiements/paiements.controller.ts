import {
  Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards, HttpCode, HttpStatus, Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaiementsService } from './paiements.service';
import {
  CreateModeDto, UpdateModeDto, CreateScolariteDto, UpdateScolariteDto,
  CreateTrancheDto, UpdateTrancheDto, CreatePaiementDto, UpdatePaiementDto,
} from './dto/paiements.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FondateurGuard } from '../auth/fondateur.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role, DIRECTION } from '../auth/roles.enum';
import { AccessControlService } from '../common/access-control.service';

@ApiTags('Paiements')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
// Par défaut, la gestion financière est réservée à la direction et à la scolarité (comptable).
@Roles(...DIRECTION, Role.SCOLARITE)
@Controller('paiements')
export class PaiementsController {
  constructor(
    private readonly paiementsService: PaiementsService,
    private readonly acl: AccessControlService,
  ) {}

  // ── Modes ─────────────────────────────────────────────────────────────
  @Get('modes')
  @ApiOperation({ summary: 'Lister les modes de paiement actifs' })
  findAllModes() { return this.paiementsService.findAllModes(); }

  @Post('modes')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer un mode de paiement (espèces, virement…)' })
  createMode(@Body() dto: CreateModeDto) { return this.paiementsService.createMode(dto); }

  @Get('modes/:id')
  @ApiOperation({ summary: 'Détail d\'un mode de paiement' })
  findMode(@Param('id', ParseIntPipe) id: number) { return this.paiementsService.findModeById(id); }

  @Put('modes/:id')
  @ApiOperation({ summary: 'Modifier un mode de paiement' })
  updateMode(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateModeDto) { return this.paiementsService.updateMode(id, dto); }

  @Delete('modes/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer un mode de paiement' })
  removeMode(@Param('id', ParseIntPipe) id: number) { return this.paiementsService.removeMode(id); }

  // ── Scolarités ────────────────────────────────────────────────────────
  @Get('scolarites')
  @ApiOperation({ summary: 'Lister les paramètres de scolarité par cycle' })
  findAllScolarites() { return this.paiementsService.findAllScolarites(); }

  @Post('scolarites')
  @UseGuards(FondateurGuard) // réservé au Fondateur
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Définir les frais de scolarité d\'un cycle (Fondateur)' })
  createScolarite(@Body() dto: CreateScolariteDto) { return this.paiementsService.createScolarite(dto); }

  @Get('scolarites/par-cycle/:idCycle')
  @ApiOperation({ summary: 'Scolarité d\'un cycle spécifique' })
  findScolariteByCycle(@Param('idCycle', ParseIntPipe) idCycle: number) { return this.paiementsService.findScolariteByCycle(idCycle); }

  @Get('scolarites/:id')
  @ApiOperation({ summary: 'Détail d\'une scolarité avec ses tranches' })
  findScolarite(@Param('id', ParseIntPipe) id: number) { return this.paiementsService.findScolariteById(id); }

  @Put('scolarites/:id')
  @ApiOperation({ summary: 'Modifier une scolarité' })
  updateScolarite(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateScolariteDto) { return this.paiementsService.updateScolarite(id, dto); }

  @Delete('scolarites/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer une scolarité' })
  removeScolarite(@Param('id', ParseIntPipe) id: number) { return this.paiementsService.removeScolarite(id); }

  // ── Tranches ──────────────────────────────────────────────────────────
  @Post('tranches')
  @UseGuards(FondateurGuard) // réservé au Fondateur
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer une tranche de paiement (Fondateur)' })
  createTranche(@Body() dto: CreateTrancheDto) { return this.paiementsService.createTranche(dto); }

  @Get('tranches/par-scolarite/:idScolante')
  @ApiOperation({ summary: 'Tranches d\'une scolarité' })
  findTranchesByScolarite(@Param('idScolante', ParseIntPipe) idScolante: number) { return this.paiementsService.findTranchesByScolarite(idScolante); }

  @Get('tranches/:id')
  @ApiOperation({ summary: 'Détail d\'une tranche' })
  findTranche(@Param('id', ParseIntPipe) id: number) { return this.paiementsService.findTrancheById(id); }

  @Put('tranches/:id')
  @ApiOperation({ summary: 'Modifier une tranche' })
  updateTranche(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTrancheDto) { return this.paiementsService.updateTranche(id, dto); }

  @Delete('tranches/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer une tranche' })
  removeTranche(@Param('id', ParseIntPipe) id: number) { return this.paiementsService.removeTranche(id); }

  // ── Paiements ─────────────────────────────────────────────────────────
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Enregistrer un versement d\'un élève' })
  enregistrerPaiement(@Body() dto: CreatePaiementDto) { return this.paiementsService.enregistrerPaiement(dto); }

  @Post('rappels-impayes/:idAca')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'BF-23 : envoyer les rappels d\'impayés aux parents (année académique)' })
  envoyerRappelsImpayes(@Request() req, @Param('idAca', ParseIntPipe) idAca: number) {
    return this.paiementsService.envoyerRappelsImpayes(idAca, req.user);
  }

  @Get('eleve/:matricule')
  @Roles(...DIRECTION, Role.SCOLARITE, Role.PARENT) // un parent voit les paiements de SES enfants
  @ApiOperation({ summary: 'Historique des paiements d\'un élève' })
  async findPaiementsByEleve(@Request() req, @Param('matricule', ParseIntPipe) matricule: number) {
    await this.acl.assertEleveAccess(req.user, matricule);
    return this.paiementsService.findPaiementsByEleve(matricule);
  }

  @Get('annee/:idAca')
  @ApiOperation({ summary: 'Paiements d\'une année académique' })
  findPaiementsByAnnee(@Param('idAca', ParseIntPipe) idAca: number) { return this.paiementsService.findPaiementsByAnnee(idAca); }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'un paiement' })
  findPaiement(@Param('id', ParseIntPipe) id: number) { return this.paiementsService.findPaiementById(id); }

  @Put(':id')
  @ApiOperation({ summary: 'Modifier un paiement' })
  updatePaiement(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePaiementDto) { return this.paiementsService.updatePaiement(id, dto); }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer un paiement' })
  removePaiement(@Param('id', ParseIntPipe) id: number) { return this.paiementsService.removePaiement(id); }

  // ── Arriérés ──────────────────────────────────────────────────────────
  @Get('arrieres/:matricule/annee/:idAca')
  @Roles(...DIRECTION, Role.SCOLARITE, Role.PARENT)
  @ApiOperation({ summary: 'Calculer les arriérés d\'un élève (sans scolarité)' })
  async calculerArrieres(
    @Request() req,
    @Param('matricule', ParseIntPipe) matricule: number,
    @Param('idAca', ParseIntPipe) idAca: number,
  ) {
    await this.acl.assertEleveAccess(req.user, matricule);
    return this.paiementsService.calculerArrieres(matricule, idAca);
  }

  @Get('arrieres/:matricule/annee/:idAca/cycle/:idCycle')
  @Roles(...DIRECTION, Role.SCOLARITE, Role.PARENT)
  @ApiOperation({ summary: 'Calculer les arriérés avec scolarité du cycle' })
  async calculerArrieresAvecScolarite(
    @Request() req,
    @Param('matricule', ParseIntPipe) matricule: number,
    @Param('idAca', ParseIntPipe) idAca: number,
    @Param('idCycle', ParseIntPipe) idCycle: number,
  ) {
    await this.acl.assertEleveAccess(req.user, matricule);
    return this.paiementsService.calculerArriereAvecScolarite(matricule, idAca, idCycle);
  }
}
