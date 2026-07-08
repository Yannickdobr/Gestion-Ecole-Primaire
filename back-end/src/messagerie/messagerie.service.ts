import {
  Injectable, NotFoundException, BadRequestException, ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Messages } from '../entities/messages.entity';
import { Personne } from '../entities/personne.entity';
import { Parents } from '../entities/parents.entity';
import { CreateMessageDto, UpdateMessageDto, EnvoiMasseDto } from './dto/messagerie.dto';
import { MailService } from '../mail/mail.service';
import { Frequente } from '../entities/frequente.entity';
import { Admin } from '../entities/admin.entity';

@Injectable()
export class MessagerieService {
  constructor(
    @InjectRepository(Messages)
    private messagesRepository: Repository<Messages>,
    @InjectRepository(Personne)
    private personneRepository: Repository<Personne>,
    @InjectRepository(Parents)
    private parentsRepository: Repository<Parents>,
    private readonly mail: MailService,
  ) {}

  private getTypeLibelle(type: number): string {
    const types: Record<number, string> = {
      0: 'Individuel', 1: 'Tous les parents', 2: 'Paiement',
    };
    return types[type] ?? 'Autre';
  }

  async createMessage(dto: CreateMessageDto, user: { id: number; role: string }): Promise<Messages> {
    // 🔒 L'expéditeur est TOUJOURS le compte connecté (impossible d'usurper)
    if (user.role !== 'personne') {
      throw new ForbiddenException("Seul un compte Personne (enseignant, scolarité…) peut envoyer un message.");
    }
    const expediteur = await this.personneRepository.findOne({ where: { idPers: user.id,
        isDelete: 0
    } });
    if (!expediteur) throw new NotFoundException('Compte expéditeur introuvable');

    const destinataire = await this.parentsRepository.findOne({
      where: { idParent: dto.idParent,
          isDelete: 0
    }, relations: ['personne'],
    });
    if (!destinataire) throw new NotFoundException(`Parent introuvable (idParent: ${dto.idParent})`);

    const message = this.messagesRepository.create({
      objet: dto.objet,
      information: dto.information,
      type_message: dto.type_message ?? 0,
      AnneeAcade: dto.AnneeAcade ?? '',  // ✅ string directement
      valider: 0,
      expediteur,
      destinataire,
    });
    return this.messagesRepository.save(message);
  }

  async envoyerEnMasse(dto: EnvoiMasseDto, user: { id: number; role: string }): Promise<{ envoyes: number; erreurs: string[] }> {
    // 🔒 L'expéditeur est TOUJOURS le compte connecté
    if (user.role !== 'personne') {
      throw new ForbiddenException("Seul un compte Personne peut envoyer un message.");
    }
    const expediteur = await this.personneRepository.findOne({ where: { idPers: user.id,
        isDelete: 0
    } });
    if (!expediteur) throw new NotFoundException('Compte expéditeur introuvable');

    let envoyes = 0;
    const erreurs: string[] = [];

    for (const idParent of dto.idParents) {
      const destinataire = await this.parentsRepository.findOne({
        where: { idParent,
            isDelete: 0
        }, relations: ['personne'],
      });
      if (!destinataire) { erreurs.push(`Parent id ${idParent} introuvable`); continue; }

      const message = this.messagesRepository.create({
        objet: dto.objet, information: dto.information,
        type_message: dto.type_message ?? 1,
        AnneeAcade: dto.AnneeAcade ?? '',
        valider: 1, expediteur, destinataire,
      });
      await this.messagesRepository.save(message);
      envoyes++;

      // BF-23 : doubler l'annonce d'un email (best-effort ; le username fait office d'email).
      const email = destinataire.personne?.username;
      if (email) {
        this.mail
          .envoyer({ to: email, sujet: dto.objet, texte: dto.information })
          .catch(() => undefined);
      }
    }
    return { envoyes, erreurs };
  }

