import { Component, Input, Output, EventEmitter, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Reminder, CreateReminderDto } from '../../../domain/reminder.interface';
import { ReminderService } from '../reminder.service';
import { firstValueFrom } from 'rxjs';

/**
 * Composant drawer latéral pour gérer les rappels planifiés
 */
@Component({
  selector: 'app-reminders-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Drawer qui slide depuis la droite -->
    <div 
      *ngIf="isOpen"
      class="fixed inset-0 z-50 overflow-hidden"
      (click)="close()"
    >
      <!-- Overlay -->
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"></div>
      
      <!-- Panneau latéral -->
      <div 
        class="absolute right-0 top-0 h-full w-full max-w-2xl bg-white dark:bg-gray-800 shadow-2xl flex flex-col animate-slide-in-right"
        (click)="$event.stopPropagation()"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center gap-3">
            <div class="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <svg class="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div>
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
                Rappels planifiés
              </h2>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Recevez automatiquement les offres par email
              </p>
            </div>
          </div>
          <button
            (click)="close()"
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Contenu avec scroll -->
        <div class="flex-1 overflow-y-auto p-6 space-y-6">
          <!-- Formulaire de création -->
          <div class="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <svg class="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Créer un nouveau rappel
            </h3>
            
            <form (submit)="$event.preventDefault(); createReminder()" class="space-y-4">
              <!-- Email -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email destinataire *
                </label>
                <input
                  type="email"
                  [(ngModel)]="formData.email"
                  name="email"
                  required
                  placeholder="exemple@email.com"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                />
              </div>

              <!-- Requête de recherche -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Recherche *
                </label>
                <input
                  type="text"
                  [(ngModel)]="formData.query"
                  name="query"
                  required
                  placeholder="Développeur TypeScript"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                />
              </div>

              <!-- Sources -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sources *
                </label>
                <div class="grid grid-cols-2 gap-2">
                  <label *ngFor="let source of availableSources" class="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      [(ngModel)]="source.selected"
                      [name]="'source-' + source.name"
                      class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span class="text-sm text-gray-700 dark:text-gray-300">{{ source.name }}</span>
                  </label>
                </div>
              </div>

              <!-- Jours de la semaine -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Jours de la semaine *
                </label>
                <div class="grid grid-cols-7 gap-1">
                  <button
                    *ngFor="let day of daysOfWeek; let i = index"
                    type="button"
                    (click)="toggleDay(i)"
                    [class]="day.selected 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'"
                    class="px-2 py-2 rounded-lg text-xs font-medium hover:opacity-80 transition-all"
                  >
                    {{ day.label }}
                  </button>
                </div>
              </div>

              <!-- Heure -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Heure d'envoi *
                </label>
                <div class="flex items-center gap-2">
                  <input
                    type="number"
                    [(ngModel)]="formData.hour"
                    name="hour"
                    min="0"
                    max="23"
                    required
                    class="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm text-center"
                  />
                  <span class="text-gray-500 dark:text-gray-400">:</span>
                  <input
                    type="number"
                    [(ngModel)]="formData.minute"
                    name="minute"
                    min="0"
                    max="59"
                    required
                    class="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm text-center"
                  />
                </div>
                <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Format 24h (ex: 09:30)
                </p>
              </div>

              <!-- Active par défaut -->
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  [(ngModel)]="formData.active"
                  name="active"
                  class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span class="text-sm text-gray-700 dark:text-gray-300">Activer immédiatement</span>
              </label>

              <!-- Bouton créer -->
              <button
                type="submit"
                [disabled]="isCreating()"
                class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <svg *ngIf="!isCreating()" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <svg *ngIf="isCreating()" class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{{ isCreating() ? 'Création...' : 'Créer le rappel' }}</span>
              </button>
            </form>
          </div>

          <!-- Liste des rappels -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <svg class="h-5 w-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Mes rappels ({{ reminders().length }})
            </h3>

            <div *ngIf="reminders().length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
              <svg class="mx-auto h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p>Aucun rappel configuré</p>
            </div>

            <div class="space-y-3">
              <div
                *ngFor="let reminder of reminders()"
                class="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-2">
                      <span [class]="reminder.active 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'"
                        class="px-2 py-0.5 rounded-full text-xs font-medium"
                      >
                        {{ reminder.active ? 'Actif' : 'Inactif' }}
                      </span>
                      <span class="text-sm font-medium text-gray-900 dark:text-white">{{ reminder.query }}</span>
                    </div>
                    <div class="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                      <p>📧 {{ reminder.email }}</p>
                      <p>📅 {{ reminder.daysLabel }}</p>
                      <p>⏰ {{ reminder.timeLabel }}</p>
                      <p>📊 {{ reminder.sources.join(', ') }}</p>
                    </div>
                  </div>
                  
                  <div class="flex items-center gap-1 ml-4">
                    <!-- Toggle actif/inactif -->
                    <button
                      (click)="toggleReminder(reminder.id)"
                      [disabled]="isToggling() === reminder.id"
                      class="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors disabled:opacity-50"
                      [title]="reminder.active ? 'Désactiver' : 'Activer'"
                    >
                      <svg *ngIf="reminder.active" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <svg *ngIf="!reminder.active" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                    
                    <!-- Supprimer -->
                    <button
                      (click)="deleteReminder(reminder.id)"
                      [disabled]="isDeleting() === reminder.id"
                      class="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                      title="Supprimer"
                    >
                      <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes slideInRight {
      from {
        transform: translateX(100%);
      }
      to {
        transform: translateX(0);
      }
    }

    .animate-slide-in-right {
      animation: slideInRight 0.3s ease-out;
    }
  `]
})
export class RemindersDrawerComponent implements OnInit {
  @Input() isOpen = false;
  @Input() currentQuery = '';
  @Input() currentSources: string[] = [];
  @Output() closeDrawer = new EventEmitter<void>();

  reminders = signal<Reminder[]>([]);
  isCreating = signal(false);
  isToggling = signal<string | null>(null);
  isDeleting = signal<string | null>(null);

  formData: CreateReminderDto = {
    email: 'jessy_drouin@protonmail.com',
    query: '',
    sources: [],
    daysOfWeek: [],
    hour: 9,
    minute: 0,
    active: true,
  };

  availableSources = [
    { name: 'HelloWork', selected: true },
    { name: 'France Travail', selected: false },
    { name: 'Arbeitnow', selected: true },
  ];

  daysOfWeek = [
    { label: 'Dim', selected: false },
    { label: 'Lun', selected: true },
    { label: 'Mar', selected: true },
    { label: 'Mer', selected: true },
    { label: 'Jeu', selected: true },
    { label: 'Ven', selected: true },
    { label: 'Sam', selected: false },
  ];

  constructor(private reminderService: ReminderService) {}

  ngOnInit() {
    this.loadReminders();
    // Pré-remplir avec la requête et sources actuelles si disponibles
    if (this.currentQuery) {
      this.formData.query = this.currentQuery;
    }
    if (this.currentSources.length > 0) {
      this.availableSources.forEach(source => {
        source.selected = this.currentSources.includes(source.name);
      });
    }
  }

  async loadReminders() {
    try {
      const response = await firstValueFrom(this.reminderService.getAllReminders());
      this.reminders.set(response.reminders);
    } catch (error) {
      console.error('Erreur lors du chargement des rappels:', error);
    }
  }

  toggleDay(dayIndex: number) {
    this.daysOfWeek[dayIndex].selected = !this.daysOfWeek[dayIndex].selected;
  }

  async createReminder() {
    const selectedSources = this.availableSources
      .filter(s => s.selected)
      .map(s => s.name);

    const selectedDays = this.daysOfWeek
      .map((day, index) => day.selected ? index : -1)
      .filter(index => index !== -1);

    if (selectedSources.length === 0) {
      alert('Veuillez sélectionner au moins une source');
      return;
    }

    if (selectedDays.length === 0) {
      alert('Veuillez sélectionner au moins un jour');
      return;
    }

    this.isCreating.set(true);

    try {
      const dto: CreateReminderDto = {
        email: this.formData.email,
        query: this.formData.query,
        sources: selectedSources,
        daysOfWeek: selectedDays,
        hour: Number(this.formData.hour), // Conversion explicite en number
        minute: Number(this.formData.minute), // Conversion explicite en number
        active: this.formData.active,
      };

      console.log('📤 Envoi du rappel:', dto);
      
      const response = await firstValueFrom(this.reminderService.createReminder(dto));
      console.log('✅ Rappel créé:', response);
      
      await this.loadReminders();
      
      // Réinitialiser le formulaire
      this.formData.query = '';
      this.formData.hour = 9;
      this.formData.minute = 0;
      this.formData.active = true;
      
      alert('✅ Rappel créé avec succès !');
    } catch (error) {
      console.error('❌ Erreur lors de la création du rappel:', error);
      
      let errorMessage = 'Erreur lors de la création du rappel';
      if (error && typeof error === 'object' && 'error' in error) {
        const err = error as any;
        errorMessage = err.error?.message || err.message || errorMessage;
      }
      
      alert(`❌ ${errorMessage}`);
    } finally {
      this.isCreating.set(false);
    }
  }

  async toggleReminder(id: string) {
    this.isToggling.set(id);
    try {
      await firstValueFrom(this.reminderService.toggleReminder(id));
      await this.loadReminders();
    } catch (error) {
      console.error('Erreur lors du toggle du rappel:', error);
    } finally {
      this.isToggling.set(null);
    }
  }

  async deleteReminder(id: string) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce rappel ?')) {
      return;
    }

    this.isDeleting.set(id);
    try {
      await firstValueFrom(this.reminderService.deleteReminder(id));
      await this.loadReminders();
    } catch (error) {
      console.error('Erreur lors de la suppression du rappel:', error);
    } finally {
      this.isDeleting.set(null);
    }
  }

  close() {
    this.closeDrawer.emit();
  }
}

