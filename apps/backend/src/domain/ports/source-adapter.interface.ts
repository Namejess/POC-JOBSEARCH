import { RawJobOffer } from '../entities/raw-job-offer.type';

/**
 * Port définissant le contrat pour les adapters de sources de job boards.
 * Chaque source (HelloWork, Apec, Indeed, etc.) implémentera cette interface.
 */
export interface ISourceAdapter {
  /**
   * Nom de la source (ex: "HelloWork", "Apec")
   */
  readonly name: string;

  /**
   * Exécute le scraping pour une requête de recherche donnée.
   * 
   * @param query Termes de recherche (métier, mots-clés)
   * @returns Liste des offres brutes extraites
   * @throws {Error} En cas d'échec du scraping ou de blocage
   */
  scrape(query: string): Promise<RawJobOffer[]>;
}

