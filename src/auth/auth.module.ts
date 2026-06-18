import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { Admin } from '../entities/admin.entity';
import { Personne } from '../entities/personne.entity';

@Module({
  imports: [
    // Donne accès aux repositories Admin et Personne dans ce module
    TypeOrmModule.forFeature([Admin, Personne]),

    PassportModule,

    // Configuration JWT asynchrone (lit JWT_SECRET depuis .env)
    JwtModule.registerAsync({
        imports: [ConfigModule],
        useFactory: (config: ConfigService) => ({
          secret: config.get<string>('JWT_SECRET'),
          signOptions: {
            expiresIn: config.get('JWT_EXPIRES_IN', '8h') as any,
          },
        }),
        inject: [ConfigService],
      }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  // Exporte JwtAuthGuard pour l'utiliser dans d'autres modules
  exports: [AuthService, JwtModule],
})
export class AuthModule {}