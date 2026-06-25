import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty({ message: "L'ancien mot de passe est obligatoire" })
  ancienMotDePasse: string;

  @IsString()
  @MinLength(4, { message: 'Le nouveau mot de passe doit contenir au moins 4 caractères' })
  nouveauMotDePasse: string;
}
