import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { Personne } from './src/entities/personne.entity';
import { Admin } from './src/entities/admin.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const personneRepo = app.get(getRepositoryToken(Personne));
  const adminRepo = app.get(getRepositoryToken(Admin));

  try {
    const admin = await adminRepo.findOne({ where: { username: 'ngdani116@gmail.com' } });
    console.log('Admin ngdani116 password hash:', admin?.password);

    const pers = await personneRepo.findOne({ where: { username: 'giovanningondiep@gmail.com' } });
    console.log('Personne giovanni password hash:', pers?.password);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
