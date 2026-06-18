import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsIn,
  IsString,
  MaxLength,
  IsDateString,
  MinLength,
} from 'class-validator';

// ─────────────────────────────────────────────────────────────────────────────
// DTO Création d'une Personne (profil enseignant)
// ─────────────────────────────────────────────────────────────────────────────
export class CreatePersonneEnseignantDto {
  @IsString()
  @IsNotEmpty({ message: 'Le nom est obligatoire' })
  @MaxLength(255)
  nom: string;

  @IsString()
  @IsNotEmpty({ message: 'Le prénom est obligatoire' })
  @MaxLength(255)
  prenom: string;

  @IsOptional()
  @IsDateString()
  dateNaissance?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  lieuNaissance?: string;

  @IsOptional()
  @IsString()
  @MaxLength(15)
  mobile?: string;

  @IsOptional()
  @IsString()
  @MaxLength(15)
  phone?: string;

  @IsString()
  @IsNotEmpty({ message: "Le nom d'utilisateur est obligatoire" })
  @MaxLength(100)
  username: string;

  @IsString()
  @IsNotEmpty({ message: 'Le mot de passe est obligatoire' })
  @MinLength(4)
  password: string;

  @IsOptional()
  @IsInt()
  idAdmin?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// DTO Mise à jour d'une Personne enseignant
// ─────────────────────────────────────────────────────────────────────────────
export class UpdatePersonneEnseignantDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  nom?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  prenom?: string;

  @IsOptional()
  @IsDateString()
  dateNaissance?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  lieuNaissance?: string;

  @IsOptional()
  @IsString()
  @MaxLength(15)
  mobile?: string;

  @IsOptional()
  @IsString()
  @MaxLength(15)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  username?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// DTO Création d'un Enseignant (lie une Personne existante)
// ─────────────────────────────────────────────────────────────────────────────
export class CreateEnseignantDto {
  @IsInt()
  @IsNotEmpty({ message: "L'identifiant de la personne est obligatoire" })
  idPers: number;

  @IsOptional()
  @IsInt()
  idAdmin?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// DTO Création d'un Titulaire (lie une Personne existante)
// ─────────────────────────────────────────────────────────────────────────────
export class CreateTitulaireDto {
  @IsInt()
  @IsNotEmpty({ message: "L'identifiant de la personne est obligatoire" })
  idPers: number;

  @IsOptional()
  @IsInt()
  idAdmin?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// DTO Activation / Désactivation
// ─────────────────────────────────────────────────────────────────────────────
export class UpdateStatutDto {
  @IsInt()
  @IsIn([0, 1], { message: 'Le statut doit être 0 (inactif) ou 1 (actif)' })
  actif: number;
}