  /**
   * Réunion parent-titulaire : convoque en une fois TOUS les parents des élèves
   * d'une salle (classe). Réutilise la messagerie (in-app + email). Sans modif BD.
   * Auteur : la Personne connectée (titulaire/scolarité) ; si Admin -> signature "[Par <nom>]".
   */
  async convoquerParentsClasse(
    idSalle: number,
    dto: { objet: string; information: string; AnneeAcade?: string },
    acteur: { id: number; role: string },
  ): Promise<{ envoyes: number; parents: number }> {
    const manager = this.parentsRepository.manager;

    // Expéditeur (Personne, NOT NULL) + éventuelle signature admin.
    let expediteur: Personne | null = null;
    let prefixe = '';
    if (acteur?.role === 'personne') {
      expediteur = await this.personneRepository.findOne({ where: { idPers: acteur.id,
          isDelete: 0
    } });
    }
    if (!expediteur && acteur?.role === 'admin') {
      const adm = await manager.findOne(Admin, { where: { ID: acteur.id } });
      if (adm?.nom) prefixe = `[Par ${adm.nom}] `;
    }
    if (!expediteur) {
      expediteur = (await this.personneRepository.find({
          where: { isDelete: 0 },
        order: { idPers: 'ASC' }, take: 1 }))[0] ?? null;
    }
    if (!expediteur) throw new NotFoundException('Aucune personne en base pour signer la convocation.');

    // Élèves de la salle -> leurs parents (dédupliqués).
    const freqs = await manager.find(Frequente, { where: { salle: { idSalle } }, relations: ['eleve'] });
    const matricules = [...new Set(freqs.map((f) => f.eleve?.matricule).filter(Boolean))];
    if (matricules.length === 0) return { envoyes: 0, parents: 0 };

    const liens = await this.parentsRepository.find({
      where: { eleve: { matricule: In(matricules) },
          isDelete: 0
    },
      relations: ['personne', 'eleve'],
    });

    const information = prefixe + dto.information;
    let envoyes = 0;
    for (const lien of liens) {
      const message = this.messagesRepository.create({
        objet: dto.objet,
        information,
        type_message: 1, // tous les parents
        AnneeAcade: dto.AnneeAcade ?? '',
        valider: 1,
        expediteur,
        destinataire: lien,
      });
      await this.messagesRepository.save(message);
      envoyes++;
      const email = lien.personne?.username;
      if (email) {
        this.mail.envoyer({ to: email, sujet: dto.objet, texte: information }).catch(() => undefined);
      }
    }
    return { envoyes, parents: liens.length };
  }

  async findAll(): Promise<Messages[]> {
    return this.messagesRepository.find({
        where: { isDelete: 0 },
        relations: ['expediteur', 'destinataire', 'destinataire.personne'],
      order: { created_at: 'DESC' },
    });
  }

  async findEnvoyes(): Promise<Messages[]> {
    return this.messagesRepository.find({
      where: { valider: 1,
          isDelete: 0
    },
      relations: ['expediteur', 'destinataire', 'destinataire.personne'],
      order: { created_at: 'DESC' },
    });
  }

  async findBrouillons(): Promise<Messages[]> {
    return this.messagesRepository.find({
      where: { valider: 0,
          isDelete: 0
    },
      relations: ['expediteur', 'destinataire', 'destinataire.personne'],
      order: { created_at: 'DESC' },
    });
  }

