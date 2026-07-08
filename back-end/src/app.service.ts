import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Eleve } from './entities/eleve.entity';
import { EmploiDuTemps } from './entities/emploi-du-temps.entity';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Eleve)
    private elevesRepo: Repository<Eleve>,
    @InjectRepository(EmploiDuTemps)
    private emploiRepo: Repository<EmploiDuTemps>,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async getLoginStats() {
    const jours = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const aujourdhui = jours[new Date().getDay()];

    const nbEleves = await this.elevesRepo.count({ where: { actif: 1, isDelete: 0 } });
    
    // Pour compter le nombre de cours aujourd'hui, on cherche dans emploi_du_temps par jour
    const nbCoursAujourdhui = await this.emploiRepo
      .createQueryBuilder('e')
      .where('e.jour = :jour', { jour: aujourdhui })
      .getCount();

    return {
      nbEleves,
      nbCoursAujourdhui,
    };
  }
}
