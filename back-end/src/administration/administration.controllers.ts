import {
  Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe,
  UseGuards, HttpCode, HttpStatus, Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdministrationService } from './administration.service';
import {
  CreateJustificatifDto, CreateFicheEnseignantDto, CreateQuartierDto, CreateResidentDto,
} from './dto/administration.dto';

// Identifiant admin du compte connecté (sinon undefined → repli service)
const idAdminConnecte = (user: any) =>
  user?.role === 'admin' && user?.id ? Number(user.id) : undefined;

// ─── Justificatifs d'absence ────────────────────────────────────────────────
@ApiTags('Justificatifs')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('justificatifs')
export class JustificatifsController {
  constructor(private readonly service: AdministrationService) {}

  @Get()
  @ApiOperation({ summary: 'Lister tous les justificatifs' })
  findAll() { return this.service.findAllJustificatifs(); }

  @Get('rapport/:idRapport')
  @ApiOperation({ summary: "Justificatifs d'un rapport (absence/discipline)" })
  byRapport(@Param('idRapport', ParseIntPipe) idRapport: number) { return this.service.findJustificatifsByRapport(idRapport); }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Déposer un justificatif pour un rapport' })
  create(@Body() dto: CreateJustificatifDto) { return this.service.createJustificatif(dto); }

  @Patch(':id/valider')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Valider un justificatif (par la direction)' })
  valider(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.service.validerJustificatif(id, idAdminConnecte(req.user));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer un justificatif' })
  remove(@Param('id', ParseIntPipe) id: number) { return this.service.removeJustificatif(id); }
}

// ─── Fiches enseignant (suivi RH) ───────────────────────────────────────────
@ApiTags('Fiches enseignant')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('fiches-enseignant')
export class FicheEnseignantController {
  constructor(private readonly service: AdministrationService) {}

  @Get('enseignant/:idEnseignant')
  @ApiOperation({ summary: "Fiches RH d'un enseignant" })
  byEnseignant(@Param('idEnseignant', ParseIntPipe) idEnseignant: number) { return this.service.findFichesByEnseignant(idEnseignant); }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer une fiche de suivi pour un enseignant' })
  create(@Request() req, @Body() dto: CreateFicheEnseignantDto) {
    if (dto.idAdministratif == null) dto.idAdministratif = idAdminConnecte(req.user);
    return this.service.createFiche(dto);
  }

  @Delete(':idRap')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer une fiche enseignant' })
  remove(@Param('idRap', ParseIntPipe) idRap: number) { return this.service.removeFiche(idRap); }
}

// ─── Résidence (quartiers + résidents) ──────────────────────────────────────
@ApiTags('Résidence')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('residence')
export class ResidenceController {
  constructor(private readonly service: AdministrationService) {}

  // Quartiers
  @Get('quartiers')
  @ApiOperation({ summary: 'Lister les quartiers' })
  quartiers() { return this.service.findAllQuartiers(); }

  @Post('quartiers')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer un quartier' })
  createQuartier(@Body() dto: CreateQuartierDto) { return this.service.createQuartier(dto); }

  @Delete('quartiers/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer un quartier' })
  removeQuartier(@Param('id', ParseIntPipe) id: number) { return this.service.removeQuartier(id); }

  // Résidents
  @Get('residents')
  @ApiOperation({ summary: 'Lister les résidents (personne ↔ quartier)' })
  residents() { return this.service.findAllResidents(); }

  @Get('residents/quartier/:idQuartier')
  @ApiOperation({ summary: "Résidents d'un quartier" })
  residentsByQuartier(@Param('idQuartier', ParseIntPipe) idQuartier: number) { return this.service.findResidentsByQuartier(idQuartier); }

  @Post('residents')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Rattacher une personne à un quartier' })
  createResident(@Request() req, @Body() dto: CreateResidentDto) {
    if (dto.idAdmin == null) dto.idAdmin = idAdminConnecte(req.user);
    return this.service.createResident(dto);
  }

  @Delete('residents/:idResi')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retirer un résident' })
  removeResident(@Param('idResi', ParseIntPipe) idResi: number) { return this.service.removeResident(idResi); }
}
