import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// ─── Modules ──────────────────────────────────────────────────────────────────
import { AuthModule } from './auth/auth.module';
import { AccessControlModule } from './common/access-control.module';
import { ElevesModule } from './eleves/eleves.module';
import { ProfesseursModule } from './professeurs/professeurs.module';
import { ClassesModule } from './classe/classes.module';
import { CoursModule } from './cours/cours.module';
import { EvaluationsModule } from './evaluations/evaluations.module';
import { PaiementsModule } from './paiements/paiements.module';
import { EmploiModule } from './emploi/emploi.module';
import { MessagerieModule } from './messagerie/messagerie.module';
import { VillesModule } from './villes/villes.module';
import { MailModule } from './mail/mail.module';
import { AdministrationModule } from './administration/administration.module';
import { UploadModule } from './upload/upload.module';

// ─── Entités ──────────────────────────────────────────────────────────────────
import { Admin } from './entities/admin.entity';
import { Personne } from './entities/personne.entity';
import { Eleve } from './entities/eleve.entity';
import { Parents } from './entities/parents.entity';
import { VilleNaissance } from './entities/ville-naissance.entity';
import { Enseignant } from './entities/enseignant.entity';
import { Titulaire } from './entities/titulaire.entity';
import { Cycle } from './entities/cycle.entity';
import { Classe } from './entities/classe.entity';
import { Salle } from './entities/salle.entity';
import { AnneeAcademique } from './entities/annee-academique.entity';
import { Frequente } from './entities/frequente.entity';
import { Cours } from './entities/cours.entity';
import { Discipline } from './entities/discipline.entity';
import { Specialite } from './entities/specialite.entity';
import { Livres } from './entities/livres.entity';
import { Trimestre } from './entities/trimestre.entity';
import { Session } from './entities/session.entity';
import { NatureEpreuve } from './entities/nature-epreuve.entity';
import { Epreuve } from './entities/epreuve.entity';
import { Evaluation } from './entities/evaluation.entity';
import { Rapport } from './entities/rapport.entity';
import { Mode } from './entities/mode.entity';
import { Scolarite } from './entities/scolarite.entity';
import { Tranches } from './entities/tranches.entity';
import { Paiement } from './entities/paiement.entity';
import { EmploiDuTemps } from './entities/emploi-du-temps.entity';
import { JourSemaine } from './entities/jour-semaine.entity';
import { Messages } from './entities/messages.entity';
// ✅ Nouvelles entités ajoutées (présentes en BD mais non mappées)
import { FicheEnseignant } from './entities/fiche-enseignant.entity';
import { Justificatifs } from './entities/justificatifs.entity';
import { Quartier } from './entities/quartier.entity';
import { Residents } from './entities/residents.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'postgres'),
        port: config.get<number>('DB_PORT', 5433),
        username: config.get<string>('DB_USERNAME', 'postgres'),
        password: config.get<string>('DB_PASSWORD', '65732Pauline'),
        database: config.get<string>('DB_NAME', 'ecole_primaire'),
        // ✅ SSL requis par Aiven (et la plupart des Postgres managés). Activer via DB_SSL=true
        ssl:
          String(config.get('DB_SSL') ?? '').toLowerCase() === 'true'
            ? { rejectUnauthorized: false }
            : false,
        entities: [
          Admin, Personne, Eleve, Parents, VilleNaissance,
          Enseignant, Titulaire,
          Cycle, Classe, Salle, AnneeAcademique, Frequente,
          Cours, Discipline, Specialite, Livres,
          Trimestre, Session, NatureEpreuve, Epreuve, Evaluation, Rapport,
          Mode, Scolarite, Tranches, Paiement,
          EmploiDuTemps, JourSemaine,
          Messages,
          // ✅ Entités ajoutées pour correspondre à la BD complète
          FicheEnseignant, Justificatifs, Quartier, Residents,
        ],
        synchronize: false, // ⚠️ false car la BD existe déjà — ne pas écraser!
        logging: false,
      }),
      inject: [ConfigService],
    }),

    TypeOrmModule.forFeature([Eleve, EmploiDuTemps]),

    AuthModule,
    ElevesModule,
    ProfesseursModule,
    ClassesModule,
    CoursModule,
    EvaluationsModule,
    PaiementsModule,
    EmploiModule,
    MessagerieModule,
    VillesModule,
    MailModule,
    AdministrationModule,
    UploadModule,
    AccessControlModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}