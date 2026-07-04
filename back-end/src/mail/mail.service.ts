import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: nodemailer.Transporter;

  constructor(private readonly config: ConfigService) {
    const port = Number(this.config.get<string>('MAIL_PORT')) || 465;
    // Sécurisé par défaut : on VÉRIFIE le certificat TLS.
    // On ne désactive la vérif que si MAIL_TLS_INSECURE=true (ex. poste dev
    // dont l'antivirus inspecte le TLS avec sa propre CA).
    const tlsInsecure =
      String(this.config.get('MAIL_TLS_INSECURE') ?? '').toLowerCase() === 'true';
    if (tlsInsecure) {
      this.logger.warn('MAIL_TLS_INSECURE=true → vérification du certificat TLS désactivée (à éviter en production).');
    }
    // cast en `any` : `family` (IPv4) n'est pas dans les types nodemailer mais est supporté
    const options: any = {
      host: this.config.get<string>('MAIL_HOST'),
      port,
      secure: port === 465, // 465 = SSL, 587 = STARTTLS
      family: 4, // force l'IPv4 (évite les ECONNREFUSED IPv6)
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      auth: {
        user: this.config.get<string>('MAIL_USER'),
        pass: this.config.get<string>('MAIL_PASS'),
      },
      tls: { rejectUnauthorized: !tlsInsecure },
    };
    this.transporter = nodemailer.createTransport(options);
  }

  // Vérifie la connexion/authentification SMTP au démarrage
  async onModuleInit() {
    try {
      await this.transporter.verify();
      this.logger.log(`SMTP prêt (${this.config.get('MAIL_USER')})`);
    } catch (e) {
      this.logger.error(`SMTP NON disponible : ${(e as Error).message}`);
    }
  }

  /**
   * Envoie les identifiants de connexion à un nouvel utilisateur.
   * Retourne true si Gmail a ACCEPTÉ le destinataire, false sinon.
   */
  async envoyerIdentifiants(params: {
    to: string;
    nomComplet: string;
    username: string;
    motDePasse: string;
    role: string;
  }): Promise<boolean> {
    const from = this.config.get<string>('MAIL_FROM') || this.config.get<string>('MAIL_USER');
    const { to, nomComplet, username, motDePasse, role } = params;

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#1a1208">
        <h2 style="color:#d86310">Bienvenue sur BrightSchool</h2>
        <p>Bonjour <b>${nomComplet}</b>,</p>
        <p>Votre compte <b>${role}</b> a été créé sur la plateforme de gestion de l'école BrightSchool.</p>
        <div style="background:#faf6f1;border:1px solid #eee;border-radius:10px;padding:16px;margin:16px 0">
          <p style="margin:4px 0"><b>Identifiant :</b> ${username}</p>
          <p style="margin:4px 0"><b>Code d'accès provisoire :</b> ${motDePasse}</p>
        </div>
        <p>Connectez-vous puis personnalisez votre code d'accès depuis votre espace, rubrique « Changer mon mot de passe ».</p>
        <p style="color:#8a7060;font-size:13px;margin-top:20px">BrightSchool — message automatique, merci de ne pas répondre.</p>
      </div>`;

    // Version texte (multipart) : améliore la délivrabilité (moins de spam)
    const text =
      `Bienvenue sur BrightSchool\n\n` +
      `Bonjour ${nomComplet},\n\n` +
      `Votre compte ${role} a été créé sur la plateforme de gestion de l'école.\n\n` +
      `Identifiant : ${username}\n` +
      `Code d'accès provisoire : ${motDePasse}\n\n` +
      `Connectez-vous puis personnalisez votre code d'accès (rubrique « Changer mon mot de passe »).\n\n` +
      `BrightSchool — message automatique, merci de ne pas répondre.`;

    try {
      const info = await this.transporter.sendMail({
        from,
        to,
        subject: 'Votre accès BrightSchool',
        html,
        text,
      });
      const accepte = (info.accepted || []).map(String);
      const rejete = (info.rejected || []).map(String);
      this.logger.log(
        `Email -> ${to} | accepté: [${accepte.join(', ')}] | rejeté: [${rejete.join(', ')}] | réponse: ${info.response}`,
      );
      // Succès uniquement si l'adresse est dans "accepted" et pas dans "rejected"
      return accepte.includes(to) && rejete.length === 0;
    } catch (e) {
      this.logger.error(`Échec d'envoi de l'email à ${to} : ${(e as Error).message}`);
      return false;
    }
  }

  /**
   * Envoi générique (notifications : bulletins, rappels, annonces).
   * `texte` est habillé dans un gabarit HTML BrightSchool si `html` n'est pas fourni.
   * Retourne false sans lever d'exception en cas d'échec (best-effort).
   */
  async envoyer(params: {
    to: string;
    sujet: string;
    texte: string;
    html?: string;
  }): Promise<boolean> {
    const { to, sujet, texte } = params;
    // On n'envoie que vers une adresse email valide (le username fait office d'email).
    if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) return false;

    const from =
      this.config.get<string>('MAIL_FROM') || this.config.get<string>('MAIL_USER');
    const html =
      params.html ??
      `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#1a1208">
        <h2 style="color:#d86310">BrightSchool</h2>
        <div style="background:#faf6f1;border:1px solid #eee;border-radius:10px;padding:16px;margin:12px 0;white-space:pre-line">${texte}</div>
        <p style="color:#8a7060;font-size:13px;margin-top:20px">BrightSchool — message automatique, merci de ne pas répondre.</p>
      </div>`;

    try {
      const info = await this.transporter.sendMail({ from, to, subject: sujet, html, text: texte });
      const accepte = (info.accepted || []).map(String);
      return accepte.includes(to);
    } catch (e) {
      this.logger.error(`Échec notification email à ${to} : ${(e as Error).message}`);
      return false;
    }
  }
}
