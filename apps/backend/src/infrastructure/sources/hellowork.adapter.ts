import { Injectable, Logger } from '@nestjs/common';
import { PlaywrightCrawler } from 'crawlee';
import { RawJobOffer } from '../../domain/entities/raw-job-offer.type';
import { ISourceAdapter } from '../../domain/ports/source-adapter.interface';

/**
 * Adapter pour scraper les offres d'emploi depuis HelloWork.
 * Utilise Crawlee avec Playwright (navigateur headless) pour gérer le JavaScript.
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
    requestHandlerTimeoutSecs: 90,
    headless: true, // Mode headless pour Playwright
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
      const crawler = new PlaywrightCrawler({
        maxConcurrency: this.config.maxConcurrency,
        maxRequestsPerMinute: this.config.maxRequestsPerMinute,
        requestHandlerTimeoutSecs: this.config.requestHandlerTimeoutSecs,
        
        // Configuration du navigateur Playwright
        launchContext: {
          launchOptions: {
            headless: this.config.headless,
          },
        },
        
        // Configuration du User-Agent
        requestHandler: async ({ request, page, log }) => {
          log.info(`🌐 Scraping de ${request.url}`);

          // Attendre que la page soit complètement chargée
          await page.waitForLoadState('networkidle');
          this.logger.log('⏳ Page chargée, attente des offres...');
          
          // Attendre que les offres apparaissent (max 10 secondes)
          try {
            await page.waitForSelector('li', { timeout: 10000 });
            this.logger.log('✅ Éléments <li> détectés sur la page');
          } catch (error) {
            this.logger.warn('⚠️ Timeout en attendant les éléments <li>');
          }

          // Obtenir le contenu HTML après exécution du JavaScript
          const html = await page.content();
          this.logger.debug(`📄 Longueur HTML reçue: ${html.length} caractères`);

          // Chercher directement les liens d'offres avec data-cy="offerTitle" ou href contenant "/emplois/"
          const offerLinks = await page.$$('a[data-cy="offerTitle"], a[href*="/emplois/"]');
          this.logger.log(`🔍 ${offerLinks.length} liens d'offres trouvés`);

          // Extraire chaque offre à partir du lien
          let extractedCount = 0;
          for (const linkElement of offerLinks) {
            try {
              // Remonter au parent <li> qui contient toutes les infos
              const parentLi = await linkElement.evaluateHandle((el: any) => el.closest('li'));
              if (parentLi) {
                const rawOffer = await this.extractOfferFromElement(parentLi as any);
                if (rawOffer) {
                  offers.push(rawOffer);
                  extractedCount++;
                }
              }
            } catch (error) {
              log.error(`Erreur lors de l'extraction d'une offre : ${error}`);
            }
          }

          this.logger.log(`✅ ${extractedCount} offres extraites sur ${offerLinks.length} liens trouvés`);
          
          // DEBUG: Sauvegarder le HTML si aucune offre trouvée
          if (extractedCount === 0) {
            const fs = require('fs');
            const debugPath = './debug-hellowork.html';
            fs.writeFileSync(debugPath, html);
            this.logger.warn(`🔍 HTML sauvegardé dans ${debugPath} pour analyse`);
          }
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
    // Format URL HelloWork correct (vérifié 2025-10-18)
    const encodedQuery = encodeURIComponent(query);
    return `https://www.hellowork.com/fr-fr/emploi/recherche.html?k=${encodedQuery}&k_autocomplete=&l=&l_autocomplete=`;
  }

  /**
   * Extrait les données d'une offre depuis un élément Playwright.
   * 
   * @param element ElementHandle Playwright
   * @returns Offre brute ou null si extraction impossible
   */
  private async extractOfferFromElement(element: any): Promise<RawJobOffer | null> {
    try {
      // Récupérer tout le texte de l'élément
      const fullText = await element.textContent();
      if (!fullText) return null;

      // Le texte contient toutes les infos séparées par des espaces/retours à la ligne
      // Exemple: "Développeur H/F Thermocompact Epagny Metz-Tessy - 74 CDI Voir l'offre il y a 2 jours"
      
      // Extraire le lien href de l'offre (chercher le lien principal avec data-cy ou vers /emplois/)
      const linkElement = await element.$('a[data-cy="offerTitle"]') || await element.$('a[href*="/emplois/"]');
      const url = linkElement ? await linkElement.getAttribute('href') : '';
      
      // Construire l'URL complète
      let fullUrl = '';
      if (url) {
        if (url.startsWith('http')) {
          fullUrl = url;
        } else if (url.startsWith('/')) {
          fullUrl = `https://www.hellowork.com${url}`;
        } else {
          fullUrl = `https://www.hellowork.com/${url}`;
        }
      }

      // Parser le texte pour extraire les infos
      const lines = fullText.split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 0);
      
      // Le titre est souvent en premier (ligne avec "H/F" ou premier élément long)
      let title = '';
      let company = '';
      let location = '';
      let contractType = '';
      let salary = '';
      
      for (const line of lines) {
        // Détection du titre (contient souvent H/F ou Développeur/Développeuse)
        if (!title && (line.includes('H/F') || line.includes('Développeur') || line.includes('Développeuse'))) {
          title = line.replace(/recrutement$/, '').trim();
        }
        // Détection du type de contrat
        else if (!contractType && (line === 'CDI' || line === 'CDD' || line === 'Stage' || line === 'Alternance' || line === 'Intérim')) {
          contractType = line;
        }
        // Détection du lieu (contient un code département avec tiret)
        else if (!location && /- \d{1,3}[AB]?$/.test(line)) {
          location = line;
        }
        // Détection du salaire (contient € ou EUR)
        else if (!salary && (line.includes('€') || line.includes('EUR') || /\d+ 000/.test(line))) {
          salary = line;
        }
        // Si le titre n'a pas encore été trouvé et que la ligne ne match rien d'autre
        else if (!title && line.length > 10 && !line.includes('Super recruteur') && !line.includes('Voir l\'offre')) {
          title = line;
        }
        // L'entreprise est souvent la ligne après le titre
        else if (title && !company && line.length > 2 && !line.includes('recrutement') && line !== contractType && line !== location) {
          company = line.replace(/recrutement$/, '').trim();
        }
      }

      // Validation minimale
      if (!title || title.includes('Voir l\'offre') || title.includes('Super recruteur')) {
        return null;
      }

      const offer: RawJobOffer = {
        title: title || 'Titre non disponible',
        company: company || 'Entreprise non spécifiée',
        location: location || 'Non spécifié',
        publishedAt: new Date().toISOString(),
        url: fullUrl,
        description: fullText.substring(0, 500), // Premiers 500 caractères comme description
        source: 'HelloWork',
        contractType: contractType || undefined,
        salary: salary || undefined,
      };

      this.logger.debug(`✅ Offre: ${offer.title} | ${offer.company} | ${offer.location}`);
      return offer;

    } catch (error) {
      this.logger.warn(`❌ Erreur extraction: ${error}`);
      return null;
    }
  }
}

