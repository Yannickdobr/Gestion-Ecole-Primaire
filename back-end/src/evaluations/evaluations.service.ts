import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trimestre } from '../entities/trimestre.entity';
import { Session } from '../entities/session.entity';
import { NatureEpreuve } from '../entities/nature-epreuve.entity';
import { Epreuve } from '../entities/epreuve.entity';
import { Evaluation } from '../entities/evaluation.entity';
import { Rapport } from '../entities/rapport.entity';
import { AnneeAcademique } from '../entities/annee-academique.entity';
import { Eleve } from '../entities/eleve.entity';
import { Cours } from '../entities/cours.entity';
import { Personne } from '../entities/personne.entity';
import { Admin } from '../entities/admin.entity';
import { NotificationService } from '../common/notification.service';
import { verifierAvantSuppression } from '../common/referential-integrity';
import {
  CreateTrimestreDto, UpdateTrimestreDto,
  CreateSessionDto, UpdateSessionDto,
  CreateNatureEpreuveDto, UpdateNatureEpreuveDto,
  CreateEpreuveDto, UpdateEpreuveDto,
  CreateEvaluationDto, UpdateEvaluationDto,
  CreateRapportDto, UpdateRapportDto,
} from './dto/evaluations.dto';

@Injectable()
export class EvaluationsService {
  constructor(
    @InjectRepository(Trimestre)
    private trimestreRepository: Repository<Trimestre>,

    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,

    @InjectRepository(NatureEpreuve)
    private natureRepository: Repository<NatureEpreuve>,

    @InjectRepository(Epreuve)
    private epreuveRepository: Repository<Epreuve>,

    @InjectRepository(Evaluation)
    private evaluationRepository: Repository<Evaluation>,

    @InjectRepository(Rapport)
    private rapportRepository: Repository<Rapport>,

    @InjectRepository(AnneeAcademique)
    private anneeRepository: Repository<AnneeAcademique>,

    @InjectRepository(Eleve)
    private eleveRepository: Repository<Eleve>,

    @InjectRepository(Cours)
    private coursRepository: Repository<Cours>,

    @InjectRepository(Personne)
    private personneRepository: Repository<Personne>,

    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,

    private readonly notifications: NotificationService,
  ) {}

  // ══════════════════════════════════════════════════════════════════════════
  // TRIMESTRES
  // ══════════════════════════════════════════════════════════════════════════

  async createTrimestre(dto: CreateTrimestreDto): Promise<Trimestre> {
    const annee = await this.anneeRepository.findOne({ where: { idAnnee: dto.idAca,
        isDelete: 0
    } });
    if (!annee) throw new NotFoundException(`Année académique introuvable (id: ${dto.idAca})`);

    const trimestre = this.trimestreRepository.create({
      libelle: dto.libelle,
      periode: dto.periode,
      anneeAcademique: annee,
    });
    if (dto.idAdmin) {
      const admin = await this.adminRepository.findOne({ where: { ID: dto.idAdmin,
          isDelete: 0
    } });
      if (admin) trimestre.admin = admin;
    }
    return this.trimestreRepository.save(trimestre);
  }

  async findAllTrimestres(): Promise<Trimestre[]> {
    return this.trimestreRepository.find({
        where: { isDelete: 0 },
        relations: ['anneeAcademique'],
      order: { libelle: 'ASC' },
    });
  }

  async findTrimestresByAnnee(idAnnee: number): Promise<Trimestre[]> {
    return this.trimestreRepository.find({
      where: { anneeAcademique: { idAnnee },
          isDelete: 0
    },
      relations: ['anneeAcademique', 'sessions'],
      order: { libelle: 'ASC' },
    });
  }

  async findTrimestreById(idTrimes: number): Promise<Trimestre> {
    const t = await this.trimestreRepository.findOne({
      where: { idTrimes,
          isDelete: 0
    },
      relations: ['anneeAcademique', 'sessions'],
    });
    if (!t) throw new NotFoundException(`Trimestre introuvable (id: ${idTrimes})`);
    return t;
  }

