import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { Admin } from './src/entities/admin.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

function genererMotDePasse(longueur = 10): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let p = '';
  for (let i = 0; i < longueur; i++) p += chars[Math.floor(Math.random() * chars.length)];
  return p;
}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const adminRepository = app.get(getRepositoryToken(Admin));

  try {
    const plainPassword = genererMotDePasse();
    console.log('Generated plain password:', plainPassword);

    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    console.log('Hashed password:', hashedPassword);

    const admin = adminRepository.create({
      nom: 'Test Admin',
      username: 'testadmin_direct@mail.com',
      password: hashedPassword,
      actif: 1,
      typeAdmin: 3,
      mobile: '000',
      alanyaID: '000',
    });

    const saved = await adminRepository.save(admin);
    console.log('Saved admin ID:', saved.ID);

    // Fetch from DB
    const fetched = await adminRepository.findOne({ where: { ID: saved.ID } });
    console.log('Fetched admin password from DB:', fetched.password);

    // Test compare
    const isValid = await bcrypt.compare(plainPassword, fetched.password);
    console.log('Is password valid? ', isValid);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
