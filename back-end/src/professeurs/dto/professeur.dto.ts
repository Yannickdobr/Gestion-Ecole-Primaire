import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsIn,
  IsString,
  IsEmail,
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

  // L'identifiant de connexion est l'adresse email (les coordonnées y sont envoyées)
  @IsEmail({}, { message: "L'identifiant doit être une adresse email valide" })
  @IsNotEmpty({ message: "L'email est obligatoire" })
  @MaxLength(100)
  username: string;

  // Mot de passe optionnel : s'il est absent, le backend en génère un et l'envoie par email
  @IsOptional()
  @IsString()
  @MinLength(4)
  password?: string;

  // 1=Enseignant, 2=Administratif, 3=Scolarité, 4=Parents, 5=Autres (défaut 2)
  @IsOptional()
  @IsInt()
  @IsIn([1, 2, 3, 4, 5], { message: 'typePersonne doit être 1, 2, 3, 4 ou 5' })
  typePersonne?: number;

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

  // Classe gérée par l'enseignant (obligatoire ; la salle affichée en découle)
  @IsInt()
  @IsNotEmpty({ message: "L'identifiant de la classe est obligatoire" })
  idClasse: number;

  // Matière de difficulté (le cours qu'il ne donne pas) — optionnel
  @IsOptional()
  @IsInt()
  idCours?: number;

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

  // idSalle est NOT NULL en BD (un titulaire est responsable d'une salle)
  @IsInt()
  @IsNotEmpty({ message: "L'identifiant de la salle est obligatoire" })
  idSalle: number;

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