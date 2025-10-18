import { Injectable, Logger } from '@nestjs/common';
import { JobOffer } from '../../domain/entities/job-offer.entity';
import { HelloWorkAdapter } from '../../infrastructure/sources/hellowork.adapter';
import { FranceTravailAdapter } from '../../infrastructure/sources/france-travail.adapter';
import { ArbeitnowAdapter } from '../../infrastructure/sources/arbeitnow.adapter';
import { NormalizerService } from '../../infrastructure/services/normalizer.service';
import { ISourceAdapter } from '../../domain/ports/source-adapter.interface';

/**
 * Use Case : Scraper et normaliser les offres d'emploi depuis plusieurs sources.
 * 
 * Orchestration du flux :
 * 1. Scraper les offres depuis toutes les sources en parallèle
 * 2. Normaliser les données brutes vers le modèle pivot
 * 3. Retourner les offres normalisées agrégées
 * 
 * Note : Pour le MVP, on injecte directement les classes concrètes.
 * Post-MVP : Utiliser @Inject() avec des tokens pour respecter DIP.
 */
@Injectable()
export class ScrapeOffersUseCase {
  private readonly logger = new Logger(ScrapeOffersUseCase.name);
  private readonly adapters: ISourceAdapter[];

  constructor(
    private readonly helloWorkAdapter: HelloWorkAdapter,
    private readonly franceTravailAdapter: FranceTravailAdapter,
    private readonly arbeitnowAdapter: ArbeitnowAdapter,
    private readonly normalizer: NormalizerService
  ) {
    // Liste des adapters disponibles (3 sources)
    this.adapters = [
      this.helloWorkAdapter,
      this.franceTravailAdapter,
      this.arbeitnowAdapter,
    ];
  }

  /**
   * Exécute le scraping et la normalisation des offres depuis les sources sélectionnées.
   * Les sources sont interrogées en parallèle pour optimiser la performance.
   * 
   * @param query Termes de recherche
   * @param selectedSources Sources à interroger (optionnel, toutes par défaut)
   * @returns Liste des offres normalisées agrégées des sources sélectionnées
   * @throws {Error} En cas d'échec de tous les scrapers
   */
  async execute(query: string, selectedSources?: string[]): Promise<JobOffer[]> {
    this.logger.log(`🚀 Lancement du scraping multi-sources pour : "${query}"`);
    
    const startTime = Date.now();

    try {
      // Filtrer les adapters selon les sources sélectionnées
      const activeAdapters = selectedSources && selectedSources.length > 0
        ? this.adapters.filter(adapter => selectedSources.includes(adapter.name))
        : this.adapters;

      if (activeAdapters.length === 0) {
        this.logger.warn('⚠️ Aucune source sélectionnée ou valide');
        return [];
      }

      this.logger.log(`📡 Sources actives: ${activeAdapters.map(a => a.name).join(', ')}`);

      // Étape 1 : Scraper les sources actives en parallèle
      const scrapingPromises = activeAdapters.map(adapter => 
        adapter.scrape(query).catch(error => {
          const message = error instanceof Error ? error.message : 'Erreur inconnue';
          this.logger.warn(`⚠️ Échec du scraping ${adapter.name}: ${message}`);
          return []; // Retourner tableau vide en cas d'échec
        })
      );

      const results = await Promise.all(scrapingPromises);
      
      // Fusionner tous les résultats
      const allRawOffers = results.flat();
      const scrapeDuration = Date.now() - startTime;

      // Comptage par source
      results.forEach((offers, index) => {
        const adapter = this.adapters[index];
        this.logger.log(`📊 ${offers.length} offres de ${adapter.name}`);
      });

      this.logger.log(
        `📊 Total: ${allRawOffers.length} offres brutes extraites en ${scrapeDuration}ms`
      );

      if (allRawOffers.length === 0) {
        this.logger.warn('⚠️ Aucune offre trouvée sur aucune source');
        return [];
      }

      // Étape 2 : Normaliser les offres
      const normalizedOffers: JobOffer[] = [];
      let failedCount = 0;

      for (const rawOffer of allRawOffers) {
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

