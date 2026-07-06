import {
  IsString, IsNotEmpty, IsOptional, IsInt, IsIn, MaxLength, MinLength,
} from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty({ message: "L'objet du message est obligatoire" })
  @MaxLength(255)
  objet: string;

  @IsString()
  @IsNotEmpty({ message: 'Le contenu du message est obligatoire' })
  @MinLength(5)
  information: string;

  @IsOptional()
  @IsInt()
  @IsIn([0, 1, 2], { message: '0=individuel, 1=tous parents, 2=paiement' })
  type_message?: number;

  // ✅ AnneeAcade est un VARCHAR(15) dans la BD (ex: "2024-2025")
  @IsOptional()
  @IsString()
  @MaxLength(15)
  AnneeAcade?: string;

  // Expéditeur dérivé du compte connecté (ignoré s'il est envoyé) — sécurité
  @IsOptional()
  @IsInt()
  idExp_Pers?: number;

  @IsInt()
  @IsNotEmpty({ message: "L'identifiant du parent destinataire est obligatoire" })
  idParent: number;
}

export class UpdateMessageDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  objet?: string;

  @IsOptional()
  @IsString()
  information?: string;

  @IsOptional()
  @IsInt()
  @IsIn([0, 1, 2])
  type_message?: number;

  @IsOptional()
  @IsString()
  @MaxLength(15)
  AnneeAcade?: string;
}

export class EnvoiMasseDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  objet: string;

  @IsString()
  @IsNotEmpty()
  information: string;

  @IsOptional()
  @IsInt()
  @IsIn([0, 1, 2])
  type_message?: number;

  @IsOptional()
  @IsString()
  @MaxLength(15)
  AnneeAcade?: string;

  // Expéditeur dérivé du compte connecté (ignoré s'il est envoyé)
  @IsOptional()
  @IsInt()
  idExp_Pers?: number;

  @IsInt({ each: true })
  @IsNotEmpty()
  idParents: number[];
}

export class ConvocationClasseDto {
  @IsString()
  @IsNotEmpty({ message: "L'objet est obligatoire" })
  @MaxLength(255)
  objet: string;

  @IsString()
  @IsNotEmpty({ message: 'Le contenu est obligatoire' })
  information: string;

  @IsOptional()
  @IsString()
  @MaxLength(15)
  AnneeAcade?: string;
}