  async updateTrimestre(idTrimes: number, dto: UpdateTrimestreDto): Promise<Trimestre> {
    const t = await this.findTrimestreById(idTrimes);
    if (dto.libelle !== undefined) t.libelle = dto.libelle;
    if (dto.periode !== undefined) t.periode = dto.periode;
    if (dto.idAca !== undefined) {
      const annee = await this.anneeRepository.findOne({ where: { idAnnee: dto.idAca,
          isDelete: 0
    } });
      if (!annee) throw new NotFoundException(`Année introuvable (id: ${dto.idAca})`);
      t.anneeAcademique = annee;
    }
    return this.trimestreRepository.save(t);
  }

  async removeTrimestre(idTrimes: number, force: boolean = false): Promise<{ message: string }> {
    const t = await this.findTrimestreById(idTrimes);
    await verifierAvantSuppression(
      this.trimestreRepository.manager,
      `le trimestre "${t.libelle}"`,
      [{ entity: Session, where: { trimestre: { idTrimes } }, label: (n) => `${n} session(s)` }],
      force
    );
    t.isDelete = 1;
    await this.trimestreRepository.save(t);
    return { message: `Trimestre "${t.libelle}" supprimé` };
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SESSIONS
  // ══════════════════════════════════════════════════════════════════════════

  async createSession(dto: CreateSessionDto): Promise<Session> {
    const trimestre = await this.findTrimestreById(dto.idTrimestre);
    // responsable (idPers) est NOT NULL en BD
    const responsable = await this.personneRepository.findOne({ where: { idPers: dto.idPers,
        isDelete: 0
    } });
    if (!responsable) throw new NotFoundException(`Personne introuvable (idPers: ${dto.idPers})`);
    const session = this.sessionRepository.create({
      libelle: dto.libelle,
      description: dto.description,
      date_passage: dto.date_passage ? new Date(dto.date_passage) : null,
      trimestre,
      responsable,
    });
    return this.sessionRepository.save(session);
  }

  async findAllSessions(): Promise<Session[]> {
    return this.sessionRepository.find({
        where: { isDelete: 0 },
        relations: ['trimestre', 'trimestre.anneeAcademique'],
      order: { libelle: 'ASC' },
    });
  }

  async findSessionsByTrimestre(idTrimes: number): Promise<Session[]> {
    return this.sessionRepository.find({
      where: { trimestre: { idTrimes },
          isDelete: 0
    },
      relations: ['trimestre'],
      order: { libelle: 'ASC' },
    });
  }

  async findSessionById(idSession: number): Promise<Session> {
    const s = await this.sessionRepository.findOne({
      where: { idSession,
          isDelete: 0
    },
      relations: ['trimestre', 'trimestre.anneeAcademique'],
    });
    if (!s) throw new NotFoundException(`Session introuvable (id: ${idSession})`);
    return s;
  }

  async updateSession(idSession: number, dto: UpdateSessionDto): Promise<Session> {
    const s = await this.findSessionById(idSession);
    if (dto.libelle !== undefined) s.libelle = dto.libelle;
    if (dto.description !== undefined) s.description = dto.description;
    if (dto.date_passage !== undefined) s.date_passage = dto.date_passage ? new Date(dto.date_passage) : null;
    if (dto.idTrimestre !== undefined) {
      s.trimestre = await this.findTrimestreById(dto.idTrimestre);
    }
    return this.sessionRepository.save(s);
  }

  async removeSession(idSession: number, force: boolean = false): Promise<{ message: string }> {
    const s = await this.findSessionById(idSession);
    await verifierAvantSuppression(
      this.sessionRepository.manager,
      `la session "${s.libelle}"`,
      [{ entity: Evaluation, where: { session: { idSession } }, label: (n) => `${n} note(s)` }],
      force
    );
    s.isDelete = 1;
    await this.sessionRepository.save(s);
    return { message: `Session "${s.libelle}" supprimée` };
  }

  // ══════════════════════════════════════════════════════════════════════════
  // NATURES D'ÉPREUVES
  // ══════════════════════════════════════════════════════════════════════════

  async createNature(dto: CreateNatureEpreuveDto): Promise<NatureEpreuve> {
    const exists = await this.natureRepository.findOne({ where: { libelle: dto.libelle,
        isDelete: 0
    } });
    if (exists) throw new ConflictException(`La nature "${dto.libelle}" existe déjà`);
    const nature = this.natureRepository.create({ libelle: dto.libelle, description: dto.description });
    return this.natureRepository.save(nature);
  }

  async findAllNatures(): Promise<NatureEpreuve[]> {
    return this.natureRepository.find({
        where: { isDelete: 0 },
        order: { libelle: 'ASC' } });
  }

  async findNatureById(idNature: number): Promise<NatureEpreuve> {
    const n = await this.natureRepository.findOne({ where: { idNature,
        isDelete: 0
    } });
    if (!n) throw new NotFoundException(`Nature introuvable (id: ${idNature})`);
    return n;
  }

  async updateNature(idNature: number, dto: UpdateNatureEpreuveDto): Promise<NatureEpreuve> {
    const n = await this.findNatureById(idNature);
    if (dto.libelle !== undefined) n.libelle = dto.libelle;
    if (dto.description !== undefined) n.description = dto.description;
    return this.natureRepository.save(n);
  }

  async removeNature(idNature: number, force: boolean = false): Promise<{ message: string }> {
    const n = await this.findNatureById(idNature);
    await verifierAvantSuppression(
      this.natureRepository.manager,
      `la nature "${n.libelle}"`,
      [{ entity: Epreuve, where: { nature: { idNature } }, label: (c) => `${c} épreuve(s)` }],
      force
    );
    n.isDelete = 1;
    await this.natureRepository.save(n);
    return { message: `Nature "${n.libelle}" supprimée` };
  }

  // ══════════════════════════════════════════════════════════════════════════
  // ÉPREUVES
  // ══════════════════════════════════════════════════════════════════════════

  async createEpreuve(dto: CreateEpreuveDto): Promise<Epreuve> {
    const nature = await this.findNatureById(dto.idNature);
    const epreuve = this.epreuveRepository.create({
      libelle: dto.libelle,
      urlDoc: dto.urlDoc,
      auteur: dto.auteur,
      nature,
    });
    if (dto.idPers) {
      const pers = await this.personneRepository.findOne({ where: { idPers: dto.idPers,
          isDelete: 0
    } });
      if (pers) epreuve.personne = pers;
    }
    return this.epreuveRepository.save(epreuve);
  }

  async findAllEpreuves(): Promise<Epreuve[]> {
    return this.epreuveRepository.find({
        where: { isDelete: 0 },
        relations: ['nature'],
      order: { libelle: 'ASC' },
    });
  }

  async findEpreuveById(idEpreuve: number): Promise<Epreuve> {
    const e = await this.epreuveRepository.findOne({
      where: { idEpreuve,
          isDelete: 0
    },
      relations: ['nature', 'personne'],
    });
    if (!e) throw new NotFoundException(`Épreuve introuvable (id: ${idEpreuve})`);
    return e;
  }

  async updateEpreuve(idEpreuve: number, dto: UpdateEpreuveDto): Promise<Epreuve> {
    const e = await this.findEpreuveById(idEpreuve);
    if (dto.libelle !== undefined) e.libelle = dto.libelle;
    if (dto.urlDoc !== undefined) e.urlDoc = dto.urlDoc;
    if (dto.auteur !== undefined) e.auteur = dto.auteur;
    if (dto.idNature !== undefined) e.nature = await this.findNatureById(dto.idNature);
    return this.epreuveRepository.save(e);
  }

  async removeEpreuve(idEpreuve: number, force: boolean = false): Promise<{ message: string }> {
    const e = await this.findEpreuveById(idEpreuve);
      await verifierAvantSuppression(
        this.epreuveRepository.manager,
        `l'épreuve "${e.libelle}"`,
        [{ entity: Evaluation, where: { epreuve: { idEpreuve } }, label: (n) => `${n} note(s)` }],
        force
      );
    e.isDelete = 1;
    await this.epreuveRepository.save(e);
    return { message: `Épreuve "${e.libelle}" supprimée` };
  }

  // ══════════════════════════════════════════════════════════════════════════
  // ÉVALUATIONS (NOTES)
  // ══════════════════════════════════════════════════════════════════════════

  async saisirNote(dto: CreateEvaluationDto): Promise<Evaluation> {
    // Vérifier toutes les dépendances
    const eleve = await this.eleveRepository.findOne({ where: { matricule: dto.matricule,
        isDelete: 0
    } });
    if (!eleve) throw new NotFoundException(`Élève introuvable (matricule: ${dto.matricule})`);

    const epreuve = await this.findEpreuveById(dto.idEpreuve);
    const cours = await this.coursRepository.findOne({ where: { idCours: dto.idCours,
        isDelete: 0
    } });
    if (!cours) throw new NotFoundException(`Cours introuvable (id: ${dto.idCours})`);

    const session = await this.findSessionById(dto.idSession);
    
    // Vérification de la date de passage
    if (session.date_passage) {
      const today = new Date();
      // On compare la fin de la journée
      today.setHours(0, 0, 0, 0);
      const limitDate = new Date(session.date_passage);
      limitDate.setHours(0, 0, 0, 0);
      
      if (today > limitDate) {
        throw new ForbiddenException("Le délai de passage pour cette session est expiré, vous ne pouvez plus saisir d'évaluations.");
      }
    }

    // Vérifier doublon
    const exists = await this.evaluationRepository.findOne({
      where: {
        eleve: { matricule: dto.matricule },
        epreuve: { idEpreuve: dto.idEpreuve },
        cours: { idCours: dto.idCours },
        session: { idSession: dto.idSession },
          isDelete: 0
    },
    });
    if (exists) throw new ConflictException('Une note existe déjà pour cet élève sur cette épreuve');

    const evaluation = this.evaluationRepository.create({
      note: dto.note,
      appreciation: dto.appreciation,
      eleve,
      epreuve,
      cours,
      session,
    });

    // « saisi par » (idPers) est NOT NULL : on rattache au compte courant.
    // Quand l'auteur n'est pas une personne (ex. un admin qui saisit), repli
    // déterministe sur une personne par défaut pour respecter la contrainte.
    let auteur: Personne | null = null;
    if (dto.idPers) {
      auteur = await this.personneRepository.findOne({ where: { idPers: dto.idPers,
          isDelete: 0
    } });
    }
    if (!auteur) {
      auteur = (await this.personneRepository.find({
          where: { isDelete: 0 },
        order: { idPers: 'ASC' }, take: 1 }))[0] ?? null;
    }
    if (!auteur) {
      throw new NotFoundException(
        'Aucune personne en base pour renseigner « saisi par ». Crée au moins un membre du personnel.',
      );
    }
    evaluation.saisirPar = auteur;

    return this.evaluationRepository.save(evaluation);
  }

  async findNotesByEleve(matricule: number): Promise<Evaluation[]> {
    return this.evaluationRepository.find({
      where: { eleve: { matricule },
          isDelete: 0
    },
      relations: ['cours', 'epreuve', 'epreuve.nature', 'session', 'session.trimestre'],
      order: { created_at: 'DESC' },
    });
  }

  async findNotesBySession(idSession: number): Promise<Evaluation[]> {
    return this.evaluationRepository.find({
      where: { session: { idSession },
          isDelete: 0
    },
      relations: ['eleve', 'cours', 'epreuve'],
      order: { created_at: 'DESC' },
    });
  }

  async findNotesByCours(idCours: number): Promise<Evaluation[]> {
    return this.evaluationRepository.find({
      where: { cours: { idCours },
          isDelete: 0
    },
      relations: ['eleve', 'epreuve', 'session'],
      order: { created_at: 'DESC' },
    });
  }

  async updateNote(idEval: number, dto: UpdateEvaluationDto): Promise<Evaluation> {
    const eval_ = await this.evaluationRepository.findOne({ where: { idEval,
        isDelete: 0
    }, relations: ['session'] });
    if (!eval_) throw new NotFoundException(`Évaluation introuvable (id: ${idEval})`);
    
    // Vérification de la date de passage pour la modification
    if (eval_.session && eval_.session.date_passage) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const limitDate = new Date(eval_.session.date_passage);
      limitDate.setHours(0, 0, 0, 0);
      if (today > limitDate) {
        throw new ForbiddenException("Le délai de passage pour cette session est expiré, vous ne pouvez plus modifier d'évaluations.");
      }
    }

    if (dto.note !== undefined) eval_.note = dto.note;
    if (dto.appreciation !== undefined) eval_.appreciation = dto.appreciation;
    return this.evaluationRepository.save(eval_);
  }