  async findByParent(idParent: number): Promise<Messages[]> {
    return this.messagesRepository.find({
      where: { destinataire: { idParent }, valider: 1,
          isDelete: 0
    },
      relations: ['expediteur'],
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Messages pertinents pour le compte connecté (confidentialité) :
   * - admin            → tous les messages (supervision)
   * - parent (Personne ayant des lignes Parents) → ses messages reçus (validés)
   * - autre personne (enseignant, scolarité, autres) → ses messages envoyés/brouillons
   */
  async mesMessages(user: { id: number; role: string }): Promise<Messages[]> {
    if (user?.role === 'admin') return this.findAll();

    const lignesParent = await this.parentsRepository.find({
      where: { personne: { idPers: user.id },
          isDelete: 0
    },
    });
    if (lignesParent.length > 0) {
      const ids = lignesParent.map((p) => p.idParent);
      return this.messagesRepository.find({
        where: { destinataire: { idParent: In(ids) }, valider: 1,
            isDelete: 0
        },
        relations: ['expediteur', 'destinataire', 'destinataire.personne'],
        order: { created_at: 'DESC' },
      });
    }
    return this.findByExpediteur(user.id);
  }

  async findByExpediteur(idPers: number): Promise<Messages[]> {
    return this.messagesRepository.find({
      where: { expediteur: { idPers },
          isDelete: 0
    },
      relations: ['destinataire', 'destinataire.personne'],
      order: { created_at: 'DESC' },
    });
  }

  async findByType(type: number): Promise<Messages[]> {
    return this.messagesRepository.find({
      where: { type_message: type,
          isDelete: 0
    },
      relations: ['expediteur', 'destinataire', 'destinataire.personne'],
      order: { created_at: 'DESC' },
    });
  }

  async findByAnnee(annee: string): Promise<Messages[]> {
    return this.messagesRepository.find({
      where: { AnneeAcade: annee,
          isDelete: 0
    },
      relations: ['expediteur', 'destinataire', 'destinataire.personne'],
      order: { created_at: 'DESC' },
    });
  }

  async findById(idMessages: number): Promise<Messages> {
    const msg = await this.messagesRepository.findOne({
      where: { idMessages,
          isDelete: 0
    },
      relations: ['expediteur', 'destinataire', 'destinataire.personne'],
    });
    if (!msg) throw new NotFoundException(`Message introuvable (id: ${idMessages})`);
    return msg;
  }

  async updateMessage(idMessages: number, dto: UpdateMessageDto): Promise<Messages> {
    const msg = await this.findById(idMessages);
    if (msg.valider === 1) throw new BadRequestException('Impossible de modifier un message déjà envoyé.');
    if (dto.objet !== undefined) msg.objet = dto.objet;
    if (dto.information !== undefined) msg.information = dto.information;
    if (dto.type_message !== undefined) msg.type_message = dto.type_message;
    if (dto.AnneeAcade !== undefined) msg.AnneeAcade = dto.AnneeAcade;
    return this.messagesRepository.save(msg);
  }

  async validerMessage(idMessages: number): Promise<{ message: string }> {
    const msg = await this.findById(idMessages);
    if (msg.valider === 1) throw new BadRequestException('Ce message est déjà validé et envoyé');
    msg.valider = 1;
    await this.messagesRepository.save(msg);
    return { message: `Message "${msg.objet}" validé et envoyé` };
  }

  async archiverMessage(idMessages: number): Promise<{ message: string }> {
    const msg = await this.findById(idMessages);
    if (msg.valider === 0) throw new BadRequestException("Impossible d'archiver un brouillon.");
    msg.valider = 2;
    await this.messagesRepository.save(msg);
    return { message: `Message id ${idMessages} archivé` };
  }

  async removeMessage(idMessages: number, force: boolean = false): Promise<{ message: string }> {
    const msg = await this.findById(idMessages);
    if (msg.valider === 1) throw new BadRequestException('Impossible de supprimer un message envoyé.');
    msg.isDelete = 1;
    await this.messagesRepository.save(msg);
    return { message: `Message id ${idMessages} supprimé` };
  }

  async getStats(): Promise<{ total: number; envoyes: number; brouillons: number; archives: number }> {
    const tous = await this.messagesRepository.find({ where: { isDelete: 0 } });
    return {
      total: tous.length,
      envoyes: tous.filter(m => m.valider === 1).length,
      brouillons: tous.filter(m => m.valider === 0).length,
      archives: tous.filter(m => m.valider === 2).length,
    };
  }
}