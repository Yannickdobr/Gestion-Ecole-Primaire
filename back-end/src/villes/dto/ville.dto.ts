import { IsString, IsNotEmpty, MaxLength, IsOptional, IsIn, IsInt } from 'class-validator';

export class CreateVilleDto {
  @IsString()
  @IsNotEmpty({ message: 'Le libellé de la ville est obligatoire' })
  @MaxLength(100)
  libelle: string;

  @IsOptional()
  @IsInt()
  @IsIn([0, 1])
  actif?: number;
}