  async removeNote(idEval: number, force: boolean = false): Promise<{ message: string }> {
    const eval_ = await this.evaluationRepository.findOne({ where: { idEval,
        isDelete: 0
    } });
    if (!eval_) throw new NotFoundException(`Évaluation introuvable (id: ${idEval})`);
    eval_.isDelete = 1;
    await this.evaluationRepository.save(eval_);
    return { message: `Note id ${idEval} supprimée` };
  }

  /**
   * Calcule la moyenne d'un élève pour une session donnée
   */
  async calculerMoyenne(matricule: number, idSession: number): Promise<{ moyenne: number; detail: any[] }> {
    const notes = await this.evaluationRepository.find({
      where: { eleve: { matricule }, session: { idSession },
          isDelete: 0
    },
      relations: ['cours'],
    });

    if (notes.length === 0) return { moyenne: 0, detail: [] };

    let totalPoints = 0;
    let totalCoefficients = 0;

    const detail = notes.map((n) => {
      const coef = n.cours?.coefficient ?? 1;
      totalPoints += n.note * coef;
      totalCoefficients += coef;
      return { cours: n.cours?.libelle, note: n.note, coefficient: coef };
    });

    const moyenne = totalCoefficients > 0
      ? Math.round((totalPoints / totalCoefficients) * 100) / 100
      : 0;

    return { moyenne, detail };
  }

