import {
  Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, ParseIntPipe, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CoursService } from './cours.service';
import {
  CreateCoursDto, UpdateCoursDto, CreateDisciplineDto, UpdateDisciplineDto,
  CreateSpecialiteDto, UpdateSpecialiteDto, CreateLivreDto, UpdateLivreDto,
} from './dto/cours.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role, DIRECTION } from '../auth/roles.enum';

@ApiTags('Cours')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('cours')
export class CoursController {
  constructor(private readonly coursService: CoursService) {}

  @Get()
  @ApiOperation({ summary: 'Lister tous les cours' })
  findAllCours() { return this.coursService.findAllCours(); }

  @Post()
  @Roles(...DIRECTION)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer un cours' })
  createCours(@Body() dto: CreateCoursDto) { return this.coursService.createCours(dto); }

  @Get('search')
  @ApiOperation({ summary: 'Rechercher un cours par libellé' })
  @ApiQuery({ name: 'q', required: true })
  searchCours(@Query('q') query: string) { return this.coursService.searchCours(query ?? ''); }


  // NB : les routes :id sont déclarées plus bas, APRÈS les routes statiques
  // (disciplines, specialites, livres) — sinon /cours/livres serait capturé
  // par /cours/:id (ParseIntPipe → 400).

  // ── Disciplines ────────────────────────────────────────────────────────
  @Get('disciplines')
  @ApiOperation({ summary: 'Lister les disciplines' })
  findAllDisciplines() { return this.coursService.findAllDisciplines(); }

  @Post('disciplines')
  @Roles(...DIRECTION)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer une discipline' })
  createDiscipline(@Body() dto: CreateDisciplineDto) { return this.coursService.createDiscipline(dto); }

  @Get('disciplines/:id')
  @ApiOperation({ summary: 'Détail d\'une discipline' })
  findDiscipline(@Param('id', ParseIntPipe) id: number) { return this.coursService.findDisciplineById(id); }

  @Put('disciplines/:id')
  @Roles(...DIRECTION)
  @ApiOperation({ summary: 'Modifier une discipline' })
  updateDiscipline(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateDisciplineDto) { return this.coursService.updateDiscipline(id, dto); }

  @Delete('disciplines/:id')
  @Roles(...DIRECTION)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer une discipline' })
  removeDiscipline(@Param('id', ParseIntPipe) id: number, @Query('force') force?: string) { return this.coursService.removeDiscipline(id, force === 'true'); }

  // ── Spécialités ────────────────────────────────────────────────────────
  @Get('specialites')
  @ApiOperation({ summary: 'Lister les spécialités' })
  findAllSpecialites() { return this.coursService.findAllSpecialites(); }

  @Post('specialites')
  @Roles(...DIRECTION)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer une spécialité' })
  createSpecialite(@Body() dto: CreateSpecialiteDto) { return this.coursService.createSpecialite(dto); }

  @Get('specialites/:id')
  @ApiOperation({ summary: 'Détail d\'une spécialité avec ses livres' })
  findSpecialite(@Param('id', ParseIntPipe) id: number) { return this.coursService.findSpecialiteById(id); }

  @Put('specialites/:id')
  @Roles(...DIRECTION)
  @ApiOperation({ summary: 'Modifier une spécialité' })
  updateSpecialite(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSpecialiteDto) { return this.coursService.updateSpecialite(id, dto); }

  @Delete('specialites/:id')
  @Roles(...DIRECTION)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer une spécialité' })
  removeSpecialite(@Param('id', ParseIntPipe) id: number, @Query('force') force?: string) { return this.coursService.removeSpecialite(id, force === 'true'); }

  // ── Livres ─────────────────────────────────────────────────────────────
  // La bibliothèque est gérée par la direction ET le personnel « Autres ».
  @Get('livres')
  @ApiOperation({ summary: 'Catalogue complet des livres' })
  findAllLivres() { return this.coursService.findAllLivres(); }

  @Post('livres')
  @Roles(...DIRECTION, Role.AUTRES)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Ajouter un livre au catalogue' })
  createLivre(@Body() dto: CreateLivreDto) { return this.coursService.createLivre(dto); }

  @Get('livres/search')
  @ApiOperation({ summary: 'Rechercher un livre par titre ou auteur' })
  @ApiQuery({ name: 'q', required: true })
  searchLivres(@Query('q') query: string) { return this.coursService.searchLivres(query ?? ''); }

  @Get('livres/par-specialite/:id')
  @ApiOperation({ summary: 'Livres d\'une spécialité' })
  findLivresBySpecialite(@Param('id', ParseIntPipe) id: number) { return this.coursService.findLivresBySpecialite(id); }

  @Get('livres/:id')
  @ApiOperation({ summary: 'Détail d\'un livre' })
  findLivre(@Param('id', ParseIntPipe) id: number) { return this.coursService.findLivreById(id); }

  @Put('livres/:id')
  @Roles(...DIRECTION, Role.AUTRES)
  @ApiOperation({ summary: 'Modifier un livre' })
  updateLivre(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateLivreDto) { return this.coursService.updateLivre(id, dto); }

  @Delete('livres/:id')
  @Roles(...DIRECTION, Role.AUTRES)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer un livre' })
  removeLivre(@Param('id', ParseIntPipe) id: number, @Query('force') force?: string) { return this.coursService.removeLivre(id, force === 'true'); }

  // ── Cours par id (déclaré APRÈS les routes statiques pour éviter la collision) ──
  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'un cours' })
  findCours(@Param('id', ParseIntPipe) id: number) { return this.coursService.findCoursById(id); }

  @Put(':id')
  @Roles(...DIRECTION)
  @ApiOperation({ summary: 'Modifier un cours' })
  updateCours(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCoursDto) { return this.coursService.updateCours(id, dto); }

  @Patch(':id/desactiver')
  @Roles(...DIRECTION)
  @ApiOperation({ summary: 'Désactiver un cours' })
  desactiverCours(@Param('id', ParseIntPipe) id: number) { return this.coursService.desactiverCours(id); }

  @Delete(':id')
  @Roles(...DIRECTION)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer un cours' })
  removeCours(@Param('id', ParseIntPipe) id: number, @Query('force') force?: string) { return this.coursService.removeCours(id, force === 'true'); }
}
