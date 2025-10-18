/**
 * Interface représentant une offre d'emploi côté frontend.
 * Correspond au modèle retourné par l'API backend.
 */
export interface JobOffer {
  id: string;
  title: string;
  company: string;
  location: string;
  publishedAt: string;
  canonicalUrl: string;
  description: string;
  contractType?: string;
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  skills?: string[];
}

/**
 * Réponse de l'API de scraping.
 */
export interface ScrapeResponse {
  success: boolean;
  query: string;
  count: number;
  offers: JobOffer[];
}

