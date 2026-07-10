import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Envoi de messages WhatsApp — pendant du MailService pour les comptes dont
 * l'identifiant de connexion est un numéro de téléphone (parents notamment).
 *
 * ⚠️ L'API WhatsApp n'est pas encore fournie : tant que WHATSAPP_API_URL et
 * WHATSAPP_TOKEN ne sont pas renseignés (.env), l'envoi est désactivé et les
 * méthodes retournent `false` (aucun message n'est réellement envoyé).
 *
 * Quand l'API sera disponible, il suffira d'adapter `envoyerTexte()` au format
 * du fournisseur (Meta Cloud API, Twilio, 360dialog, etc.) — le reste du code
 * (routage e-mail ↔ WhatsApp, envoi des identifiants, notifications) est déjà
 * en place.
 */
@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);

  constructor(private readonly config: ConfigService) {}

  /** Un identifiant est un téléphone s'il ne contient pas « @ » et n'a que des chiffres (+ éventuel indicatif). */
  static estTelephone(identifiant?: string): boolean {
    if (!identifiant) return false;
    const v = String(identifiant).trim();
    if (v.includes('@')) return false;
    return /^\+?[0-9][0-9\s().-]{5,}$/.test(v);
  }

  /** Le service est-il configuré (API renseignée) ? */
  estConfigure(): boolean {
    return Boolean(
      this.config.get<string>('WHATSAPP_API_URL') &&
        this.config.get<string>('WHATSAPP_TOKEN'),
    );
  }

  /**
   * Envoi bas niveau d'un texte WhatsApp. Retourne true si le fournisseur a
   * accepté le message. Implémentation générique (POST JSON + Bearer token) :
   * à ajuster selon l'API réelle une fois les identifiants fournis.
   */
  private async envoyerTexte(to: string, corps: string): Promise<boolean> {
    if (!this.estConfigure()) {
      this.logger.warn(
        `WhatsApp non configuré (WHATSAPP_API_URL / WHATSAPP_TOKEN manquants) — message non envoyé à ${to}.`,
      );
      return false;
    }
    if (!WhatsappService.estTelephone(to)) {
      this.logger.warn(`Numéro WhatsApp invalide : ${to}`);
      return false;
    }

    const url = this.config.get<string>('WHATSAPP_API_URL')!;
    const token = this.config.get<string>('WHATSAPP_TOKEN')!;
    const from = this.config.get<string>('WHATSAPP_FROM') || undefined;
    const numero = to.replace(/[\s().-]/g, ''); // normalisation E.164 basique

    try {
      // ── À ADAPTER selon le fournisseur d'API WhatsApp ──────────────────────
      // Exemple générique compatible Meta Cloud API :
      //   body: { messaging_product: 'whatsapp', to, type: 'text', text: { body } }
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          from,
          to: numero,
          type: 'text',
          text: { body: corps },
        }),
      });
      const ok = res.ok;
      if (!ok) {
        const detail = await res.text().catch(() => '');
        this.logger.error(`Échec WhatsApp -> ${numero} : ${res.status} ${detail}`);
      } else {
        this.logger.log(`WhatsApp envoyé -> ${numero}`);
      }
      return ok;
    } catch (e) {
      this.logger.error(`Erreur d'envoi WhatsApp à ${numero} : ${(e as Error).message}`);
      return false;
    }
  }

  /**
   * Envoie les identifiants de connexion à un nouvel utilisateur par WhatsApp.
   * Même contrat que MailService.envoyerIdentifiants (retourne true si accepté).
   */
  async envoyerIdentifiants(params: {
    to: string;
    nomComplet: string;
    username: string;
    motDePasse: string;
    role: string;
  }): Promise<boolean> {
    const { to, nomComplet, username, motDePasse, role } = params;
    const corps =
      `Bienvenue sur BrightSchool\n\n` +
      `Bonjour ${nomComplet},\n\n` +
      `Votre compte ${role} a été créé sur la plateforme de gestion de l'école.\n\n` +
      `Identifiant : ${username}\n` +
      `Code d'accès provisoire : ${motDePasse}\n\n` +
      `Connectez-vous puis personnalisez votre code d'accès (rubrique « Changer mon mot de passe »).\n\n` +
      `BrightSchool — message automatique.`;
    return this.envoyerTexte(to, corps);
  }

  /** Envoi d'un message libre (pendant de MailService.envoyer). */
  async envoyer(params: { to: string; sujet: string; texte: string }): Promise<boolean> {
    const corps = `${params.sujet}\n\n${params.texte}`;
    return this.envoyerTexte(params.to, corps);
  }
}
