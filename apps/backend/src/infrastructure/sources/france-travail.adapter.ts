import { Injectable, Logger } from '@nestjs/common';
import { ISourceAdapter } from '../../domain/ports/source-adapter.interface';
import { RawJobOffer } from '../../domain/entities/raw-job-offer.type';
import { ConfigService } from '@nestjs/config';

/**
 * Adapter pour l'API France Travail (ex Pôle Emploi).
 * Utilise l'API officielle publique de France Travail.
 * 
 * Documentation : https://www.emploi-store-dev.fr/portail-developpeur
 */
@Injectable()
export class FranceTravailAdapter implements ISourceAdapter {
  readonly name = 'France Travail';
  private readonly logger = new Logger(FranceTravailAdapter.name);
  private readonly baseUrl = 'https://api.francetravail.io/partenaire/offresdemploi/v2';
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor(private readonly config: ConfigService) {}

  /**
   * Récupère un token d'authentification auprès de l'API France Travail.
   */
  private async authenticate(): Promise<string> {
    // Si le token est encore valide, le réutiliser
    if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.accessToken;
    }

    const clientId = this.config.get<string>('FRANCE_TRAVAIL_CLIENT_ID');
    const clientSecret = this.config.get<string>('FRANCE_TRAVAIL_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      this.logger.warn('❌ Identifiants France Travail non configurés. Scraping ignoré.');
      throw new Error('Identifiants France Travail non configurés');
    }

    try {
      this.logger.log('🔐 Authentification France Travail...');
      
      const authUrl = 'https://entreprise.francetravail.fr/connexion/oauth2/access_token';
      const params = new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
        scope: 'api_offresdeploiv2 o2dsoffre',
      });

      const response = await fetch(`${authUrl}?${params.toString()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur auth: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as { access_token: string; expires_in: number };
      this.accessToken = data.access_token;
      
      // Le token expire dans X secondes, on le garde valide jusqu'à 90% de sa durée
      const expiryMs = (data.expires_in * 0.9) * 1000;
      this.tokenExpiry = new Date(Date.now() + expiryMs);

      this.logger.log('✅ Authentification réussie');
      return this.accessToken;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      this.logger.error(`❌ Erreur d'authentification France Travail: ${message}`);
      throw new Error(`Échec auth France Travail: ${message}`);
    }
  }

  /**
   * Recherche des offres d'emploi via l'API France Travail.
   * 
   * @param query Terme de recherche
   * @returns Liste d'offres brutes
   */
  async scrape(query: string): Promise<RawJobOffer[]> {
    this.logger.log(`🔍 Début du scraping France Travail pour : "${query}"`);

    try {
      const token = await this.authenticate();

      // Construire les paramètres de recherche
      const searchParams = new URLSearchParams({
        motsCles: query,
        range: '0-149', // Max 150 résultats par requête
        sort: '1', // Tri par date de publication (1 = décroissant)
      });

      const apiUrl = `${this.baseUrl}/offres/search?${searchParams.toString()}`;

      this.logger.log(`🌐 Appel API : ${apiUrl}`);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as { resultats: FranceTravailOffer[] };
      const offers = data.resultats || [];

      this.logger.log(`📦 ${offers.length} offres reçues de l'API France Travail`);

      // Convertir vers le format RawJobOffer
      const rawOffers = offers
        .map(offer => this.transformOffer(offer))
        .filter((offer): offer is RawJobOffer => offer !== null);

      this.logger.log(`✅ Scraping terminé : ${rawOffers.length} offres collectées`);
      return rawOffers;

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      this.logger.error(`❌ Erreur lors du scraping France Travail : ${message}`);
      throw new Error(`Échec du scraping France Travail : ${message}`);
    }
  }

  /**
   * Transforme une offre France Travail vers le format RawJobOffer.
   */
  private transformOffer(offer: FranceTravailOffer): RawJobOffer | null {
    try {
      // Validation minimale
      if (!offer.intitule || !offer.entreprise) {
        return null;
      }

      return {
        title: offer.intitule,
        company: offer.entreprise?.nom || 'Entreprise confidentielle',
        location: this.formatLocation(offer.lieuTravail),
        publishedAt: offer.dateCreation || new Date().toISOString(),
        url: offer.origineOffre?.urlOrigine || `https://candidat.francetravail.fr/offres/recherche/detail/${offer.id}`,
        description: offer.description || '',
        source: 'France Travail',
        contractType: this.mapContractType(offer.typeContrat),
        salary: offer.salaire?.libelle,
      };
    } catch (error) {
      this.logger.warn(`❌ Erreur transformation offre: ${error}`);
      return null;
    }
  }

  /**
   * Formate le lieu de travail.
   */
  private formatLocation(lieu?: FranceTravailLocation): string {
    if (!lieu) return 'France';
    
    const parts: string[] = [];
    if (lieu.libelle) parts.push(lieu.libelle);
    if (lieu.codePostal) parts.push(lieu.codePostal);
    
    return parts.join(' - ') || 'France';
  }

  /**
   * Convertit le code de type de contrat France Travail vers un libellé standard.
   */
  private mapContractType(code?: string): string | undefined {
    const mapping: Record<string, string> = {
      'CDI': 'CDI',
      'CDD': 'CDD',
      'MIS': 'Intérim',
      'SAI': 'CDD',
      'CCE': 'CDD',
      'FRA': 'Freelance',
      'LIB': 'Freelance',
      'REP': 'Alternance',
      'DIND': 'Freelance',
    };

    return code ? mapping[code] : undefined;
  }
}

/**
 * Types pour l'API France Travail
 */
interface FranceTravailOffer {
  id: string;
  intitule: string;
  description?: string;
  dateCreation?: string;
  entreprise?: {
    nom?: string;
  };
  lieuTravail?: FranceTravailLocation;
  typeContrat?: string;
  salaire?: {
    libelle?: string;
  };
  origineOffre?: {
    urlOrigine?: string;
  };
}

interface FranceTravailLocation {
  libelle?: string;
  codePostal?: string;
  commune?: string;
}