  /**
   * Classement d'une session : moyenne (pondérée par coefficient) de chaque
   * élève évalué, triée et rangée (ex-aequo = même rang).
   */
  async classementSession(idSession: number): Promise<{ idSession: number; effectif: number; classement: any[] }> {
    const notes = await this.evaluationRepository.find({
      where: { session: { idSession },
          isDelete: 0
    },
      relations: ['eleve', 'cours'],
    });

    const parEleve = new Map<number, { eleve: any; pts: number; coef: number; nb: number }>();
    for (const n of notes) {
      const mat = n.eleve?.matricule;
      if (mat == null) continue;
      if (!parEleve.has(mat)) parEleve.set(mat, { eleve: n.eleve, pts: 0, coef: 0, nb: 0 });
      const e = parEleve.get(mat)!;
      const coef = Number(n.cours?.coefficient) || 1;
      e.pts += Number(n.note) * coef;
      e.coef += coef;
      e.nb += 1;
    }

    const lignes = [...parEleve.values()]
      .map((e) => ({
        matricule: e.eleve.matricule,
        nom: e.eleve.nom,
        prenom: e.eleve.prenom,
        moyenne: e.coef ? Math.round((e.pts / e.coef) * 100) / 100 : 0,
        nbNotes: e.nb,
        rang: 0,
      }))
      .sort((a, b) => b.moyenne - a.moyenne);

    let rang = 0;
    let prev: number | null = null;
    lignes.forEach((l, i) => {
      if (prev === null || l.moyenne < prev) { rang = i + 1; prev = l.moyenne; }
      l.rang = rang;
    });

    return { idSession, effectif: lignes.length, classement: lignes };
  }

