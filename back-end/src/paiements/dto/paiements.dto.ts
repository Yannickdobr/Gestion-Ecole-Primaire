import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsNumber,
  IsDateString,
  MaxLength,
  Min,
  IsIn,
} from 'class-validator';

// ─────────────────────────────────────────────────────────────────────────────
// DTO Mode de paiement
// ─────────────────────────────────────────────────────────────────────────────
export class CreateModeDto {
  @IsString()
  @IsNotEmpty({ message: 'Le libellé du mode de paiement est obligatoire' })
  @MaxLength(100)
  libelle: string;

  @IsOptional()
  @IsString()
  information?: string;

  @IsOptional()
  @IsInt()
  idFondateur?: number;
}

export class UpdateModeDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  libelle?: string;

  @IsOptional()
  @IsString()
  information?: string;

  @IsOptional()
  @IsInt()
  @IsIn([0, 1])
  actif?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// DTO Scolarité
// ─────────────────────────────────────────────────────────────────────────────
export class CreateScolariteDto {
  @IsNumber()
  @Min(0)
  inscription: number;

  @IsNumber()
  @Min(0)
  pension: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  nbreTranche?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @IsNotEmpty({ message: "L'identifiant du cycle est obligatoire" })
  idCycle: number;

  @IsOptional()
  @IsInt()
  idFondateur?: number;

  @IsOptional()
  @IsInt()
  idAdmin?: number;
}

export class UpdateScolariteDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  inscription?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  pension?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  nbreTranche?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  idCycle?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// DTO Tranche
// ─────────────────────────────────────────────────────────────────────────────
export class CreateTrancheDto {
  @IsString()
  @IsNotEmpty({ message: 'Le libellé de la tranche est obligatoire' })
  @MaxLength(255)
  libelle: string;

  @IsNumber()
  @Min(0)
  montant: number;

  @IsOptional()
  @IsString()
  @MaxLength(2)
  delai_mois?: string; // "09"

  @IsOptional()
  @IsString()
  @MaxLength(2)
  delai_jour?: string; // "15"

  @IsInt()
  @IsNotEmpty({ message: "L'identifiant de la scolarité est obligatoire" })
  idScolarite: number;

  @IsOptional()
  @IsInt()
  idFondateur?: number;
}

export class UpdateTrancheDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  libelle?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  montant?: number;

  @IsOptional()
  @IsString()
  @MaxLength(2)
  delai_mois?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2)
  delai_jour?: string;

  @IsOptional()
  @IsInt()
  @IsIn([0, 1])
  actif?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// DTO Paiement
// ─────────────────────────────────────────────────────────────────────────────
export class CreatePaiementDto {
  @IsNumber()
  @Min(0, { message: 'Le montant doit être positif' })
  montant: number;

  @IsDateString({}, { message: 'La date de paiement doit être au format YYYY-MM-DD' })
  datePaie: string;

  @IsInt()
  @IsNotEmpty({ message: 'Le matricule de l\'élève est obligatoire' })
  matricule: number;

  @IsInt()
  @IsNotEmpty({ message: "L'identifiant de l'année académique est obligatoire" })
  idAca: number;

  @IsInt()
  @IsNotEmpty({ message: 'Le mode de paiement est obligatoire' })
  idMode: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  url?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  commentaire?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  operation_ID?: string;

  @IsOptional()
  @IsInt()
  idPers?: number; // admin qui enregistre
}

export class UpdatePaiementDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  montant?: number;

  @IsOptional()
  @IsDateString()
  datePaie?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  url?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  commentaire?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  operation_ID?: string;

  @IsOptional()
  @IsInt()
  idMode?: number;
}
