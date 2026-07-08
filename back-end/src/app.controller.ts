import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Public')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('public/login-stats')
  @ApiOperation({ summary: 'Récupérer les statistiques globales pour la page de connexion' })
  async getLoginStats() {
    return this.appService.getLoginStats();
  }
}
