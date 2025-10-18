import { JobOffer } from '../entities/job-offer.entity';
import { RawJobOffer } from '../entities/raw-job-offer.type';

/**
 * Port définissant le contrat pour la normalisation des données brutes.
 * Transforme les données non structurées des sources vers le modèle pivot.
 */
export interface INormalizer {
  /**
   * Normalise une offre brute vers le schéma pivot JobOffer.
   * 
   * @param raw Offre brute extraite de la source
   * @returns Offre normalisée selon le modèle domaine
   */
  toPivot(raw: RawJobOffer): JobOffer;
}

