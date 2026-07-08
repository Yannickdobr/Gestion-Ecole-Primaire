import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VilleNaissance } from '../entities/ville-naissance.entity';
import { CreateVilleDto } from './dto/ville.dto';

@Injectable()
export class VillesService {
  constructor(
    @InjectRepository(VilleNaissance)
    private villeRepository: Repository<VilleNaissance>,
  ) {}

  /** Toutes les villes (référentiel) */
  findAll(): Promise<VilleNaissance[]> {
    return this.villeRepository.find({
        where: { isDelete: 0 },
        order: { libelle: 'ASC' } });
  }

  /** Villes actives uniquement */
  findActives(): Promise<VilleNaissance[]> {
    return this.villeRepository.find({
      where: { actif: 1,
          isDelete: 0
    },
      order: { libelle: 'ASC' },
    });
  }

  /** Créer une ville */
  create(dto: CreateVilleDto): Promise<VilleNaissance> {
    const ville = this.villeRepository.create({
      libelle: dto.libelle,
      actif: dto.actif ?? 1,
    });
    return this.villeRepository.save(ville);
  }

  /**
   * Pré-remplit le référentiel avec quelques villes par défaut,
   * seulement si la table est vide.
   */
  async seed(): Promise<{ message: string; total: number }> {
    const existant = await this.villeRepository.count();
    if (existant > 0) {
      return { message: 'Référentiel déjà initialisé', total: existant };
    }

    const villes = [
      'Yaoundé', 'Douala', 'Bafoussam', 'Bamenda', 'Garoua', 'Maroua',
      'Ngaoundéré', 'Bertoua', 'Ebolowa', 'Buea', 'Kribi', 'Limbé',
      'Dschang', 'Foumban', 'Edéa', 'Kumba', 'Autres',
    ].map((libelle) => this.villeRepository.create({ libelle, actif: 1 }));

    await this.villeRepository.save(villes);
    return { message: 'Référentiel des villes initialisé', total: villes.length };
  }
}
