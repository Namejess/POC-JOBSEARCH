import { Injectable, Logger } from '@nestjs/common';
import { CheerioCrawler } from 'crawlee';
import { RawJobOffer } from '../../domain/entities/raw-job-offer.type';
import { ISourceAdapter } from '../../domain/ports/source-adapter.interface';

/**
 * Adapter pour scraper les offres d'emploi depuis HelloWork.
 * Utilise Crawlee avec Cheerio pour le parsing HTML.
 * 
 * ⚠️ Attention : Le scraping doit respecter les CGU de HelloWork et robots.txt.
 * User-Agent identifié et throttling configuré pour éviter le blocage.
 */
@Injectable()
export class HelloWorkAdapter implements ISourceAdapter {
  private readonly logger = new Logger(HelloWorkAdapter.name);
  readonly name = 'HelloWork';

  // Configuration du scraping responsable
  private readonly config = {
    userAgent: 'JobSearchMVP/1.0 (+contact@example.com)',
    maxConcurrency: 1,
    maxRequestsPerMinute: 20,
    requestHandlerTimeoutSecs: 60,
  };

  /**
   * Exécute le scraping HelloWork pour une requête de recherche.
   * 
   * @param query Termes de recherche (métier, mots-clés)
   * @returns Liste des offres brutes extraites
   */
  async scrape(query: string): Promise<RawJobOffer[]> {
    this.logger.log(`🔍 Début du scraping HelloWork pour : "${query}"`);
    
    const offers: RawJobOffer[] = [];
    const searchUrl = this.buildSearchUrl(query);

    try {
      const crawler = new CheerioCrawler({
        maxConcurrency: this.config.maxConcurrency,
        maxRequestsPerMinute: this.config.maxRequestsPerMinute,
        requestHandlerTimeoutSecs: this.config.requestHandlerTimeoutSecs,
        
        // Configuration du User-Agent
        requestHandler: async ({ request, $, log }) => {
          log.info(`🌐 Scraping de ${request.url}`);

          // Sélecteurs CSS pour extraire les offres
          // ⚠️ Ces sélecteurs sont à ajuster selon la structure réelle de HelloWork
          const jobCards = $('[data-testid="job-card"], .job-card, article.offer').toArray();
          
          if (jobCards.length === 0) {
            log.warning('⚠️ Aucune offre trouvée avec les sélecteurs actuels');
            this.logger.warn('Aucune offre trouvée. Les sélecteurs CSS doivent peut-être être mis à jour.');
          }

          for (const card of jobCards) {
            try {
              const rawOffer = this.extractOfferFromCard($, card);
              if (rawOffer) {
                offers.push(rawOffer);
              }
            } catch (error) {
              log.error(`Erreur lors de l'extraction d'une offre : ${error}`);
            }
          }

          log.info(`✅ ${jobCards.length} offres extraites de cette page`);
        },

        failedRequestHandler: async ({ request }, error) => {
          this.logger.error(`❌ Échec de la requête ${request.url}: ${error.message}`);
        },
      });

      // Lancer le crawler
      await crawler.run([searchUrl]);

      this.logger.log(`✅ Scraping terminé : ${offers.length} offres collectées`);
      return offers;

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      this.logger.error(`❌ Erreur lors du scraping HelloWork : ${message}`);
      throw new Error(`Échec du scraping HelloWork : ${message}`);
    }
  }

  /**
   * Construit l'URL de recherche HelloWork depuis une query.
   * 
   * @param query Termes de recherche
   * @returns URL complète pour la recherche
   */
  private buildSearchUrl(query: string): string {
    // Format URL HelloWork : https://www.hellowork.com/fr-fr/emplois.html?k=<query>
    const encodedQuery = encodeURIComponent(query);
    return `https://www.hellowork.com/fr-fr/emplois.html?k=${encodedQuery}`;
  }

  /**
   * Extrait les données d'une offre depuis une carte/article HTML.
   * 
   * ⚠️ Sélecteurs à adapter selon la structure réelle de HelloWork.
   * 
   * @param $ Instance Cheerio
   * @param card Élément DOM de la carte d'offre
   * @returns Offre brute ou null si extraction impossible
   */
  private extractOfferFromCard($: any, card: any): RawJobOffer | null {
    try {
      const $card = $(card);

      // Sélecteurs à adapter selon la structure réelle du site
      const title = $card.find('[data-testid="job-title"], .job-title, h2, h3').first().text().trim();
      const company = $card.find('[data-testid="company-name"], .company-name, .company').first().text().trim();
      const location = $card.find('[data-testid="job-location"], .location, .city').first().text().trim();
      const contractType = $card.find('[data-testid="contract-type"], .contract-type, .type').first().text().trim();
      const salary = $card.find('[data-testid="salary"], .salary, .salaire').first().text().trim();
      const description = $card.find('[data-testid="job-description"], .description, p').first().text().trim();
      
      // URL de l'offre
      const relativeUrl = $card.find('a[href]').first().attr('href');
      const url = relativeUrl
        ? (relativeUrl.startsWith('http') ? relativeUrl : `https://www.hellowork.com${relativeUrl}`)
        : '';

      // Validation : titre et entreprise sont obligatoires
      if (!title || !company) {
        this.logger.debug('Offre ignorée : titre ou entreprise manquant');
        return null;
      }

      // Date de publication (par défaut : aujourd'hui)
      const publishedAt = new Date().toISOString();

      return {
        title,
        company,
        location: location || 'Non spécifié',
        publishedAt,
        url,
        description: description || 'Aucune description disponible',
        contractType: contractType || undefined,
        salary: salary || undefined,
      };

    } catch (error) {
      this.logger.warn(`Erreur lors de l'extraction d'une carte : ${error}`);
      return null;
    }
  }
}

