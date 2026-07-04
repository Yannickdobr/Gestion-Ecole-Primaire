import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Messages } from '../entities/messages.entity';
import { Parents } from '../entities/parents.entity';
import { Personne } from '../entities/personne.entity';
import { MailService } from '../mail/mail.service';

/**
 * Notifications automatiques (BF-23) — double canal :
 *  - message in-app (table `messages`)
 *  - email au `username` du parent (qui fait office d'adresse email)
 * Aucune modification de schéma : on réutilise l'existant.
 */
@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(Messages) private readonly messagesRepo: Repository<Messages>,
    @InjectRepository(Parents) private readonly parentsRepo: Repository<Parents>,
    @InjectRepository(Personne) private readonly personneRepo: Repository<Personne>,
    private readonly mail: MailService,
  ) {}

  /** Expéditeur institutionnel : l'utilisateur déclencheur (si Personne) ou un membre du personnel. */
  private async expediteurSysteme(expediteurId?: number): Promise<Personne | null> {
    if (expediteurId) {
      const p = await this.personneRepo.findOne({ where: { idPers: expediteurId } });
      if (p) return p;
    }
    // Personnel non-parent (scolarité, administratif, enseignant, autres) par défaut.
    return this.personneRepo.findOne({
      where: { typePersonne: In([3, 2, 1, 5]) },
      order: { idPers: 'ASC' },
    });
  }

  /** Notifie tous les tuteurs d'un élève (in-app + email). Best-effort. */
  async notifierParentsEleve(
    matricule: number,
    objet: string,
    information: string,
    opts?: { expediteurId?: number; annee?: string; type?: number },
  ): Promise<{ inApp: number; emails: number }> {
    const liens = await this.parentsRepo.find({
      where: { eleve: { matricule } },
      relations: ['personne', 'eleve'],
    });
    if (!liens.length) return { inApp: 0, emails: 0 };

    const expediteur = await this.expediteurSysteme(opts?.expediteurId);
    let inApp = 0;
    let emails = 0;

    for (const lien of liens) {
      if (expediteur) {
        try {
          await this.messagesRepo.save(
            this.messagesRepo.create({
              objet,
              information,
              type_message: opts?.type ?? 0,
              AnneeAcade: opts?.annee ?? '',
              valider: 1,
              expediteur,
              destinataire: lien,
            }),
          );
          inApp++;
        } catch (e) {
          this.logger.warn(`Message in-app non créé (matricule ${matricule}) : ${(e as Error).message}`);
        }
      }
      const email = lien.personne?.username;
      if (email && (await this.mail.envoyer({ to: email, sujet: objet, texte: information }))) {
        emails++;
      }
    }
    return { inApp, emails };
  }
}
