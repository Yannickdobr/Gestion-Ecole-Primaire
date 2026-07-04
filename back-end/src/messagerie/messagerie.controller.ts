import {
  Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, ParseIntPipe, UseGuards, HttpCode, HttpStatus, Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MessagerieService } from './messagerie.service';
import { CreateMessageDto, UpdateMessageDto, EnvoiMasseDto } from './dto/messagerie.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { DIRECTION } from '../auth/roles.enum';

@ApiTags('Messagerie')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('messagerie')
export class MessagerieController {
  constructor(private readonly messagerieService: MessagerieService) {}

  @Get()
  @ApiOperation({ summary: 'Tous les messages (admin)' })
  findAll() { return this.messagerieService.findAll(); }

  @Get('envoyes')
  @ApiOperation({ summary: 'Messages validés et envoyés' })
  findEnvoyes() { return this.messagerieService.findEnvoyes(); }

  @Get('brouillons')
  @ApiOperation({ summary: 'Brouillons non encore envoyés' })
  findBrouillons() { return this.messagerieService.findBrouillons(); }

  @Get('stats')
  @ApiOperation({ summary: 'Statistiques : total, envoyés, brouillons, archivés, par type' })
  getStats() { return this.messagerieService.getStats(); }

  @Get('mes-messages')
  @ApiOperation({ summary: 'Messages du compte connecté (reçus si parent, envoyés sinon)' })
  mesMessages(@Request() req) { return this.messagerieService.mesMessages(req.user); }

  @Get('parent/:idParent')
  @ApiOperation({ summary: 'Messages reçus par un parent' })
  findByParent(@Param('idParent', ParseIntPipe) idParent: number) { return this.messagerieService.findByParent(idParent); }

  @Get('expediteur/:idPers')
  @ApiOperation({ summary: 'Messages envoyés par un administrateur' })
  findByExpediteur(@Param('idPers', ParseIntPipe) idPers: number) { return this.messagerieService.findByExpediteur(idPers); }

  @Get('type/:type')
  @ApiOperation({ summary: 'Messages par type (1=Info, 2=Convoc, 3=Paie, 4=Notes, 5=Absence)' })
  findByType(@Param('type', ParseIntPipe) type: number) { return this.messagerieService.findByType(type); }

  @Get('annee')
  @ApiOperation({ summary: 'Messages d\'une année académique' })
  @ApiQuery({ name: 'annee', required: true, description: 'Année académique (ex: 2024-2025)' })
  findByAnnee(@Query('annee') annee: string) { return this.messagerieService.findByAnnee(annee ?? ''); }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'un message' })
  findById(@Param('id', ParseIntPipe) id: number) { return this.messagerieService.findById(id); }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer un message (brouillon par défaut)' })
  createMessage(@Request() req, @Body() dto: CreateMessageDto) { return this.messagerieService.createMessage(dto, req.user); }

  @Post('masse')
  @Roles(...DIRECTION) // l'envoi groupé est réservé à la direction
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Envoyer le même message à plusieurs parents en une fois' })
  envoyerEnMasse(@Request() req, @Body() dto: EnvoiMasseDto) { return this.messagerieService.envoyerEnMasse(dto, req.user); }

  @Put(':id')
  @ApiOperation({ summary: 'Modifier un brouillon (impossible si déjà envoyé)' })
  updateMessage(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMessageDto) { return this.messagerieService.updateMessage(id, dto); }

  @Patch(':id/valider')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Valider et envoyer un brouillon → statut passe à 1' })
  validerMessage(@Param('id', ParseIntPipe) id: number) { return this.messagerieService.validerMessage(id); }

  @Patch(':id/archiver')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Archiver un message envoyé → statut passe à 2' })
  archiverMessage(@Param('id', ParseIntPipe) id: number) { return this.messagerieService.archiverMessage(id); }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer un brouillon (impossible si envoyé)' })
  removeMessage(@Param('id', ParseIntPipe) id: number) { return this.messagerieService.removeMessage(id); }
}