import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobOffer } from '../../../domain/job-offer.interface';

/**
 * Composant de présentation pour afficher une liste d'offres d'emploi.
 * Utilise Tailwind CSS pour le styling.
 */
@Component({
  selector: 'app-offer-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-4">
      <!-- Message si aucune offre -->
      <div
        *ngIf="offers.length === 0"
        class="text-center py-12 text-gray-500"
      >
        <svg
          class="mx-auto h-12 w-12 text-gray-400"
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
        <p class="mt-4 text-lg font-medium">Aucune offre trouvée</p>
        <p class="mt-2 text-sm">
          Essayez une autre recherche ou modifiez vos critères
        </p>
      </div>

      <!-- Liste des offres -->
      <div *ngFor="let offer of offers" class="card">
        <!-- En-tête de la carte -->
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <h3 class="text-xl font-semibold text-gray-900 mb-1">
              {{ offer.title }}
            </h3>
            <p class="text-lg text-gray-700 font-medium">
              {{ offer.company }}
            </p>
          </div>
          <span
            *ngIf="offer.contractType"
            [class]="getContractTypeBadgeClass(offer.contractType)"
            class="badge"
          >
            {{ offer.contractType }}
          </span>
        </div>

        <!-- Informations supplémentaires -->
        <div class="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
          <!-- Localisation -->
          <div class="flex items-center gap-1">
            <svg
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span>{{ offer.location }}</span>
          </div>

          <!-- Date de publication -->
          <div class="flex items-center gap-1">
            <svg
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>{{ formatDate(offer.publishedAt) }}</span>
          </div>

          <!-- Salaire -->
          <div *ngIf="offer.salary" class="flex items-center gap-1">
            <svg
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{{ formatSalary(offer.salary) }}</span>
          </div>
        </div>

        <!-- Description (tronquée) -->
        <p class="text-gray-700 mb-4 line-clamp-3">
          {{ offer.description }}
        </p>

        <!-- Compétences -->
        <div *ngIf="offer.skills && offer.skills.length > 0" class="mb-4">
          <div class="flex flex-wrap gap-2">
            <span
              *ngFor="let skill of offer.skills"
              class="badge badge-default text-xs"
            >
              {{ skill }}
            </span>
          </div>
        </div>

        <!-- Bouton voir l'offre -->
        <div class="flex justify-end">
          <a
            [href]="offer.canonicalUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            Voir l'offre
            <svg
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </div>
      </div>
    </div>
  `,
})
export class OfferListComponent {
  @Input() offers: JobOffer[] = [];

  /**
   * Retourne la classe CSS pour le badge du type de contrat.
   */
  getContractTypeBadgeClass(contractType: string): string {
    const type = contractType.toLowerCase();
    if (type.includes('cdi')) return 'badge-cdi';
    if (type.includes('cdd')) return 'badge-cdd';
    if (type.includes('stage')) return 'badge-stage';
    if (type.includes('alternance')) return 'badge-alternance';
    if (type.includes('freelance')) return 'badge-freelance';
    return 'badge-default';
  }

  /**
   * Formate la date de publication de manière lisible.
   */
  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    return date.toLocaleDateString('fr-FR');
  }

  /**
   * Formate le salaire de manière lisible.
   */
  formatSalary(salary: {
    min?: number;
    max?: number;
    currency?: string;
  }): string {
    const currency = salary.currency || 'EUR';
    const symbol = currency === 'EUR' ? '€' : currency;

    if (salary.min && salary.max) {
      return `${salary.min / 1000}K - ${salary.max / 1000}K ${symbol}`;
    }
    if (salary.min) {
      return `${salary.min / 1000}K ${symbol}`;
    }
    return 'Non précisé';
  }
}

