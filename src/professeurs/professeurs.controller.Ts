import {
  Controller, Get, Post, Put, Patch, Delete,
  Body, Param, Query, ParseIntPipe, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ProfesseursService } from './professeurs.service';
import {
  CreatePersonneEnseignantDto, UpdatePersonneEnseignantDto,
  CreateEnseignantDto, CreateTitulaireDto,
} from './dto/professeur.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Professeurs')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('professeurs')
export class ProfesseursController {
  constructor(private readonly professeursService: ProfesseursService) {}

  // ── Personnes ─────────────────────────────────────────────────────────────
  @Post('personnes')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer le profil d\'un enseignant (Personne)' })
  createPersonne(@Body() dto: CreatePersonneEnseignantDto) { return this.professeursService.createPersonne(dto); }

  @Get('personnes')
  @ApiOperation({ summary: 'Lister tous les enseignants (Personnes typePersonne=2)' })
  findAllPersonnes() { return this.professeursService.findAllPersonnes(); }

  @Get('personnes/search')
  @ApiOperation({ summary: 'Rechercher un enseignant par nom ou prénom' })
  @ApiQuery({ name: 'q', required: true })
  search(@Query('q') query: string) { return this.professeursService.search(query ?? ''); }

  @Get('personnes/:id')
  @ApiOperation({ summary: 'Détail d\'un enseignant' })
  findPersonne(@Param('id', ParseIntPipe) id: number) { return this.professeursService.findPersonneById(id); }

  @Put('personnes/:id')
  @ApiOperation({ summary: 'Modifier un enseignant' })
  updatePersonne(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePersonneEnseignantDto) {
    return this.professeursService.updatePersonne(id, dto);
  }

  // ── Enseignants ───────────────────────────────────────────────────────────
  @Post('enseignants')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Affecter une personne comme enseignant' })
  createEnseignant(@Body() dto: CreateEnseignantDto) { return this.professeursService.createEnseignant(dto); }

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
  @ApiOperation({ summary: 'Désactiver un enseignant' })
  desactiverEnseignant(@Param('id', ParseIntPipe) id: number) { return this.professeursService.desactiverEnseignant(id); }

  @Patch('enseignants/:id/activer')
  @ApiOperation({ summary: 'Réactiver un enseignant' })
  activerEnseignant(@Param('id', ParseIntPipe) id: number) { return this.professeursService.activerEnseignant(id); }

  @Delete('enseignants/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer un enseignant' })
  removeEnseignant(@Param('id', ParseIntPipe) id: number) { return this.professeursService.removeEnseignant(id); }

  // ── Titulaires ────────────────────────────────────────────────────────────
  @Post('titulaires')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Affecter une personne comme titulaire de classe' })
  createTitulaire(@Body() dto: CreateTitulaireDto) { return this.professeursService.createTitulaire(dto); }

  @Get('titulaires')
  @ApiOperation({ summary: 'Lister tous les titulaires' })
  findAllTitulaires() { return this.professeursService.findAllTitulaires(); }

  @Get('titulaires/:id')
  @ApiOperation({ summary: 'Détail d\'un titulaire' })
  findTitulaire(@Param('id', ParseIntPipe) id: number) { return this.professeursService.findTitulaireById(id); }

  @Patch('titulaires/:id/desactiver')
  @ApiOperation({ summary: 'Désactiver un titulaire' })
  desactiverTitulaire(@Param('id', ParseIntPipe) id: number) { return this.professeursService.desactiverTitulaire(id); }

  @Delete('titulaires/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer un titulaire' })
  removeTitulaire(@Param('id', ParseIntPipe) id: number) { return this.professeursService.removeTitulaire(id); }
}