import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ScrapeResponse } from '../../domain/job-offer.interface';

/**
 * Service pour interagir avec l'API de scraping d'offres d'emploi.
 */
@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  /**
   * Lance le scraping et la recherche d'offres pour une requête donnée.
   *
   * @param query Termes de recherche
   * @param sources Sources à interroger (optionnel)
   * @returns Observable de la réponse contenant les offres
   */
  scrapeOffers(query: string, sources?: string[]): Observable<ScrapeResponse> {
    return this.http.post<ScrapeResponse>(`${this.apiUrl}/offers/scrape`, {
      query,
      sources,
    });
  }

  /**
   * Envoie les offres par email.
   *
   * @param email Adresse email destinataire
   * @param query Termes de recherche
   * @param offers Liste des offres à envoyer
   * @returns Observable de la réponse de confirmation
   */
  exportEmail(email: string, query: string, offers: any[]): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}/offers/export-email`, {
      email,
      query,
      offers,
    });
  }
}

