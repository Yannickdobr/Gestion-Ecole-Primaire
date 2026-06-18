import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  MaxLength,
  Matches,
} from 'class-validator';

// ─────────────────────────────────────────────────────────────────────────────
// DTO JourSemaine
// ─────────────────────────────────────────────────────────────────────────────
export class CreateJourSemaineDto {
  @IsString()
  @IsNotEmpty({ message: 'Le libellé du jour est obligatoire' })
  @MaxLength(15)
  libelle: string; // ex: "Lundi"
}

export class UpdateJourSemaineDto {
  @IsOptional()
  @IsString()
  @MaxLength(15)
  libelle?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// DTO Emploi du Temps
// BD EmploiDuTemps : idTemps, jour, heure, idClasse, idCours, idAdmin, created_at
// CORRECTION : heureFin supprimé — colonne absente de la table en BD
// ─────────────────────────────────────────────────────────────────────────────
export class CreateEmploiDuTempsDto {
  @IsString()
  @IsNotEmpty({ message: 'Le jour est obligatoire (ex: Lundi)' })
  @MaxLength(30)
  jour: string;

  @IsString()
  @IsNotEmpty({ message: "L'heure est obligatoire" })
  @Matches(/^\d{2}:\d{2}$/, { message: "L'heure doit être au format HH:MM (ex: 08:00)" })
  heure: string;

  // heureFin retiré — absent de la table EmploiDuTemps en BD

  @IsInt()
  @IsNotEmpty({ message: "L'identifiant de la classe est obligatoire" })
  idClasse: number;

  @IsInt()
  @IsNotEmpty({ message: "L'identifiant du cours est obligatoire" })
  idCours: number;

  @IsOptional()
  @IsInt()
  idAdmin?: number;
}

export class UpdateEmploiDuTempsDto {
  @IsOptional()
  @IsString()
  @MaxLength(30)
  jour?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: "L'heure doit être au format HH:MM" })
  heure?: string;

  // heureFin retiré — absent de la table EmploiDuTemps en BD

  @IsOptional()
  @IsInt()
  idClasse?: number;

  @IsOptional()
  @IsInt()
  idCours?: number;
}