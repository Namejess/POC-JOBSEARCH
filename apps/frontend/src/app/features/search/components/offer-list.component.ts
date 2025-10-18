import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobOffer } from '../../../domain/job-offer.interface';

/**
 * Composant DataTable pour afficher les offres d'emploi.
 * Design TailAdmin professionnel.
 */
@Component({
  selector: 'app-offer-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <!-- En-tête -->
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
          Résultats de recherche
          <span *ngIf="offers.length > 0" class="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
            ({{ offers.length }} offres)
          </span>
        </h2>
      </div>

      <!-- Message si aucune offre -->
      <div *ngIf="offers.length === 0" class="px-6 py-16 text-center">
        <svg class="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white">Aucune offre trouvée</h3>
        <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Lancez une recherche pour voir les offres d'emploi
        </p>
      </div>

      <!-- Tableau des offres -->
      <div *ngIf="offers.length > 0" class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Poste
              </th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Entreprise
              </th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Localisation
              </th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Contrat
              </th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Salaire
              </th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Source
              </th>
              <th class="px-6 py-4 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr *ngFor="let offer of offers" class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <!-- Poste -->
              <td class="px-6 py-4">
                <div class="flex flex-col">
                  <span class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ offer.title }}
                  </span>
                  <span class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {{ formatDate(offer.publishedAt) }}
                  </span>
                </div>
              </td>

              <!-- Entreprise -->
              <td class="px-6 py-4">
                <span class="text-sm text-gray-900 dark:text-white">
                  {{ offer.company }}
                </span>
              </td>

              <!-- Localisation -->
              <td class="px-6 py-4">
                <span class="text-sm text-gray-700 dark:text-gray-300">
                  {{ offer.location }}
                </span>
              </td>

              <!-- Contrat -->
              <td class="px-6 py-4">
                <span 
                  *ngIf="offer.contractType"
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  [ngClass]="{
                    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': offer.contractType.toLowerCase().includes('cdi'),
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200': offer.contractType.toLowerCase().includes('cdd'),
                    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200': offer.contractType.toLowerCase().includes('stage'),
                    'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200': offer.contractType.toLowerCase().includes('alternance'),
                    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200': offer.contractType.toLowerCase().includes('freelance') || offer.contractType.toLowerCase().includes('intérim'),
                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200': 
                      !offer.contractType.toLowerCase().includes('cdi') && 
                      !offer.contractType.toLowerCase().includes('cdd') && 
                      !offer.contractType.toLowerCase().includes('stage') && 
                      !offer.contractType.toLowerCase().includes('alternance') && 
                      !offer.contractType.toLowerCase().includes('freelance') && 
                      !offer.contractType.toLowerCase().includes('intérim')
                  }"
                >
                  {{ offer.contractType }}
                </span>
                <span *ngIf="!offer.contractType" class="text-sm text-gray-400 dark:text-gray-500">
                  Non spécifié
                </span>
              </td>

              <!-- Salaire -->
              <td class="px-6 py-4">
                <span class="text-sm text-gray-700 dark:text-gray-300">
                  {{ formatSalary(offer.salary) }}
                </span>
              </td>

              <!-- Source -->
              <td class="px-6 py-4">
                <span 
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  [ngClass]="{
                    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200': offer.source.toLowerCase().includes('hellowork'),
                    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': offer.source.toLowerCase().includes('france') || offer.source.toLowerCase().includes('travail'),
                    'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200': offer.source.toLowerCase().includes('arbeitnow'),
                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200': 
                      !offer.source.toLowerCase().includes('hellowork') && 
                      !offer.source.toLowerCase().includes('france') && 
                      !offer.source.toLowerCase().includes('arbeitnow')
                  }"
                >
                  {{ offer.source }}
                </span>
              </td>

              <!-- Action -->
              <td class="px-6 py-4 text-right">
                <a
                  [href]="offer.canonicalUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  Voir l'offre
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class OfferListComponent {
  @Input() offers: JobOffer[] = [];

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} sem.`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  formatSalary(salary?: { min?: number; max?: number; currency?: string }): string {
    if (!salary) return 'Non précisé';
    
    const currency = salary.currency === 'EUR' ? '€' : (salary.currency || '€');

    if (salary.min && salary.max) {
      return `${this.formatAmount(salary.min)} - ${this.formatAmount(salary.max)} ${currency}`;
    }
    if (salary.min) {
      return `${this.formatAmount(salary.min)} ${currency}`;
    }
    return 'Non précisé';
  }

  private formatAmount(amount: number): string {
    if (amount >= 1000) {
      return `${Math.round(amount / 1000)}K`;
    }
    return amount.toString();
  }
}
