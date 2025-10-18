import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { SearchService } from './search.service';
import { OfferListComponent } from './components/offer-list.component';
import { JobOffer } from '../../domain/job-offer.interface';

/**
 * Page de recherche d'offres d'emploi.
 * Design moderne avec TailAdmin.
 */
@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, OfferListComponent],
  template: `
    <div class="min-h-screen bg-gray-100 dark:bg-gray-900">
      <!-- En-tête -->
      <header class="bg-white dark:bg-gray-800 shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
            🔍 Agrégateur d'offres d'emploi
          </h1>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Recherchez parmi des milliers d'offres provenant de HelloWork, France Travail et Arbeitnow
          </p>
        </div>
      </header>

      <!-- Contenu principal -->
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Formulaire de recherche -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <form (ngSubmit)="onSearch()" class="space-y-4">
            <div>
              <label for="search" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rechercher une offre d'emploi
              </label>
              <div class="flex gap-3">
                <input
                  id="search"
                  type="text"
                  [(ngModel)]="searchQuery"
                  name="search"
                  placeholder="Ex: Développeur TypeScript, Designer UI/UX..."
                  class="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  [disabled]="isLoading()"
                />
                <button
                  type="submit"
                  [disabled]="isLoading() || !searchQuery.trim() || getSelectedSources().length === 0"
                  class="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <span *ngIf="!isLoading()">Rechercher</span>
                  <span *ngIf="isLoading()" class="flex items-center gap-2">
                    <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Recherche...
                  </span>
                </button>
              </div>
            </div>

            <!-- Sélection des sources -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sources à interroger
              </label>
              <div class="flex flex-wrap gap-4">
                <label 
                  *ngFor="let source of availableSources"
                  class="flex items-center gap-2 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    [(ngModel)]="source.selected"
                    [name]="'source-' + source.name"
                    [disabled]="isLoading()"
                    class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 disabled:opacity-50 cursor-pointer"
                  />
                  <span 
                    class="text-sm font-medium transition-colors"
                    [ngClass]="{
                      'text-gray-900 dark:text-white': source.selected,
                      'text-gray-500 dark:text-gray-400': !source.selected,
                      'group-hover:text-gray-700 dark:group-hover:text-gray-300': !isLoading()
                    }"
                  >
                    {{ source.name }}
                  </span>
                  <span 
                    class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                    [ngClass]="{
                      'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200': source.name === 'HelloWork',
                      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': source.name === 'France Travail',
                      'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200': source.name === 'Arbeitnow'
                    }"
                  >
                    {{ source.description }}
                  </span>
                </label>
              </div>
              <p *ngIf="getSelectedSources().length === 0" class="mt-2 text-sm text-red-600 dark:text-red-400">
                ⚠️ Veuillez sélectionner au moins une source
              </p>
            </div>

            <!-- Informations de recherche -->
            <div *ngIf="isLoading()" class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Scraping en cours depuis {{ getSelectedSources().length }} source(s)... Cela peut prendre 30 secondes à 2 minutes.
            </div>
          </form>
        </div>

        <!-- Message d'erreur -->
        <div *ngIf="errorMessage()" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-8">
          <div class="flex items-start gap-3">
            <svg class="h-5 w-5 text-red-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div class="flex-1">
              <h3 class="text-sm font-medium text-red-800 dark:text-red-200">Erreur</h3>
              <p class="mt-1 text-sm text-red-700 dark:text-red-300">{{ errorMessage() }}</p>
            </div>
          </div>
        </div>

        <!-- Résultats -->
        <app-offer-list 
          [offers]="offers()" 
          (exportByEmail)="onExportEmail()"
        ></app-offer-list>

        <!-- Message de succès export -->
        <div *ngIf="exportSuccess()" class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-8">
          <div class="flex items-start gap-3">
            <svg class="h-5 w-5 text-green-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div class="flex-1">
              <h3 class="text-sm font-medium text-green-800 dark:text-green-200">Email envoyé !</h3>
              <p class="mt-1 text-sm text-green-700 dark:text-green-300">
                Les {{ offers().length }} offres ont été envoyées à jessy_drouin@protonmail.com
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
})
export class SearchPageComponent {
  searchQuery = '';
  offers = signal<JobOffer[]>([]);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  exportSuccess = signal(false);
  isExporting = signal(false);

  // Sources disponibles avec leurs descriptions
  availableSources = [
    { 
      name: 'HelloWork', 
      selected: true, 
      description: 'Jobs France' 
    },
    { 
      name: 'France Travail', 
      selected: false, 
      description: 'API officielle (nécessite clés)' 
    },
    { 
      name: 'Arbeitnow', 
      selected: true, 
      description: 'Jobs tech Europe' 
    }
  ];

  constructor(private searchService: SearchService) {}

  /**
   * Retourne les noms des sources sélectionnées
   */
  getSelectedSources(): string[] {
    return this.availableSources
      .filter(source => source.selected)
      .map(source => source.name);
  }

  async onSearch() {
    if (!this.searchQuery.trim()) return;

    const selectedSources = this.getSelectedSources();
    if (selectedSources.length === 0) {
      this.errorMessage.set('Veuillez sélectionner au moins une source');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.exportSuccess.set(false);

    try {
      const response = await firstValueFrom(
        this.searchService.scrapeOffers(this.searchQuery, selectedSources)
      );
      this.offers.set(response.offers);
    } catch (error) {
      this.errorMessage.set(
        error instanceof Error 
          ? error.message 
          : 'Une erreur est survenue lors de la recherche'
      );
      this.offers.set([]);
    } finally {
      this.isLoading.set(false);
    }
  }

  async onExportEmail() {
    if (this.offers().length === 0) return;
    
    this.isExporting.set(true);
    this.errorMessage.set(null);
    this.exportSuccess.set(false);

    try {
      await firstValueFrom(
        this.searchService.exportEmail(
          'jessy_drouin@protonmail.com',
          this.searchQuery,
          this.offers()
        )
      );
      this.exportSuccess.set(true);
      
      // Cacher le message de succès après 5 secondes
      setTimeout(() => {
        this.exportSuccess.set(false);
      }, 5000);
    } catch (error) {
      this.errorMessage.set(
        error instanceof Error 
          ? error.message 
          : 'Une erreur est survenue lors de l\'envoi de l\'email'
      );
    } finally {
      this.isExporting.set(false);
    }
  }
}
