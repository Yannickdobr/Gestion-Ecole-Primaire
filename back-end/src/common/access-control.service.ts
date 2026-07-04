import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Parents } from '../entities/parents.entity';
import { Role, roleFromUser } from '../auth/roles.enum';

type ReqUser = { id: number; role?: string; typeRole?: number };

/**
 * Confidentialité (BNF-04) : garantit qu'un PARENT n'accède qu'aux données
 * de ses propres enfants. Sans effet pour les autres rôles (direction,
 * scolarité, enseignant), qui sont déjà filtrés par @Roles.
 */
@Injectable()
export class AccessControlService {
  constructor(
    @InjectRepository(Parents)
    private readonly parentsRepository: Repository<Parents>,
  ) {}

  /** Vrai si le parent (idPers) est bien tuteur de l'élève (matricule). */
  async parentOwns(idPers: number, matricule: number): Promise<boolean> {
    const n = await this.parentsRepository.count({
      where: { personne: { idPers }, eleve: { matricule } },
    });
    return n > 0;
  }

  /**
   * À appeler sur les routes qui exposent les données d'un élève précis.
   * Si le demandeur est un parent, on exige qu'il soit tuteur de l'élève.
   */
  async assertEleveAccess(user: ReqUser, matricule: number): Promise<void> {
    if (roleFromUser(user) !== Role.PARENT) return; // autres rôles : déjà gérés par @Roles
    if (!(await this.parentOwns(user.id, matricule))) {
      throw new ForbiddenException(
        "Accès refusé : cet élève n'est pas rattaché à votre compte.",
      );
    }
  }

  /**
   * À appeler sur les routes indexées par idPers de parent (ex. /eleves/parent/:idPers).
   * Un parent ne peut consulter que son propre idPers.
   */
  assertSelfParent(user: ReqUser, idPers: number): void {
    if (roleFromUser(user) !== Role.PARENT) return;
    if (Number(user.id) !== Number(idPers)) {
      throw new ForbiddenException(
        'Accès refusé : vous ne pouvez consulter que vos propres enfants.',
      );
    }
  }
}
