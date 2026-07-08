import {
  Controller, Get, Post, Put, Patch, Delete,
  Body, Param, Query, ParseIntPipe, UseGuards, HttpCode, HttpStatus, Request, ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ProfesseursService } from './professeurs.service';
import {
  CreatePersonneEnseignantDto, UpdatePersonneEnseignantDto,
  CreateEnseignantDto, CreateTitulaireDto,
} from './dto/professeur.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ManagerGuard } from '../auth/manager.guard';

// Compte de gestion : Root (0), Fondateur (2), Directeur (3) — pas l'Admin standard (1)
const estManager = (user: any) =>
  user?.role === 'admin' && [0, 2, 3].includes(Number(user.typeRole));

@ApiTags('Professeurs')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('professeurs')
export class ProfesseursController {
  constructor(private readonly professeursService: ProfesseursService) {}

  // ── Personnes ─────────────────────────────────────────────────────────────
  @Post('personnes')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer le profil d\'une personne (parent = saisie ; staff = gestion)' })
  createPersonne(@Request() req, @Body() dto: CreatePersonneEnseignantDto) {
    // La création de PERSONNEL (tous types sauf Parent=4) est réservée à la direction.
    // La création d'un PARENT (4) reste ouverte à la saisie courante (Admin standard, scolarité).
    if (Number(dto.typePersonne) !== 4 && !estManager(req.user)) {
      throw new ForbiddenException(
        "La création de personnel est réservée à la direction (Directeur, Fondateur).",
      );
    }
    return this.professeursService.createPersonne(dto, req.user);
  }

  @Get('personnes')
  @ApiOperation({ summary: 'Lister tous les enseignants (Personnes typePersonne=1)' })
  findAllPersonnes() { return this.professeursService.findAllPersonnes(); }

  @Get('personnes/search')
  @ApiOperation({ summary: 'Rechercher un enseignant par nom ou prénom' })
  @ApiQuery({ name: 'q', required: true })
  search(@Query('q') query: string) { return this.professeursService.search(query ?? ''); }

  @Get('personnes/tous')
  @ApiOperation({ summary: 'Lister toutes les personnes (tous types confondus)' })
  findAllPersonnesTous() { return this.professeursService.findAllPersonnesTous(); }

  @Get('personnes/:id')
  @ApiOperation({ summary: 'Détail d\'un enseignant' })
  findPersonne(@Param('id', ParseIntPipe) id: number) { return this.professeursService.findPersonneById(id); }

  @Put('personnes/:id')
  @ApiOperation({ summary: 'Modifier un enseignant' })
  updatePersonne(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePersonneEnseignantDto) {
    return this.professeursService.updatePersonne(id, dto);
  }

  @Delete('personnes/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ManagerGuard)
  @ApiOperation({ summary: 'Supprimer un compte personnel (réservé à la direction)' })
  removePersonne(@Param('id', ParseIntPipe) id: number, @Query('force') force?: string) { return this.professeursService.removePersonne(id, force === 'true'); }

  // ── Enseignants ───────────────────────────────────────────────────────────
  @Post('enseignants')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(ManagerGuard)
  @ApiOperation({ summary: 'Affecter une personne comme enseignant' })
  createEnseignant(@Body() dto: CreateEnseignantDto) { return this.professeursService.createEnseignant(dto); }

  @Patch('enseignants/:id/difficulte')
  @UseGuards(ManagerGuard)
  @ApiOperation({ summary: 'Définir/effacer la matière de difficulté d\'un enseignant (idCours, ou null)' })
  setMatiereDifficulte(@Param('id', ParseIntPipe) id: number, @Body() body: { idCours: number | null }) {
    return this.professeursService.setMatiereDifficulte(id, body?.idCours ?? null);
  }

  @Get('enseignants')
  @ApiOperation({ summary: 'Lister tous les enseignants' })
  findAllEnseignants() { return this.professeursService.findAllEnseignants(); }

  @Get('enseignants/actifs')
  @ApiOperation({ summary: 'Lister les enseignants actifs' })
  findEnseignantsActifs() { return this.professeursService.findEnseignantsActifs(); }

  @Get('enseignants/:id')
  @ApiOperation({ summary: 'Détail d\'un enseignant' })
  findEnseignant(@Param('id', ParseIntPipe) id: number) { return this.professeursService.findEnseignantById(id); }

  @Patch('enseignants/:id/desactiver')
  @UseGuards(ManagerGuard)
  @ApiOperation({ summary: 'Désactiver un enseignant' })
  desactiverEnseignant(@Param('id', ParseIntPipe) id: number) { return this.professeursService.desactiverEnseignant(id); }

  @Patch('enseignants/:id/activer')
  @UseGuards(ManagerGuard)
  @ApiOperation({ summary: 'Réactiver un enseignant' })
  activerEnseignant(@Param('id', ParseIntPipe) id: number) { return this.professeursService.activerEnseignant(id); }

  @Delete('enseignants/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ManagerGuard)
  @ApiOperation({ summary: 'Supprimer un enseignant' })
  removeEnseignant(@Param('id', ParseIntPipe) id: number, @Query('force') force?: string) { return this.professeursService.removeEnseignant(id, force === 'true'); }

  // ── Titulaires ────────────────────────────────────────────────────────────
  @Post('titulaires')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(ManagerGuard)
  @ApiOperation({ summary: 'Affecter une personne comme titulaire de classe' })
  createTitulaire(@Body() dto: CreateTitulaireDto) { return this.professeursService.createTitulaire(dto); }

  @Patch('titulaires/:id/salle')
  @UseGuards(ManagerGuard)
  @ApiOperation({ summary: 'Modifier la salle d\'un titulaire (réaffectation)' })
  updateTitulaire(@Param('id', ParseIntPipe) id: number, @Body() body: { idSalle: number }) {
    return this.professeursService.updateTitulaire(id, Number(body?.idSalle));
  }

  @Get('titulaires')
  @ApiOperation({ summary: 'Lister tous les titulaires' })
  findAllTitulaires() { return this.professeursService.findAllTitulaires(); }

  @Get('titulaires/:id')
  @ApiOperation({ summary: 'Détail d\'un titulaire' })
  findTitulaire(@Param('id', ParseIntPipe) id: number) { return this.professeursService.findTitulaireById(id); }

  @Patch('titulaires/:id/desactiver')
  @UseGuards(ManagerGuard)
  @ApiOperation({ summary: 'Désactiver un titulaire' })
  desactiverTitulaire(@Param('id', ParseIntPipe) id: number) { return this.professeursService.desactiverTitulaire(id); }

  @Delete('titulaires/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ManagerGuard)
  @ApiOperation({ summary: 'Supprimer un titulaire' })
  removeTitulaire(@Param('id', ParseIntPipe) id: number, @Query('force') force?: string) { return this.professeursService.removeTitulaire(id, force === 'true'); }
}