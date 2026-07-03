import {
  IsString, IsNotEmpty, IsOptional, IsInt, IsDateString, MaxLength, Min,
} from 'class-validator';

// ─── Justificatifs (justificatif d'absence lié à un rapport) ────────────────
export class CreateJustificatifDto {
  @IsInt()
  @IsNotEmpty({ message: "L'identifiant du rapport est obligatoire" })
  idRapport: number;

  @IsOptional()
  @IsString()
  commentaire?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  urlDoc?: string;

  @IsOptional()
  @IsInt()
  idDirecteur?: number;
}

// ─── Fiche enseignant (suivi RH) ────────────────────────────────────────────
export class CreateFicheEnseignantDto {
  @IsInt()
  @IsNotEmpty({ message: "L'identifiant de l'enseignant est obligatoire" })
  idEnseignant: number;

  @IsInt()
  @IsNotEmpty({ message: "L'identifiant de l'année académique est obligatoire" })
  idAca: number;

  @IsString()
  @IsNotEmpty({ message: 'Le libellé est obligatoire' })
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

  @IsOptional()
  @IsInt()
  idAdministratif?: number;
}

// ─── Quartier ───────────────────────────────────────────────────────────────
export class CreateQuartierDto {
  @IsString()
  @IsNotEmpty({ message: 'Le libellé du quartier est obligatoire' })
  @MaxLength(100)
  libelle: string;

  @IsOptional()
  @IsString()
  description?: string;
}

// ─── Résident (lien personne ↔ quartier) ────────────────────────────────────
export class CreateResidentDto {
  @IsInt()
  @IsNotEmpty({ message: "L'identifiant de la personne est obligatoire" })
  idPers: number;

  @IsInt()
  @IsNotEmpty({ message: "L'identifiant du quartier est obligatoire" })
  idQuartier: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  idAdmin?: number;
}
