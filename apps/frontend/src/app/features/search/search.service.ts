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
   * @returns Observable de la réponse contenant les offres
   */
  scrapeOffers(query: string): Observable<ScrapeResponse> {
    return this.http.post<ScrapeResponse>(`${this.apiUrl}/offers/scrape`, {
      query,
    });
  }
}