  // ══════════════════════════════════════════════════════════════════════════
  // RAPPORTS
  // ══════════════════════════════════════════════════════════════════════════

  // ✅ CORRECTION BD : Rapport.idAca est FK vers AnneeAcademique (pas Trimestre)
  async createRapport(
    dto: CreateRapportDto,
    acteur?: { id: number; role: string },
  ): Promise<Rapport> {
    const eleve = await this.eleveRepository.findOne({ where: { matricule: dto.matricule,
        isDelete: 0
    } });
    if (!eleve) throw new NotFoundException(`Élève introuvable (matricule: ${dto.matricule})`);

    const annee = await this.anneeRepository.findOne({ where: { idAnnee: dto.idAca,
        isDelete: 0
    } });
    if (!annee) throw new NotFoundException(`Année académique introuvable (id: ${dto.idAca})`);

    // Auteur : redacteur (idPers) est NOT NULL.
    // - Si l'acteur est une Personne (enseignant/scolarité…) -> il est l'auteur réel.
    // - Si c'est un Admin (direction, pas une Personne) -> on préfixe le commentaire
    //   par "[Par <nom>]" et on retombe sur une personne par défaut pour la FK.
    let redacteur: Personne | null = null;
    let prefixe = '';
    if (acteur?.role === 'personne') {
      redacteur = await this.personneRepository.findOne({ where: { idPers: acteur.id,
          isDelete: 0
    } });
    } else if (dto.idPers && acteur?.role !== 'admin') {
      redacteur = await this.personneRepository.findOne({ where: { idPers: dto.idPers,
          isDelete: 0
    } });
    }
    if (!redacteur && acteur?.role === 'admin') {
      const adm = await this.adminRepository.findOne({ where: { ID: acteur.id,
          isDelete: 0
    } });
      if (adm?.nom) prefixe = `[Par ${adm.nom}] `;
    }
    if (!redacteur) {
      redacteur = (await this.personneRepository.find({
          where: { isDelete: 0 },
        order: { idPers: 'ASC' }, take: 1 }))[0] ?? null;
    }
    if (!redacteur) {
      throw new NotFoundException('Aucune personne en base pour signer le rapport.');
    }

    const rapport = this.rapportRepository.create({
      libelle: dto.libelle,
      // points / commentaire / event_date sont NOT NULL en BD : défauts côté service
      points: dto.points ?? 0,
      commentaire: (prefixe + (dto.commentaire ?? '')).trim() || 'RAS',
      event_date: dto.event_date ? new Date(dto.event_date) : new Date(),
      eleve,
      anneeAcademique: annee, // ✅ FK vers AnneeAcademique comme dans la BD
    });
    rapport.redacteur = redacteur;
    const saved = await this.rapportRepository.save(rapport);

    // BF-23 : notifier automatiquement les parents (in-app + email), best-effort.
    this.notifications
      .notifierParentsEleve(
        dto.matricule,
        `Nouveau relevé : ${dto.libelle}`,
        `Bonjour,\nUn nouvel élément a été enregistré pour votre enfant (matricule ${dto.matricule}) : « ${dto.libelle} ».` +
          (dto.commentaire ? `\nObservation : ${dto.commentaire}` : '') +
          `\nConnectez-vous à BrightSchool pour le consulter.`,
        { expediteurId: dto.idPers, annee: annee.libelle },
      )
      .catch(() => undefined);

    return saved;
  }

