import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { SearchService } from './search.service';
import { OfferListComponent } from './components/offer-list.component';
import { RemindersDrawerComponent } from './components/reminders-drawer.component';
import { JobOffer } from '../../domain/job-offer.interface';

/**
 * Page de recherche d'offres d'emploi.
 * Design moderne avec TailAdmin.
 */
@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, OfferListComponent, RemindersDrawerComponent],
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
                <button
                  type="button"
                  (click)="openRemindersDrawer()"
                  class="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors duration-200 flex items-center gap-2"
                  title="Configurer des rappels par email"
                >
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span class="hidden sm:inline">Rappels</span>
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

        <!-- Message d'erreur (toast en haut à droite) -->
        <div 
          *ngIf="errorMessage()" 
          class="fixed top-4 right-4 z-50 animate-slide-in-right max-w-md"
        >
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-red-200 dark:border-red-700 p-4">
            <div class="flex items-start gap-3">
              <div class="flex-shrink-0">
                <div class="flex items-center justify-center w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full">
                  <svg class="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div class="flex-1">
                <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Erreur ⚠️</h3>
                <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">{{ errorMessage() }}</p>
              </div>
              <button
                (click)="errorMessage.set(null)"
                class="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Résultats -->
        <app-offer-list 
          [offers]="offers()" 
          (exportByEmail)="onExportEmail()"
        ></app-offer-list>
      </main>
    </div>

    <!-- Modal de saisie d'email -->
    <div 
      *ngIf="showEmailModal()" 
      class="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      (click)="closeEmailModal()"
    >
      <!-- Overlay sombre -->
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      
      <!-- Modal -->
      <div 
        class="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 animate-scale-in"
        (click)="$event.stopPropagation()"
      >
        <!-- Header -->
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-3">
            <div class="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <svg class="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                Envoyer par email
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ offers().length }} offre(s) sélectionnée(s)
              </p>
            </div>
          </div>
          <button
            (click)="closeEmailModal()"
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Formulaire -->
        <form (submit)="$event.preventDefault(); sendEmail()">
          <div class="mb-6">
            <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Adresse email du destinataire
            </label>
            <input
              type="email"
              id="email"
              [(ngModel)]="emailAddress"
              name="email"
              required
              placeholder="exemple@email.com"
              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all"
            />
            
            <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
              💡 Un email HTML professionnel sera envoyé avec toutes les offres
            </p>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-3">
            <button
              type="button"
              (click)="closeEmailModal()"
              class="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              [disabled]="isExporting()"
              class="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <span *ngIf="!isExporting()">Envoyer</span>
              <span *ngIf="isExporting()" class="flex items-center gap-2">
                <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Envoi...
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Toast notification de succès (position fixe en haut à droite) -->
    <div 
      *ngIf="exportSuccess()" 
      class="fixed top-4 right-4 z-50 animate-slide-in-right"
      style="animation: slideIn 0.3s ease-out;"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-green-200 dark:border-green-700 p-4 max-w-md">
        <div class="flex items-start gap-3">
          <!-- Icône de succès avec animation -->
          <div class="flex-shrink-0">
            <div class="flex items-center justify-center w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full">
              <svg class="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          
          <!-- Contenu -->
          <div class="flex-1">
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white">
              Email envoyé avec succès ! 📧
            </h3>
            <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {{ offers().length }} offre(s) envoyée(s)
            </p>
            <p class="mt-2 text-xs text-gray-500 dark:text-gray-500">
              Vérifiez votre boîte de réception
            </p>
          </div>
          
          <!-- Bouton fermer -->
          <button
            (click)="exportSuccess.set(false)"
            class="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- Barre de progression -->
        <div class="mt-3 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div class="h-full bg-green-500 rounded-full animate-progress" style="animation: progress 5s linear;"></div>
        </div>
      </div>
    </div>

    <!-- Drawer des rappels -->
    <app-reminders-drawer
      [isOpen]="showRemindersDrawer()"
      [currentQuery]="searchQuery"
      [currentSources]="getSelectedSources()"
      (closeDrawer)="closeRemindersDrawer()"
    ></app-reminders-drawer>
  `,
})
export class SearchPageComponent {
  searchQuery = '';
  offers = signal<JobOffer[]>([]);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  exportSuccess = signal(false);
  isExporting = signal(false);
  showEmailModal = signal(false);
  emailAddress = '';
  showRemindersDrawer = signal(false);

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

  /**
   * Ouvre le modal de saisie d'email
   */
  onExportEmail() {
    if (this.offers().length === 0) return;
    this.emailAddress = 'jessy_drouin@protonmail.com'; // Valeur par défaut
    this.showEmailModal.set(true);
  }

  /**
   * Ferme le modal sans envoyer
   */
  closeEmailModal() {
    this.showEmailModal.set(false);
    this.emailAddress = '';
  }

  /**
   * Envoie l'email après validation de l'adresse
   */
  async sendEmail() {
    if (!this.emailAddress || !this.emailAddress.trim()) {
      this.errorMessage.set('Veuillez saisir une adresse email');
      return;
    }

    // Validation simple de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.emailAddress)) {
      this.errorMessage.set('Adresse email invalide');
      return;
    }
    
    this.isExporting.set(true);
    this.errorMessage.set(null);
    this.exportSuccess.set(false);
    this.showEmailModal.set(false);

    try {
      await firstValueFrom(
        this.searchService.exportEmail(
          this.emailAddress,
          this.searchQuery,
          this.offers()
        )
      );
      this.exportSuccess.set(true);
      this.emailAddress = '';
      
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

  /**
   * Ouvre le drawer des rappels
   */
  openRemindersDrawer() {
    this.showRemindersDrawer.set(true);
  }

  /**
   * Ferme le drawer des rappels
   */
  closeRemindersDrawer() {
    this.showRemindersDrawer.set(false);
  }
}
