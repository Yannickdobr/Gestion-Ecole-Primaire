import {
  Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ClassesService } from './classes.service';
import {
  CreateCycleDto, UpdateCycleDto, CreateClasseDto, UpdateClasseDto,
  CreateSalleDto, UpdateSalleDto, CreateAnneeAcademiqueDto, UpdateAnneeAcademiqueDto, CreateFrequenterDto,
} from './dto/classes.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Classes')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  // ── Cycles ──────────────────────────────────────────────────────────────
  @Get('cycles')
  @ApiOperation({ summary: 'Lister tous les cycles' })
  findAllCycles() { return this.classesService.findAllCycles(); }

  @Post('cycles')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer un cycle (ex: Primaire, Collège)' })
  createCycle(@Body() dto: CreateCycleDto) { return this.classesService.createCycle(dto); }

  @Get('cycles/:id')
  @ApiOperation({ summary: 'Détail d\'un cycle avec ses classes' })
  findCycle(@Param('id', ParseIntPipe) id: number) { return this.classesService.findCycleById(id); }

  @Put('cycles/:id')
  @ApiOperation({ summary: 'Modifier un cycle' })
  updateCycle(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCycleDto) { return this.classesService.updateCycle(id, dto); }

  @Delete('cycles/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer un cycle' })
  removeCycle(@Param('id', ParseIntPipe) id: number) { return this.classesService.removeCycle(id); }

  // ── Classes ─────────────────────────────────────────────────────────────
  @Get()
  @ApiOperation({ summary: 'Lister toutes les classes' })
  findAllClasses() { return this.classesService.findAllClasses(); }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer une classe (ex: CP, CE1, 6ème)' })
  createClasse(@Body() dto: CreateClasseDto) { return this.classesService.createClasse(dto); }

  @Get('par-cycle/:idCycle')
  @ApiOperation({ summary: 'Lister les classes d\'un cycle' })
  findClassesByCycle(@Param('idCycle', ParseIntPipe) idCycle: number) { return this.classesService.findClassesByCycle(idCycle); }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'une classe' })
  findClasse(@Param('id', ParseIntPipe) id: number) { return this.classesService.findClasseById(id); }

  @Put(':id')
  @ApiOperation({ summary: 'Modifier une classe' })
  updateClasse(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateClasseDto) { return this.classesService.updateClasse(id, dto); }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer une classe' })
  removeClasse(@Param('id', ParseIntPipe) id: number) { return this.classesService.removeClasse(id); }

  // ── Salles ──────────────────────────────────────────────────────────────
  @Get('salles')
  @ApiOperation({ summary: 'Lister toutes les salles' })
  findAllSalles() { return this.classesService.findAllSalles(); }

  @Post('salles')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer une salle' })
  createSalle(@Body() dto: CreateSalleDto) { return this.classesService.createSalle(dto); }

  @Get('salles/:id')
  @ApiOperation({ summary: 'Détail d\'une salle' })
  findSalle(@Param('id', ParseIntPipe) id: number) { return this.classesService.findSalleById(id); }

  @Put('salles/:id')
  @ApiOperation({ summary: 'Modifier une salle' })
  updateSalle(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSalleDto) { return this.classesService.updateSalle(id, dto); }

  @Delete('salles/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer une salle' })
  removeSalle(@Param('id', ParseIntPipe) id: number) { return this.classesService.removeSalle(id); }

  // ── Années académiques ───────────────────────────────────────────────────
  @Get('annees')
  @ApiOperation({ summary: 'Lister les années académiques' })
  findAllAnnees() { return this.classesService.findAllAnnees(); }

  @Post('annees')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer une année académique (ex: 2024-2025)' })
  createAnnee(@Body() dto: CreateAnneeAcademiqueDto) { return this.classesService.createAnnee(dto); }

  @Get('annees/:id')
  @ApiOperation({ summary: 'Détail d\'une année académique' })
  findAnnee(@Param('id', ParseIntPipe) id: number) { return this.classesService.findAnneeById(id); }

  @Put('annees/:id')
  @ApiOperation({ summary: 'Modifier une année académique' })
  updateAnnee(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAnneeAcademiqueDto) { return this.classesService.updateAnnee(id, dto); }

  @Delete('annees/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer une année académique' })
  removeAnnee(@Param('id', ParseIntPipe) id: number) { return this.classesService.removeAnnee(id); }

  // ── Fréquentation ────────────────────────────────────────────────────────
  @Post('affecter')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Affecter un élève dans une salle pour une année' })
  affecter(@Body() dto: CreateFrequenterDto) { return this.classesService.affecter(dto); }

  @Get('frequente/eleve/:matricule')
  @ApiOperation({ summary: 'Historique des salles d\'un élève' })
  frequenteByEleve(@Param('matricule', ParseIntPipe) matricule: number) { return this.classesService.findFrequenterByEleve(matricule); }

  @Get('frequente/salle/:idSalle')
  @ApiOperation({ summary: 'Liste des élèves dans une salle' })
  frequenteBySalle(@Param('idSalle', ParseIntPipe) idSalle: number) { return this.classesService.findFrequenterBySalle(idSalle); }

  @Delete('frequente/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer une affectation élève-salle' })
  removeAffectation(@Param('id', ParseIntPipe) id: number) { return this.classesService.removeAffectation(id); }
}