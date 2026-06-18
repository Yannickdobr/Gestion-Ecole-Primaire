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

@ApiTags('Cours')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('cours')
export class CoursController {
  constructor(private readonly coursService: CoursService) {}

  @Get()
  @ApiOperation({ summary: 'Lister tous les cours' })
  findAllCours() { return this.coursService.findAllCours(); }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer un cours' })
  createCours(@Body() dto: CreateCoursDto) { return this.coursService.createCours(dto); }

  @Get('search')
  @ApiOperation({ summary: 'Rechercher un cours par libellé' })
  @ApiQuery({ name: 'q', required: true })
  searchCours(@Query('q') query: string) { return this.coursService.searchCours(query ?? ''); }

  @Get('par-classe/:idClasse')
  @ApiOperation({ summary: 'Cours actifs d\'une classe' })
  findCoursByClasse(@Param('idClasse', ParseIntPipe) idClasse: number) { return this.coursService.findCoursByClasse(idClasse); }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'un cours' })
  findCours(@Param('id', ParseIntPipe) id: number) { return this.coursService.findCoursById(id); }

  @Put(':id')
  @ApiOperation({ summary: 'Modifier un cours' })
  updateCours(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCoursDto) { return this.coursService.updateCours(id, dto); }

  @Patch(':id/desactiver')
  @ApiOperation({ summary: 'Désactiver un cours' })
  desactiverCours(@Param('id', ParseIntPipe) id: number) { return this.coursService.desactiverCours(id); }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer un cours' })
  removeCours(@Param('id', ParseIntPipe) id: number) { return this.coursService.removeCours(id); }

  // ── Disciplines ────────────────────────────────────────────────────────
  @Get('disciplines')
  @ApiOperation({ summary: 'Lister les disciplines' })
  findAllDisciplines() { return this.coursService.findAllDisciplines(); }

  @Post('disciplines')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer une discipline' })
  createDiscipline(@Body() dto: CreateDisciplineDto) { return this.coursService.createDiscipline(dto); }

  @Get('disciplines/:id')
  @ApiOperation({ summary: 'Détail d\'une discipline' })
  findDiscipline(@Param('id', ParseIntPipe) id: number) { return this.coursService.findDisciplineById(id); }

  @Put('disciplines/:id')
  @ApiOperation({ summary: 'Modifier une discipline' })
  updateDiscipline(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateDisciplineDto) { return this.coursService.updateDiscipline(id, dto); }

  @Delete('disciplines/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer une discipline' })
  removeDiscipline(@Param('id', ParseIntPipe) id: number) { return this.coursService.removeDiscipline(id); }

  // ── Spécialités ────────────────────────────────────────────────────────
  @Get('specialites')
  @ApiOperation({ summary: 'Lister les spécialités' })
  findAllSpecialites() { return this.coursService.findAllSpecialites(); }

  @Post('specialites')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer une spécialité' })
  createSpecialite(@Body() dto: CreateSpecialiteDto) { return this.coursService.createSpecialite(dto); }

  @Get('specialites/:id')
  @ApiOperation({ summary: 'Détail d\'une spécialité avec ses livres' })
  findSpecialite(@Param('id', ParseIntPipe) id: number) { return this.coursService.findSpecialiteById(id); }

  @Put('specialites/:id')
  @ApiOperation({ summary: 'Modifier une spécialité' })
  updateSpecialite(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSpecialiteDto) { return this.coursService.updateSpecialite(id, dto); }

  @Delete('specialites/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer une spécialité' })
  removeSpecialite(@Param('id', ParseIntPipe) id: number) { return this.coursService.removeSpecialite(id); }

  // ── Livres ─────────────────────────────────────────────────────────────
  @Get('livres')
  @ApiOperation({ summary: 'Catalogue complet des livres' })
  findAllLivres() { return this.coursService.findAllLivres(); }

  @Post('livres')
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
  @ApiOperation({ summary: 'Modifier un livre' })
  updateLivre(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateLivreDto) { return this.coursService.updateLivre(id, dto); }

  @Delete('livres/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer un livre' })
  removeLivre(@Param('id', ParseIntPipe) id: number) { return this.coursService.removeLivre(id); }
}