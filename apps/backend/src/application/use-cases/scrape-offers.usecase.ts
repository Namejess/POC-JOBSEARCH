import { Injectable, Logger } from '@nestjs/common';
import { JobOffer } from '../../domain/entities/job-offer.entity';
import { ISourceAdapter } from '../../domain/ports/source-adapter.interface';
import { INormalizer } from '../../domain/ports/normalizer.interface';

/**
 * Use Case : Scraper et normaliser les offres d'emploi.
 * 
 * Orchestration du flux :
 * 1. Scraper les offres depuis la source (HelloWork)
 * 2. Normaliser les données brutes vers le modèle pivot
 * 3. Retourner les offres normalisées
 */
@Injectable()
export class ScrapeOffersUseCase {
  private readonly logger = new Logger(ScrapeOffersUseCase.name);

  constructor(
    private readonly sourceAdapter: ISourceAdapter,
    private readonly normalizer: INormalizer
  ) {}

  /**
   * Exécute le scraping et la normalisation des offres.
   * 
   * @param query Termes de recherche
   * @returns Liste des offres normalisées
   * @throws {Error} En cas d'échec du scraping ou de normalisation
   */
  async execute(query: string): Promise<JobOffer[]> {
    this.logger.log(`🚀 Lancement du scraping pour : "${query}"`);
    
    try {
      // Étape 1 : Scraper les offres brutes
      const startTime = Date.now();
      const rawOffers = await this.sourceAdapter.scrape(query);
      const scrapeDuration = Date.now() - startTime;
      
      this.logger.log(
        `📊 ${rawOffers.length} offres brutes extraites en ${scrapeDuration}ms depuis ${this.sourceAdapter.name}`
      );

      if (rawOffers.length === 0) {
        this.logger.warn('⚠️ Aucune offre trouvée pour cette recherche');
        return [];
      }

      // Étape 2 : Normaliser les offres
      const normalizedOffers: JobOffer[] = [];
      let failedCount = 0;

      for (const rawOffer of rawOffers) {
        try {
          const normalized = this.normalizer.toPivot(rawOffer);
          normalizedOffers.push(normalized);
        } catch (error) {
          failedCount++;
          const message = error instanceof Error ? error.message : 'Erreur inconnue';
          this.logger.warn(`Échec de normalisation d'une offre : ${message}`);
        }
      }

      this.logger.log(
        `✅ ${normalizedOffers.length} offres normalisées avec succès` +
        (failedCount > 0 ? ` (${failedCount} échecs)` : '')
      );

      return normalizedOffers;

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      this.logger.error(`❌ Erreur lors de l'exécution du use case : ${message}`);
      throw new Error(`Échec du scraping : ${message}`);
    }
  }
}

