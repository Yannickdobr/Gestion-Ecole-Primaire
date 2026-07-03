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
    console.log('--- Last 3 Admins ---');
    const admins = await adminRepo.find({ order: { ID: 'DESC' }, take: 3 });
    for (const a of admins) {
      const isEmpty = await bcrypt.compare('', a.password);
      console.log(`Admin ${a.username} | is empty string? ${isEmpty}`);
    }

    console.log('--- Last 3 Personnes ---');
    const personnes = await personneRepo.find({ order: { idPers: 'DESC' }, take: 3 });
    for (const p of personnes) {
      const isEmpty = await bcrypt.compare('', p.password);
      console.log(`Personne ${p.username} | is empty string? ${isEmpty}`);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
