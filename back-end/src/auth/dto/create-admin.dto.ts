import { IsString, IsNotEmpty, IsEmail, IsOptional, IsInt, IsIn, MaxLength } from 'class-validator';

export class CreateAdminDto {
  @IsString()
  @IsNotEmpty({ message: 'Le nom est obligatoire' })
  @MaxLength(100)
  nom: string;

  // L'identifiant de connexion est l'email (les coordonnées y sont envoyées)
  @IsEmail({}, { message: "L'identifiant doit être une adresse email valide" })
  @IsNotEmpty()
  @MaxLength(50)
  username: string;

  // 2 = Fondateur, 3 = Directeur (le Root ne se crée pas via l'API ;
  // « Admin standard » (1) supprimé : les tâches de saisie relèvent du Personnel)
  @IsInt()
  @IsIn([2, 3], { message: 'typeAdmin doit être 2 (Fondateur) ou 3 (Directeur)' })
  typeAdmin: number;

  @IsOptional()
  @IsString()
  @MaxLength(15)
  mobile?: string;
}
