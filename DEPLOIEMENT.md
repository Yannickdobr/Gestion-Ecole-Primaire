# 🚀 Guide de déploiement — BrightSchool (Gestion École Primaire)

Architecture cible :

| Composant   | Hébergeur | Dossier du dépôt |
|-------------|-----------|------------------|
| Base de données PostgreSQL | **Aiven** | — |
| Back-end (NestJS / API)    | **Render** | `back-end/` |
| Front-end (Next.js)        | **Vercel** | `front-end/` |

Dépôt GitHub : https://github.com/Yannickdobr/Gestion-Ecole-Primaire.git
(monorepo : le back-end et le front-end sont dans le même dépôt, branche `main`.)

Ordre à respecter : **1) Aiven → 2) Render → 3) Vercel** (chaque étape fournit une info à la suivante).

---

## 1️⃣ Base de données — Aiven

1. Crée un compte sur https://aiven.io → **Create service → PostgreSQL** (le plan gratuit / *Hobbyist* suffit pour démarrer).
2. Choisis une région proche (ex. `google-europe-west1`), donne un nom, puis **Create**.
3. Attends que le statut passe à **RUNNING**, puis ouvre l'onglet **Overview → Connection information**. Note :
   - `Host`, `Port`, `User` (souvent `avnadmin`), `Password`, `Database name` (souvent `defaultdb`).
   - Le **SSL est obligatoire** sur Aiven → on mettra `DB_SSL=true`.
4. **Importer le schéma** (le fichier `Ecole-primaire.sql` à la racine du dépôt) :
   ```bash
   # Depuis ta machine (psql doit être installé) :
   psql "postgres://avnadmin:MOTDEPASSE@HOST:PORT/defaultdb?sslmode=require" -f Ecole-primaire.sql
   ```
   > Si tu préfères une base nommée `ecole_primaire`, crée-la d'abord :
   > `CREATE DATABASE ecole_primaire;` puis importe dedans et utilise ce nom dans `DB_NAME`.
5. Garde ces identifiants sous la main pour l'étape Render.

> ⚠️ `synchronize: false` dans le back-end : TypeORM **ne crée pas** les tables. Le schéma DOIT être importé via le `.sql` — c'est voulu (contrainte du projet : ne pas modifier la BD).

---

## 2️⃣ Back-end — Render

1. Sur https://render.com → **New → Web Service** → connecte le dépôt GitHub `Gestion-Ecole-Primaire`.
2. Configuration :
   - **Root Directory** : `back-end`
   - **Runtime** : Node
   - **Build Command** : `npm install && npm run build`
   - **Start Command** : `npm run start:prod`   (lance `node dist/main`)
   - **Instance Type** : Free (pour commencer)
3. **Environment Variables** (onglet *Environment*) — reprends `back-end/.env.example` :
   ```
   JWT_SECRET=<longue_chaine_aleatoire>
   JWT_EXPIRES_IN=8h
   DB_HOST=<host Aiven>
   DB_PORT=<port Aiven>
   DB_USERNAME=avnadmin
   DB_PASSWORD=<mot de passe Aiven>
   DB_NAME=defaultdb            # ou ecole_primaire
   DB_SSL=true                  # ⚠️ indispensable pour Aiven
   MAIL_HOST=smtp-relay.brevo.com
   MAIL_PORT=587
   MAIL_USER=<user Brevo>
   MAIL_PASS=<clé SMTP Brevo>
   MAIL_FROM=BrightSchool <brightschool.noreply@gmail.com>
   MAIL_TLS_INSECURE=false
   ```
   > Ne définis PAS `PORT` : Render l'injecte automatiquement, et `main.ts` lit `process.env.PORT`.
4. **Create Web Service**. À la fin du déploiement tu obtiens une URL du type
   `https://gestion-ecole-primaire.onrender.com`.
5. Vérifie : ouvre `https://<ton-service>.onrender.com/docs` → la doc Swagger doit s'afficher.
   L'API répond sous le préfixe **`/api`** (ex. `POST /api/auth/login`).

> ⚠️ **Uploads éphémères** : le dossier `uploads/` (fichiers téléversés via multer) est stocké sur le
> disque de l'instance Render, qui est **effacé à chaque redéploiement/redémarrage**. Pour de la
> persistance, brancher un stockage objet (S3, Cloudinary…) ou un *Render Disk* payant. Non bloquant
> pour une démo.
>
> ⚠️ **Cold start** (plan gratuit) : le service s'endort après ~15 min d'inactivité ; la 1ʳᵉ requête
> peut prendre 30–60 s.

---

## 3️⃣ Front-end — Vercel

1. Sur https://vercel.com → **Add New → Project** → importe le dépôt `Gestion-Ecole-Primaire`.
2. Configuration :
   - **Root Directory** : `front-end`
   - **Framework Preset** : Next.js (auto-détecté)
   - Build/Install : valeurs par défaut (`next build`).
3. **Environment Variables** :
   ```
   NEXT_PUBLIC_API_URL=https://<ton-service>.onrender.com/api
   ```
   (⚠️ bien terminer par `/api`, sans slash final.)
4. **Deploy**. Tu obtiens une URL type `https://gestion-ecole-primaire.vercel.app`.

---

## 4️⃣ Vérifications finales

- [ ] Swagger accessible : `https://<render>.onrender.com/docs`
- [ ] Login depuis le front déployé fonctionne (le compte **Root** est créé via `POST /api/auth/seed-admin` si besoin — voir README back-end).
- [ ] Les appels réseau du front pointent bien vers l'URL Render (onglet *Network* du navigateur).
- [ ] CORS : le back-end autorise déjà toutes les origines (`origin: '*'` dans `main.ts`).

## 🔒 Sécurité — à faire avant la mise en production réelle

- Changer `JWT_SECRET` par une vraie valeur aléatoire (ex. `openssl rand -hex 32`).
- Restreindre le CORS à l'URL Vercel exacte au lieu de `*` (dans `back-end/src/main.ts`).
- Ne jamais commiter les `.env` (déjà gitignorés) — seuls les `.env.example` sont versionnés.

## 🔁 Redéploiement

Chaque `git push` sur `main` déclenche automatiquement un redéploiement sur Render **et** Vercel.
