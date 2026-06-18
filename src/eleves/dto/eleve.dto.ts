import {
    IsString,
    IsNotEmpty,
    IsDateString,
    IsInt,
    IsOptional,
    IsIn,
    Min,
    MaxLength,
  } from 'class-validator';
  
  // ─────────────────────────────────────────────────────────────────────────────
  // DTO Création d'un élève
  // ─────────────────────────────────────────────────────────────────────────────
  export class CreateEleveDto {
    @IsString()
    @IsNotEmpty({ message: 'Le nom est obligatoire' })
    @MaxLength(60)
    nom: string;
  
    @IsString()
    @IsNotEmpty({ message: 'Le prénom est obligatoire' })
    @MaxLength(60)
    prenom: string;
  
    @IsDateString({}, { message: 'La date de naissance doit être au format YYYY-MM-DD' })
    dateNaissance: string;
  
    @IsOptional()
    @IsString()
    @MaxLength(30)
    lieuNaissance?: string;
  
    @IsInt()
    @IsIn([1, 2], { message: 'Le sexe doit être 1 (Masculin) ou 2 (Féminin)' })
    sexe: number;
  
    @IsOptional()
    @IsString()
    @MaxLength(30)
    langue?: string;
  
    @IsOptional()
    @IsString()
    @MaxLength(255)
    photoURL?: string;
  
    @IsOptional()
    @IsInt()
    @Min(1)
    idVilleNaissance?: number;
  
    @IsOptional()
    @IsInt()
    idAdmin?: number;
  }
  
  // ─────────────────────────────────────────────────────────────────────────────
  // DTO Mise à jour (tous les champs optionnels)
  // ─────────────────────────────────────────────────────────────────────────────
  export class UpdateEleveDto {
    @IsOptional()
    @IsString()
    @MaxLength(60)
    nom?: string;
  
    @IsOptional()
    @IsString()
    @MaxLength(60)
    prenom?: string;
  
    @IsOptional()
    @IsDateString()
    dateNaissance?: string;
  
    @IsOptional()
    @IsString()
    @MaxLength(30)
    lieuNaissance?: string;
  
    @IsOptional()
    @IsInt()
    @IsIn([1, 2])
    sexe?: number;
  
    @IsOptional()
    @IsString()
    @MaxLength(30)
    langue?: string;
  
    @IsOptional()
    @IsString()
    @MaxLength(255)
    photoURL?: string;
  
    @IsOptional()
    @IsInt()
    idVilleNaissance?: number;
  
    @IsOptional()
    @IsInt()
    @IsIn([0, 1])
    actif?: number;
  }
  
  // ─────────────────────────────────────────────────────────────────────────────
  // DTO Ajout d'un parent à un élève
  // ─────────────────────────────────────────────────────────────────────────────
  export class AddParentDto {
    @IsInt()
    @IsNotEmpty({ message: "L'identifiant de la personne est obligatoire" })
    idPers: number;
  }