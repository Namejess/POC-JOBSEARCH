/**
 * Représente les données brutes extraites d'une source de job board.
 * Ces données seront normalisées vers l'entité JobOffer.
 */
export interface RawJobOffer {
  title: string;
  company: string;
  location: string;
  publishedAt: string | Date;
  url: string;
  description: string;
  contractType?: string;
  salary?: string;
  [key: string]: unknown;
}

