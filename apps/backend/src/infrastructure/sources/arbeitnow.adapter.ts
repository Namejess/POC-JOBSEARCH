import { Injectable, Logger } from '@nestjs/common';
import { ISourceAdapter } from '../../domain/ports/source-adapter.interface';
import { RawJobOffer } from '../../domain/entities/raw-job-offer.type';

/**
 * Adapter pour l'API Arbeitnow.
 * API gratuite sans authentification pour les jobs en Europe.
 * 
 * Documentation : https://arbeitnow.com/api/job-board-api
 * 
 * Avantages :
 * - Gratuit et sans clé API
 * - Focus sur les jobs tech en Europe
 * - Support remote jobs
 */
@Injectable()
export class ArbeitnowAdapter implements ISourceAdapter {
  readonly name = 'Arbeitnow';
  private readonly logger = new Logger(ArbeitnowAdapter.name);
  private readonly baseUrl = 'https://www.arbeitnow.com/api/job-board-api';

  /**
   * Recherche des offres d'emploi via l'API Arbeitnow.
   * 
   * @param query Terme de recherche
   * @returns Liste d'offres brutes
   */
  async scrape(query: string): Promise<RawJobOffer[]> {
    this.logger.log(`🔍 Début du scraping Arbeitnow pour : "${query}"`);

    try {
      // Construire l'URL de recherche
      const searchUrl = `${this.baseUrl}?search=${encodeURIComponent(query)}&page=1`;

      this.logger.log(`🌐 Appel API : ${searchUrl}`);

      const response = await fetch(searchUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'JobSearchMVP/1.0',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as ArbeitnowResponse;
      const offers = data.data || [];

      this.logger.log(`📦 ${offers.length} offres reçues de l'API Arbeitnow`);

      // Convertir vers le format RawJobOffer
      const rawOffers = offers
        .map(offer => this.transformOffer(offer))
        .filter((offer): offer is RawJobOffer => offer !== null);

      this.logger.log(`✅ Scraping terminé : ${rawOffers.length} offres collectées`);
      return rawOffers;

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      this.logger.error(`❌ Erreur lors du scraping Arbeitnow : ${message}`);
      // Ne pas throw pour permettre aux autres sources de fonctionner
      return [];
    }
  }

  /**
   * Transforme une offre Arbeitnow vers le format RawJobOffer.
   */
  private transformOffer(offer: ArbeitnowJob): RawJobOffer | null {
    try {
      // Validation minimale
      if (!offer.title || !offer.company_name) {
        return null;
      }

      // Construire la description depuis les tags et description
      const tags = offer.tags?.join(', ') || '';
      const description = offer.description
        ? `${offer.description.substring(0, 400)}... Tags: ${tags}`
        : `Tags: ${tags}`;

      return {
        title: offer.title,
        company: offer.company_name,
        location: this.formatLocation(offer.location, offer.remote),
        publishedAt: offer.created_at || new Date().toISOString(),
        url: offer.url,
        description: description,
        source: 'Arbeitnow',
        contractType: this.mapJobType(offer.job_types),
        salary: undefined, // Arbeitnow n'expose pas les salaires dans l'API
      };
    } catch (error) {
      this.logger.warn(`❌ Erreur transformation offre: ${error}`);
      return null;
    }
  }

  /**
   * Formate le lieu de travail en tenant compte du remote.
   */
  private formatLocation(location?: string, remote?: boolean): string {
    if (remote) {
      return location ? `${location} (Remote)` : 'Remote';
    }
    return location || 'Europe';
  }

  /**
   * Convertit les types de jobs Arbeitnow vers un libellé standard.
   */
  private mapJobType(jobTypes?: string[]): string | undefined {
    if (!jobTypes || jobTypes.length === 0) {
      return undefined;
    }

    const firstType = jobTypes[0].toLowerCase();

    const mapping: Record<string, string> = {
      'full-time': 'CDI',
      'fulltime': 'CDI',
      'permanent': 'CDI',
      'part-time': 'Temps partiel',
      'parttime': 'Temps partiel',
      'contract': 'CDD',
      'freelance': 'Freelance',
      'internship': 'Stage',
      'apprenticeship': 'Alternance',
      'temporary': 'Intérim',
    };

    for (const [key, value] of Object.entries(mapping)) {
      if (firstType.includes(key)) {
        return value;
      }
    }

    // Retourner le type original si non reconnu
    return jobTypes[0];
  }
}

/**
 * Types pour l'API Arbeitnow
 */
interface ArbeitnowResponse {
  data: ArbeitnowJob[];
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
}

interface ArbeitnowJob {
  slug: string;
  company_name: string;
  title: string;
  description: string;
  remote: boolean;
  url: string;
  tags: string[];
  job_types: string[];
  location: string;
  created_at: string;
}

