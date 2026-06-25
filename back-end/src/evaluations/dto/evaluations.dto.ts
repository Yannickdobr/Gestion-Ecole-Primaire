import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsNumber,
  IsDateString,
  MaxLength,
  Min,
  Max,
} from 'class-validator';

// ─────────────────────────────────────────────────────────────────────────────
// DTO Trimestre
// ─────────────────────────────────────────────────────────────────────────────
export class CreateTrimestreDto {
  @IsString()
  @IsNotEmpty({ message: 'Le libellé du trimestre est obligatoire' })
  @MaxLength(255)
  libelle: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  periode?: string;

  @IsInt()
  @IsNotEmpty({ message: "L'identifiant de l'année académique est obligatoire" })
  idAca: number;

  @IsOptional()
  @IsInt()
  idAdmin?: number;
}

export class UpdateTrimestreDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  libelle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  periode?: string;

  @IsOptional()
  @IsInt()
  idAca?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// DTO Session
// ─────────────────────────────────────────────────────────────────────────────
export class CreateSessionDto {
  @IsString()
  @IsNotEmpty({ message: 'Le libellé de la session est obligatoire' })
  @MaxLength(255)
  libelle: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @IsNotEmpty({ message: "L'identifiant du trimestre est obligatoire" })
  idTrimestre: number;

  // idPers (responsable) est NOT NULL en BD
  @IsInt()
  @IsNotEmpty({ message: "L'identifiant du responsable (personne) est obligatoire" })
  idPers: number;
}

export class UpdateSessionDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  libelle?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  idTrimestre?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// DTO NatureEpreuve
// ─────────────────────────────────────────────────────────────────────────────
export class CreateNatureEpreuveDto {
  @IsString()
  @IsNotEmpty({ message: "Le libellé de la nature d'épreuve est obligatoire" })
  @MaxLength(255)
  libelle: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateNatureEpreuveDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  libelle?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// DTO Epreuve
// ─────────────────────────────────────────────────────────────────────────────
export class CreateEpreuveDto {
  @IsString()
  @IsNotEmpty({ message: "Le libellé de l'épreuve est obligatoire" })
  @MaxLength(255)
  libelle: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  urlDoc?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  auteur?: string;

  @IsInt()
  @IsNotEmpty({ message: "L'identifiant de la nature est obligatoire" })
  idNature: number;

  @IsOptional()
  @IsInt()
  idPers?: number;
}

export class UpdateEpreuveDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  libelle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  urlDoc?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  auteur?: string;

  @IsOptional()
  @IsInt()
  idNature?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// DTO Evaluation (saisie d'une note)
// ─────────────────────────────────────────────────────────────────────────────
export class CreateEvaluationDto {
  @IsNumber()
  @Min(0)
  @Max(20)
  note: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  appreciation?: string;

  @IsInt()
  @IsNotEmpty({ message: 'Le matricule de l\'élève est obligatoire' })
  matricule: number;

  @IsInt()
  @IsNotEmpty({ message: "L'identifiant de l'épreuve est obligatoire" })
  idEpreuve: number;

  @IsInt()
  @IsNotEmpty({ message: "L'identifiant du cours est obligatoire" })
  idCours: number;

  @IsInt()
  @IsNotEmpty({ message: "L'identifiant de la session est obligatoire" })
  idSession: number;

  @IsOptional()
  @IsInt()
  idPers?: number; // enseignant qui saisit
}

export class UpdateEvaluationDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(20)
  note?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  appreciation?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// DTO Rapport
// ─────────────────────────────────────────────────────────────────────────────
export class CreateRapportDto {
  @IsString()
  @IsNotEmpty({ message: 'Le libellé du rapport est obligatoire' })
  @MaxLength(100)
  libelle: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  points?: number;

  @IsOptional()
  @IsString()
  commentaire?: string;

  @IsOptional()
  @IsDateString()
  event_date?: string;

  @IsInt()
  @IsNotEmpty({ message: 'Le matricule de l\'élève est obligatoire' })
  matricule: number;

  @IsInt()
  @IsNotEmpty({ message: "L'identifiant de l'année académique est obligatoire" })
  idAca: number;

  @IsOptional()
  @IsInt()
  idPers?: number;
}

export class UpdateRapportDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  libelle?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  points?: number;

  @IsOptional()
  @IsString()
  commentaire?: string;

  @IsOptional()
  @IsDateString()
  event_date?: string;
}
