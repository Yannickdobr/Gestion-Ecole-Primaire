import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsInt,
    MaxLength,
    Min,
  } from 'class-validator';
  
  // ─────────────────────────────────────────────────────────────────────────────
  // DTO Cycle
  // ─────────────────────────────────────────────────────────────────────────────
  export class CreateCycleDto {
    @IsString()
    @IsNotEmpty({ message: 'Le libellé du cycle est obligatoire' })
    @MaxLength(255)
    libelle: string;
  
    @IsOptional()
    @IsString()
    description?: string;
  
    @IsOptional()
    @IsInt()
    idAdmin?: number;
  }
  
  export class UpdateCycleDto {
    @IsOptional()
    @IsString()
    @MaxLength(255)
    libelle?: string;
  
    @IsOptional()
    @IsString()
    description?: string;
  }
  
  // ─────────────────────────────────────────────────────────────────────────────
  // DTO Classe
  // ─────────────────────────────────────────────────────────────────────────────
  export class CreateClasseDto {
    @IsString()
    @IsNotEmpty({ message: 'Le libellé de la classe est obligatoire' })
    @MaxLength(100)
    libelle: string;
  
    @IsInt()
    @IsNotEmpty({ message: "L'identifiant du cycle est obligatoire" })
    idCycle: number;
  
    @IsOptional()
    @IsInt()
    idAdmin?: number;
  }
  
  export class UpdateClasseDto {
    @IsOptional()
    @IsString()
    @MaxLength(100)
    libelle?: string;
  
    @IsOptional()
    @IsInt()
    idCycle?: number;
  }
  
  // ─────────────────────────────────────────────────────────────────────────────
  // DTO Salle
  // ─────────────────────────────────────────────────────────────────────────────
  export class CreateSalleDto {
    @IsString()
    @IsNotEmpty({ message: 'Le libellé de la salle est obligatoire' })
    @MaxLength(255)
    libelle: string;
  
    @IsOptional()
    @IsString()
    @MaxLength(100)
    position?: string;
  
    @IsOptional()
    @IsString()
    @MaxLength(30)
    surface?: string;
  
    @IsOptional()
    @IsInt()
    idClasse?: number;
  
    @IsOptional()
    @IsInt()
    idAdmin?: number;
  }
  
  export class UpdateSalleDto {
    @IsOptional()
    @IsString()
    @MaxLength(255)
    libelle?: string;
  
    @IsOptional()
    @IsString()
    @MaxLength(100)
    position?: string;
  
    @IsOptional()
    @IsString()
    @MaxLength(30)
    surface?: string;
  
    @IsOptional()
    @IsInt()
    idClasse?: number;
  }
  
  // ─────────────────────────────────────────────────────────────────────────────
  // DTO Année Académique
  // ─────────────────────────────────────────────────────────────────────────────
  export class CreateAnneeAcademiqueDto {
    @IsString()
    @IsNotEmpty({ message: "Le libellé de l'année est obligatoire" })
    @MaxLength(200)
    libelle: string;
  
    @IsOptional()
    @IsString()
    @MaxLength(255)
    periode?: string;
  
    @IsOptional()
    @IsInt()
    idAdmin?: number;
  }
  
  export class UpdateAnneeAcademiqueDto {
    @IsOptional()
    @IsString()
    @MaxLength(200)
    libelle?: string;
  
    @IsOptional()
    @IsString()
    @MaxLength(255)
    periode?: string;
  }
  
  // ─────────────────────────────────────────────────────────────────────────────
  // DTO Frequente (affectation élève dans une salle)
  // ─────────────────────────────────────────────────────────────────────────────
  export class CreateFrequenterDto {
    @IsInt()
    @IsNotEmpty({ message: "L'identifiant de la salle est obligatoire" })
    idSalle: number;
  
    @IsInt()
    @IsNotEmpty({ message: "L'identifiant de l'année académique est obligatoire" })
    idAcademi: number;
  
    @IsInt()
    @IsNotEmpty({ message: 'Le matricule de l\'élève est obligatoire' })
    @Min(1)
    matricule: number;
  
    @IsOptional()
    @IsString()
    @MaxLength(255)
    commentaire?: string;
  
    @IsOptional()
    @IsInt()
    idAdmin?: number;
  }