  /**
   * Statistiques d'assiduité dérivées des Rapports (approche sans table dédiée) :
   * on compte les faits dont le libellé évoque une absence / un retard.
   * Optionnellement filtré par année académique.
   */
  async statsAbsences(idAca?: number): Promise<{ absences: number; retards: number; total: number; faitsTotal: number }> {
    const rapports = await this.rapportRepository.find({
        where: { isDelete: 0 },
        relations: ['anneeAcademique'] });
    const filtres = rapports.filter((r) => !idAca || Number(r.anneeAcademique?.idAnnee) === Number(idAca));
    const norm = (s?: string) => (s || '').toLowerCase();
    const absences = filtres.filter((r) => norm(r.libelle).includes('absence')).length;
    const retards = filtres.filter((r) => norm(r.libelle).includes('retard')).length;
    return { absences, retards, total: absences + retards, faitsTotal: filtres.length };
  }

  async findRapportsByEleve(matricule: number): Promise<Rapport[]> {
    return this.rapportRepository.find({
      where: { eleve: { matricule },
          isDelete: 0
    },
      relations: ['anneeAcademique', 'redacteur'],
      order: { created_at: 'DESC' },
    });
  }

  async findRapportById(idRap: number): Promise<Rapport> {
    const r = await this.rapportRepository.findOne({
      where: { idRap,
          isDelete: 0
    },
      relations: ['eleve', 'anneeAcademique', 'redacteur'],
    });
    if (!r) throw new NotFoundException(`Rapport introuvable (id: ${idRap})`);
    return r;
  }

  async updateRapport(idRap: number, dto: UpdateRapportDto): Promise<Rapport> {
    const r = await this.findRapportById(idRap);
    if (dto.libelle !== undefined) r.libelle = dto.libelle;
    if (dto.points !== undefined) r.points = dto.points;
    if (dto.commentaire !== undefined) r.commentaire = dto.commentaire;
    if (dto.event_date !== undefined) r.event_date = new Date(dto.event_date);
    return this.rapportRepository.save(r);
  }

  async removeRapport(idRap: number, force: boolean = false): Promise<{ message: string }> {
    const r = await this.findRapportById(idRap);
    r.isDelete = 1;
    await this.rapportRepository.save(r);
    return { message: `Rapport id ${idRap} supprimé` };
  }
}