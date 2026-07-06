import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsNumber,
  IsDateString,
  MaxLength,
  Min,
} from 'class-validator';

// ─────────────────────────────────────────────────────────────────────────────
// DTO Cours
// ─────────────────────────────────────────────────────────────────────────────
export class CreateCoursDto {
  @IsString()
  @IsNotEmpty({ message: 'Le libellé du cours est obligatoire' })
  @MaxLength(255)
  libelle: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  note?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  coefficient?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @IsNotEmpty({ message: "L'identifiant de la classe est obligatoire" })
  idClasse: number;

  @IsOptional()
  @IsInt()
  idLivre?: number;

  @IsOptional()
  @IsInt()
  idAdmin?: number;
}

export class UpdateCoursDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  libelle?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  note?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  coefficient?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  idClasse?: number;

  @IsOptional()
  @IsInt()
  idLivre?: number;

  @IsOptional()
  @IsInt()
  actif?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// DTO Discipline
// ─────────────────────────────────────────────────────────────────────────────
export class CreateDisciplineDto {
  @IsString()
  @IsNotEmpty({ message: 'Le libellé de la discipline est obligatoire' })
  @MaxLength(255)
  libelle: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  points?: number;
}

export class UpdateDisciplineDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  libelle?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  points?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// DTO Spécialité
// BD Specialite : idSpecialite, libelle, idAdmin  — PAS de idParent
// ─────────────────────────────────────────────────────────────────────────────
export class CreateSpecialiteDto {
  @IsString()
  @IsNotEmpty({ message: 'Le libellé de la spécialité est obligatoire' })
  @MaxLength(255)
  libelle: string;

  // CORRECTION : idParent supprimé — colonne absente de la table Specialite en BD
  // L'entité ne l'expose pas → le service ne peut pas l'écrire

  @IsOptional()
  @IsInt()
  idAdmin?: number;
}

export class UpdateSpecialiteDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  libelle?: string;

  // CORRECTION : idParent supprimé — idem
}

// ─────────────────────────────────────────────────────────────────────────────
// DTO Livres
// ─────────────────────────────────────────────────────────────────────────────
export class CreateLivreDto {
  @IsString()
  @IsNotEmpty({ message: 'Le titre du livre est obligatoire' })
  @MaxLength(255)
  titre: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  auteurs?: string;

  @IsNumber()
  @Min(0)
  prix: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  edition?: string;

  @IsOptional()
  @IsDateString()
  annee_parution?: string; // "YYYY-MM-DD" → converti en Date dans le service

  @IsOptional()
  @IsInt()
  @Min(1)
  totalCopie?: number;

  @IsOptional()
  @IsInt()
  idSpecialite?: number;

  @IsOptional()
  @IsInt()
  idAdmin?: number;
}

export class UpdateLivreDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  titre?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  auteurs?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  prix?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  edition?: string;

  @IsOptional()
  @IsDateString()
  annee_parution?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  totalCopie?: number;

  @IsOptional()
  @IsInt()
  idSpecialite?: number;
}