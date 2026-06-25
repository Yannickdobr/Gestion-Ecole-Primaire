import {
  Controller, Get, Post, Body, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { VillesService } from './villes.service';
import { CreateVilleDto } from './dto/ville.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Villes')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('villes')
export class VillesController {
  constructor(private readonly villesService: VillesService) {}

  @Get()
  @ApiOperation({ summary: 'Lister les villes de naissance' })
  @ApiResponse({ status: 200, description: 'Liste des villes' })
  findAll() {
    return this.villesService.findAll();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer une ville' })
  @ApiResponse({ status: 201, description: 'Ville créée' })
  create(@Body() dto: CreateVilleDto) {
    return this.villesService.create(dto);
  }

  @Post('seed')
  @ApiOperation({ summary: 'Initialiser le référentiel des villes (si vide)' })
  @ApiResponse({ status: 201, description: 'Référentiel initialisé' })
  seed() {
    return this.villesService.seed();
  }
}
