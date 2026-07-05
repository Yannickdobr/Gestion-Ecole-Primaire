import {
  Controller, Get, Post, Put, Patch, Delete,
  Body, Param, ParseIntPipe, Query, UseGuards, HttpCode, HttpStatus, Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ElevesService } from './eleves.service';
import { CreateEleveDto, UpdateEleveDto, AddParentDto } from './dto/eleve.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role, DIRECTION } from '../auth/roles.enum';
import { AccessControlService } from '../common/access-control.service';

@ApiTags('Élèves')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('eleves')
export class ElevesController {
  constructor(
    private readonly elevesService: ElevesService,
    private readonly acl: AccessControlService,
  ) {}

  @Get()
  @Roles(...DIRECTION, Role.SCOLARITE, Role.ENSEIGNANT, Role.AUTRES)
  @ApiOperation({ summary: 'Lister tous les élèves' })
  @ApiResponse({ status: 200, description: 'Liste complète des élèves' })
  findAll() { return this.elevesService.findAll(); }

  @Get('actifs')
  @Roles(...DIRECTION, Role.SCOLARITE, Role.ENSEIGNANT, Role.AUTRES)
  @ApiOperation({ summary: 'Lister les élèves actifs uniquement' })
  findActifs() { return this.elevesService.findActifs(); }

  @Get('search')
  @Roles(...DIRECTION, Role.SCOLARITE, Role.ENSEIGNANT, Role.AUTRES)
  @ApiOperation({ summary: 'Rechercher un élève par nom ou prénom' })
  @ApiQuery({ name: 'q', required: true, description: 'Nom ou prénom à rechercher' })
  search(@Query('q') query: string) { return this.elevesService.search(query ?? ''); }

  @Get('parent/:idPers')
  @Roles(...DIRECTION, Role.SCOLARITE, Role.PARENT)
  @ApiOperation({ summary: 'Lister les enfants d\'un parent' })
  @ApiParam({ name: 'idPers', description: 'Identifiant (idPers) du parent' })
  findByParent(@Request() req, @Param('idPers', ParseIntPipe) idPers: number) {
    // Un parent ne peut consulter que ses propres enfants.
    this.acl.assertSelfParent(req.user, idPers);
    return this.elevesService.findByParent(idPers);
  }

  @Get(':matricule')
  @Roles(...DIRECTION, Role.SCOLARITE, Role.ENSEIGNANT, Role.PARENT, Role.AUTRES)
  @ApiOperation({ summary: 'Détail d\'un élève' })
  @ApiParam({ name: 'matricule', description: 'Matricule de l\'élève' })
  @ApiResponse({ status: 404, description: 'Élève introuvable' })
  async findOne(@Request() req, @Param('matricule', ParseIntPipe) matricule: number) {
    await this.acl.assertEleveAccess(req.user, matricule);
    return this.elevesService.findOne(matricule);
  }

  @Post()
  @Roles(...DIRECTION, Role.SCOLARITE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Inscrire un nouvel élève' })
  @ApiResponse({ status: 201, description: 'Élève créé avec succès' })
  create(@Body() dto: CreateEleveDto) { return this.elevesService.create(dto); }

  @Put(':matricule')
  @Roles(...DIRECTION, Role.SCOLARITE)
  @ApiOperation({ summary: 'Modifier un élève' })
  update(@Param('matricule', ParseIntPipe) matricule: number, @Body() dto: UpdateEleveDto) {
    return this.elevesService.update(matricule, dto);
  }

  @Patch(':matricule/desactiver')
  @Roles(...DIRECTION, Role.SCOLARITE)
  @ApiOperation({ summary: 'Désactiver un élève (soft delete)' })
  desactiver(@Param('matricule', ParseIntPipe) matricule: number) { return this.elevesService.desactiver(matricule); }

  @Patch(':matricule/activer')
  @Roles(...DIRECTION, Role.SCOLARITE)
  @ApiOperation({ summary: 'Réactiver un élève' })
  activer(@Param('matricule', ParseIntPipe) matricule: number) { return this.elevesService.activer(matricule); }

  @Delete(':matricule')
  @Roles(...DIRECTION, Role.SCOLARITE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer définitivement un élève' })
  remove(@Param('matricule', ParseIntPipe) matricule: number) { return this.elevesService.remove(matricule); }

  @Get(':matricule/parents')
  @Roles(...DIRECTION, Role.SCOLARITE, Role.ENSEIGNANT, Role.PARENT, Role.AUTRES)
  @ApiOperation({ summary: 'Lister les parents d\'un élève' })
  async getParents(@Request() req, @Param('matricule', ParseIntPipe) matricule: number) {
    await this.acl.assertEleveAccess(req.user, matricule);
    return this.elevesService.getParents(matricule);
  }

  @Post(':matricule/parents')
  @Roles(...DIRECTION, Role.SCOLARITE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Ajouter un parent à un élève' })
  addParent(@Param('matricule', ParseIntPipe) matricule: number, @Body() dto: AddParentDto) {
    return this.elevesService.addParent(matricule, dto);
  }
}
