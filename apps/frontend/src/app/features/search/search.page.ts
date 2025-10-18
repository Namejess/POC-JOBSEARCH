import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SearchService } from './search.service';
import { OfferListComponent } from './components/offer-list.component';
import { JobOffer } from '../../domain/job-offer.interface';

/**
 * Page principale de recherche d'offres d'emploi.
 * Container component qui gère l'état et la logique métier.
 */
@Component({
  selector: 'app-search-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, OfferListComponent],
  template: `
    <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-5xl mx-auto">
        <!-- En-tête -->
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">
            🔍 Job Search MVP
          </h1>
          <p class="text-lg text-gray-600">
            Recherche centralisée d'offres d'emploi depuis HelloWork
          </p>
        </div>

        <!-- Formulaire de recherche -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-8">
          <form [formGroup]="searchForm" (ngSubmit)="onSearch()">
            <div class="flex gap-4">
              <div class="flex-1">
                <label
                  for="query"
                  class="block text-sm font-medium text-gray-700 mb-2"
                >
                  Rechercher une offre
                </label>
                <input
                  type="text"
                  id="query"
                  formControlName="query"
                  placeholder="Ex: développeur typescript paris"
                  class="input-field"
                  [class.border-red-500]="
                    searchForm.get('query')?.invalid &&
                    searchForm.get('query')?.touched
                  "
                />
                <p
                  *ngIf="
                    searchForm.get('query')?.invalid &&
                    searchForm.get('query')?.touched
                  "
                  class="mt-1 text-sm text-red-600"
                >
                  Veuillez entrer au moins 2 caractères
                </p>
              </div>
              <div class="flex items-end">
                <button
                  type="submit"
                  [disabled]="searchForm.invalid || isLoading()"
                  class="btn-primary flex items-center gap-2"
                >
                  <svg
                    *ngIf="!isLoading()"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <svg
                    *ngIf="isLoading()"
                    class="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {{ isLoading() ? 'Recherche...' : 'Rechercher' }}
                </button>
              </div>
            </div>
          </form>
        </div>

        <!-- Message de chargement -->
        <div
          *ngIf="isLoading()"
          class="text-center py-12 text-gray-600"
        >
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
          <p class="mt-4 text-lg">
            Scraping en cours... Cela peut prendre quelques instants
          </p>
        </div>

        <!-- Message d'erreur -->
        <div
          *ngIf="error()"
          class="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded"
        >
          <div class="flex items-start">
            <svg
              class="h-6 w-6 text-red-500 mr-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 class="text-red-800 font-medium">Erreur lors du scraping</h3>
              <p class="text-red-700 mt-1">{{ error() }}</p>
            </div>
          </div>
        </div>

        <!-- Statistiques des résultats -->
        <div
          *ngIf="!isLoading() && offers().length > 0"
          class="mb-6 text-gray-700"
        >
          <p class="text-lg">
            <span class="font-semibold">{{ offers().length }}</span>
            offre{{ offers().length > 1 ? 's' : '' }} trouvée{{
              offers().length > 1 ? 's' : ''
            }}
            pour
            <span class="font-semibold">"{{ lastQuery() }}"</span>
          </p>
        </div>

        <!-- Liste des offres -->
        <div *ngIf="!isLoading()">
          <app-offer-list [offers]="offers()"></app-offer-list>
        </div>
      </div>
    </div>
  `,
})
export class SearchPageComponent {
  private readonly searchService = inject(SearchService);

  // État du composant avec signals
  isLoading = signal(false);
  error = signal<string | null>(null);
  offers = signal<JobOffer[]>([]);
  lastQuery = signal<string>('');

  // Formulaire de recherche
  searchForm = new FormGroup({
    query: new FormControl('', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(200),
    ]),
  });

  /**
   * Gère la soumission du formulaire de recherche.
   * Lance le scraping et met à jour l'état avec les résultats.
   */
  onSearch(): void {
    if (this.searchForm.invalid) {
      return;
    }

    const query = this.searchForm.get('query')?.value ?? '';
    this.lastQuery.set(query);
    this.isLoading.set(true);
    this.error.set(null);
    this.offers.set([]);

    this.searchService.scrapeOffers(query).subscribe({
      next: (response) => {
        this.offers.set(response.offers);
        this.isLoading.set(false);

        if (response.offers.length === 0) {
          console.log('ℹ️ Aucune offre trouvée pour cette recherche');
        } else {
          console.log(`✅ ${response.offers.length} offres chargées`);
        }
      },
      error: (err) => {
        console.error('❌ Erreur lors du scraping:', err);
        this.error.set(
          err.error?.message ||
            'Une erreur est survenue lors de la recherche. Veuillez réessayer.'
        );
        this.isLoading.set(false);
      },
    });
  }
}

