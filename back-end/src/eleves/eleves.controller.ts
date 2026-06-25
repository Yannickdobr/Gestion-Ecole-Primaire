import {
  Controller, Get, Post, Put, Patch, Delete,
  Body, Param, ParseIntPipe, Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ElevesService } from './eleves.service';
import { CreateEleveDto, UpdateEleveDto, AddParentDto } from './dto/eleve.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Élèves')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('eleves')
export class ElevesController {
  constructor(private readonly elevesService: ElevesService) {}

  @Get()
  @ApiOperation({ summary: 'Lister tous les élèves' })
  @ApiResponse({ status: 200, description: 'Liste complète des élèves' })
  findAll() { return this.elevesService.findAll(); }

  @Get('actifs')
  @ApiOperation({ summary: 'Lister les élèves actifs uniquement' })
  findActifs() { return this.elevesService.findActifs(); }

  @Get('search')
  @ApiOperation({ summary: 'Rechercher un élève par nom ou prénom' })
  @ApiQuery({ name: 'q', required: true, description: 'Nom ou prénom à rechercher' })
  search(@Query('q') query: string) { return this.elevesService.search(query ?? ''); }

  @Get('parent/:idPers')
  @ApiOperation({ summary: 'Lister les enfants d\'un parent' })
  @ApiParam({ name: 'idPers', description: 'Identifiant (idPers) du parent' })
  findByParent(@Param('idPers', ParseIntPipe) idPers: number) {
    return this.elevesService.findByParent(idPers);
  }

  @Get(':matricule')
  @ApiOperation({ summary: 'Détail d\'un élève' })
  @ApiParam({ name: 'matricule', description: 'Matricule de l\'élève' })
  @ApiResponse({ status: 404, description: 'Élève introuvable' })
  findOne(@Param('matricule', ParseIntPipe) matricule: number) { return this.elevesService.findOne(matricule); }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Inscrire un nouvel élève' })
  @ApiResponse({ status: 201, description: 'Élève créé avec succès' })
  create(@Body() dto: CreateEleveDto) { return this.elevesService.create(dto); }

  @Put(':matricule')
  @ApiOperation({ summary: 'Modifier un élève' })
  update(@Param('matricule', ParseIntPipe) matricule: number, @Body() dto: UpdateEleveDto) {
    return this.elevesService.update(matricule, dto);
  }

  @Patch(':matricule/desactiver')
  @ApiOperation({ summary: 'Désactiver un élève (soft delete)' })
  desactiver(@Param('matricule', ParseIntPipe) matricule: number) { return this.elevesService.desactiver(matricule); }

  @Delete(':matricule')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer définitivement un élève' })
  remove(@Param('matricule', ParseIntPipe) matricule: number) { return this.elevesService.remove(matricule); }

  @Get(':matricule/parents')
  @ApiOperation({ summary: 'Lister les parents d\'un élève' })
  getParents(@Param('matricule', ParseIntPipe) matricule: number) { return this.elevesService.getParents(matricule); }

  @Post(':matricule/parents')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Ajouter un parent à un élève' })
  addParent(@Param('matricule', ParseIntPipe) matricule: number, @Body() dto: AddParentDto) {
    return this.elevesService.addParent(matricule, dto);
  }
}