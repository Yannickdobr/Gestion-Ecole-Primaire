import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // ─── Configuration Swagger ────────────────────────────────────────────────
  const config = new DocumentBuilder()
    .setTitle('API École Primaire')
    .setDescription(
      `Documentation complète de l'API de gestion d'école primaire.\n\n` +
      `## 🔐 Authentification\n` +
      `1. Appelle **POST /api/auth/login** avec ton username et password\n` +
      `2. Copie le \`access_token\` retourné\n` +
      `3. Clique sur le bouton **Authorize 🔒** en haut à droite\n` +
      `4. Saisis : \`Bearer <ton_token>\` et valide\n\n` +
      `Toutes les routes (sauf /auth/login et /auth/seed-admin) nécessitent ce token.`,
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Entrer le token JWT : Bearer <token>',
        in: 'header',
      },
      'JWT-auth', // nom de référence utilisé dans @ApiBearerAuth()
    )
    .addTag('Auth', 'Authentification et gestion des comptes')
    .addTag('Élèves', 'Inscription, gestion et suivi des élèves')
    .addTag('Professeurs', 'Gestion des enseignants et titulaires')
    .addTag('Classes', 'Cycles, classes, salles et années académiques')
    .addTag('Cours', 'Cours, disciplines, spécialités et livres')
    .addTag('Évaluations', 'Trimestres, sessions, épreuves, notes et rapports')
    .addTag('Paiements', 'Modes de paiement, scolarité, tranches et versements')
    .addTag('Emploi du Temps', 'Créneaux horaires et gestion des conflits')
    .addTag('Messagerie', 'Messages entre administration et parents')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // garde le token entre les rechargements
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      docExpansion: 'none',       // sections fermées par défaut
      filter: true,               // barre de recherche des routes
    },
    customSiteTitle: 'API École Primaire – Docs',
  });
  // ─────────────────────────────────────────────────────────────────────────

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Serveur démarré sur http://localhost:${port}/api`);
  console.log(`📚 Swagger disponible sur http://localhost:${port}/docs`);
}
bootstrap();