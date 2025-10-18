import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { JobOffer } from '../../domain/entities/job-offer.entity';

/**
 * Service d'envoi d'emails.
 * Utilise nodemailer pour envoyer des emails formatés.
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly config: ConfigService) {
    this.initializeTransporter();
  }

  /**
   * Initialise le transporteur SMTP
   */
  private initializeTransporter() {
    const host = this.config.get<string>('SMTP_HOST');
    const port = this.config.get<number>('SMTP_PORT');
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');

    if (!host || !port || !user || !pass) {
      this.logger.warn('⚠️ Configuration SMTP manquante. Envoi d\'emails désactivé.');
      return;
    }

    this.transporter = nodemailer.createTransporter({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });

    this.logger.log('✅ Service email initialisé');
  }

  /**
   * Envoie un email avec la liste des offres d'emploi.
   * 
   * @param to Adresse email destinataire
   * @param query Termes de recherche
   * @param offers Liste des offres à envoyer
   */
  async sendOffersEmail(to: string, query: string, offers: JobOffer[]): Promise<void> {
    if (!this.transporter) {
      throw new Error('Service email non configuré. Veuillez configurer les variables SMTP dans .env');
    }

    try {
      const html = this.generateEmailHtml(query, offers);
      const text = this.generateEmailText(query, offers);

      await this.transporter.sendMail({
        from: this.config.get<string>('SMTP_FROM') || this.config.get<string>('SMTP_USER'),
        to,
        subject: `Résultats de recherche : "${query}" (${offers.length} offres)`,
        text,
        html,
      });

      this.logger.log(`📧 Email envoyé avec succès à ${to} (${offers.length} offres)`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      this.logger.error(`❌ Échec d'envoi email : ${message}`);
      throw new Error(`Échec d'envoi de l'email : ${message}`);
    }
  }

  /**
   * Génère le contenu HTML de l'email
   */
  private generateEmailHtml(query: string, offers: JobOffer[]): string {
    const offersHtml = offers.map(offer => `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 16px; vertical-align: top;">
          <strong style="color: #1f2937; font-size: 16px;">${this.escapeHtml(offer.title)}</strong><br/>
          <span style="color: #6b7280; font-size: 14px;">${this.escapeHtml(offer.company)}</span><br/>
          <span style="color: #9ca3af; font-size: 12px;">${this.escapeHtml(offer.location)}</span>
        </td>
        <td style="padding: 16px;">
          ${offer.contractType ? `<span style="background: #3b82f6; color: white; padding: 4px 12px; border-radius: 9999px; font-size: 12px;">${this.escapeHtml(offer.contractType)}</span>` : '-'}
        </td>
        <td style="padding: 16px;">
          ${this.formatSalaryHtml(offer.salary)}
        </td>
        <td style="padding: 16px;">
          <span style="background: #e5e7eb; color: #374151; padding: 4px 12px; border-radius: 9999px; font-size: 11px;">${this.escapeHtml(offer.source)}</span>
        </td>
        <td style="padding: 16px;">
          <a href="${this.escapeHtml(offer.canonicalUrl)}" style="background: #3b82f6; color: white; padding: 8px 16px; border-radius: 8px; text-decoration: none; font-size: 14px;">Voir l'offre</a>
        </td>
      </tr>
    `).join('');

    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Résultats de recherche : ${this.escapeHtml(query)}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 20px;">
  <div style="max-width: 900px; margin: 0 auto; background-color: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <!-- En-tête -->
    <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 32px 24px; border-radius: 8px 8px 0 0;">
      <h1 style="margin: 0 0 8px 0; font-size: 28px;">🔍 Résultats de recherche</h1>
      <p style="margin: 0; font-size: 16px; opacity: 0.9;">Recherche : "${this.escapeHtml(query)}"</p>
      <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.8;">${offers.length} offre(s) trouvée(s)</p>
    </div>

    <!-- Contenu -->
    <div style="padding: 24px;">
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #f9fafb; border-bottom: 2px solid #e5e7eb;">
            <th style="padding: 12px 16px; text-align: left; color: #6b7280; font-size: 12px; text-transform: uppercase; font-weight: 600;">Poste</th>
            <th style="padding: 12px 16px; text-align: left; color: #6b7280; font-size: 12px; text-transform: uppercase; font-weight: 600;">Contrat</th>
            <th style="padding: 12px 16px; text-align: left; color: #6b7280; font-size: 12px; text-transform: uppercase; font-weight: 600;">Salaire</th>
            <th style="padding: 12px 16px; text-align: left; color: #6b7280; font-size: 12px; text-transform: uppercase; font-weight: 600;">Source</th>
            <th style="padding: 12px 16px; text-align: left; color: #6b7280; font-size: 12px; text-transform: uppercase; font-weight: 600;">Action</th>
          </tr>
        </thead>
        <tbody>
          ${offersHtml}
        </tbody>
      </table>
    </div>

    <!-- Pied de page -->
    <div style="background-color: #f9fafb; padding: 20px 24px; border-top: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
      <p style="margin: 0; color: #6b7280; font-size: 12px; text-align: center;">
        Cet email a été généré automatiquement par l'agrégateur d'offres d'emploi<br/>
        Sources : HelloWork, France Travail, Arbeitnow
      </p>
    </div>
  </div>
</body>
</html>
    `;
  }

  /**
   * Génère le contenu texte brut de l'email
   */
  private generateEmailText(query: string, offers: JobOffer[]): string {
    const offersText = offers.map((offer, index) => `
${index + 1}. ${offer.title}
   Entreprise: ${offer.company}
   Localisation: ${offer.location}
   Contrat: ${offer.contractType || 'Non spécifié'}
   Salaire: ${this.formatSalaryText(offer.salary)}
   Source: ${offer.source}
   Lien: ${offer.canonicalUrl}
    `).join('\n---\n');

    return `
Résultats de recherche : "${query}"
${offers.length} offre(s) trouvée(s)

${offersText}

---
Cet email a été généré automatiquement par l'agrégateur d'offres d'emploi.
Sources : HelloWork, France Travail, Arbeitnow
    `;
  }

  /**
   * Formate le salaire pour l'affichage HTML
   */
  private formatSalaryHtml(salary?: { min?: number; max?: number; currency?: string }): string {
    if (!salary) return '<span style="color: #9ca3af;">Non précisé</span>';
    
    const currency = salary.currency === 'EUR' ? '€' : (salary.currency || '€');
    
    if (salary.min && salary.max) {
      return `<span style="color: #374151;">${Math.round(salary.min / 1000)}K - ${Math.round(salary.max / 1000)}K ${currency}</span>`;
    }
    if (salary.min) {
      return `<span style="color: #374151;">${Math.round(salary.min / 1000)}K ${currency}</span>`;
    }
    return '<span style="color: #9ca3af;">Non précisé</span>';
  }

  /**
   * Formate le salaire pour l'affichage texte
   */
  private formatSalaryText(salary?: { min?: number; max?: number; currency?: string }): string {
    if (!salary) return 'Non précisé';
    
    const currency = salary.currency === 'EUR' ? '€' : (salary.currency || '€');
    
    if (salary.min && salary.max) {
      return `${Math.round(salary.min / 1000)}K - ${Math.round(salary.max / 1000)}K ${currency}`;
    }
    if (salary.min) {
      return `${Math.round(salary.min / 1000)}K ${currency}`;
    }
    return 'Non précisé';
  }

  /**
   * Échappe les caractères HTML pour éviter les injections
   */
  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }
}

