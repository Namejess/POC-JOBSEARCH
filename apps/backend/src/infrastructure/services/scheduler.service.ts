import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as cron from 'node-cron';
import { v4 as uuidv4 } from 'uuid';
import { ScheduledReminder } from '../../domain/entities/scheduled-reminder.entity';
import { CreateReminderDto } from '../http/dto/create-reminder.dto';
import { UpdateReminderDto } from '../http/dto/update-reminder.dto';
import { ScrapeOffersUseCase } from '../../application/use-cases/scrape-offers.usecase';
import { EmailService } from './email.service';

/**
 * Service de gestion des rappels planifiés.
 * Utilise node-cron pour exécuter les tâches planifiées.
 */
@Injectable()
export class SchedulerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SchedulerService.name);
  private reminders: Map<string, ScheduledReminder> = new Map();
  private cronTask: cron.ScheduledTask | null = null;

  constructor(
    private readonly scrapeOffersUseCase: ScrapeOffersUseCase,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Initialise le service au démarrage du module
   */
  onModuleInit() {
    // Vérifie toutes les minutes si un rappel doit être exécuté
    this.cronTask = cron.schedule('* * * * *', () => {
      this.checkAndExecuteReminders();
    });
    this.logger.log('✅ Service de planification démarré (vérification chaque minute)');
  }

  /**
   * Arrête proprement le service à la destruction du module
   */
  onModuleDestroy() {
    if (this.cronTask) {
      this.cronTask.stop();
      this.logger.log('🛑 Service de planification arrêté');
    }
  }

  /**
   * Vérifie et exécute les rappels qui doivent être déclenchés maintenant
   */
  private async checkAndExecuteReminders() {
    const now = new Date();
    const remindersToExecute = Array.from(this.reminders.values()).filter(
      reminder => reminder.shouldRunNow(now)
    );

    if (remindersToExecute.length > 0) {
      this.logger.log(`⏰ ${remindersToExecute.length} rappel(s) à exécuter`);
    }

    for (const reminder of remindersToExecute) {
      await this.executeReminder(reminder);
    }
  }

  /**
   * Exécute un rappel : scrape les offres et envoie l'email
   */
  private async executeReminder(reminder: ScheduledReminder) {
    try {
      this.logger.log(`🚀 Exécution du rappel ${reminder.id} : "${reminder.query}"`);

      // Scrape les offres
      const offers = await this.scrapeOffersUseCase.execute(
        reminder.query,
        reminder.sources
      );

      if (offers.length === 0) {
        this.logger.warn(`⚠️ Aucune offre trouvée pour le rappel ${reminder.id}`);
        return;
      }

      // Envoie l'email
      await this.emailService.sendOffersEmail(
        reminder.email,
        reminder.query,
        offers
      );

      this.logger.log(`✅ Rappel ${reminder.id} exécuté avec succès (${offers.length} offres envoyées)`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      this.logger.error(`❌ Erreur lors de l'exécution du rappel ${reminder.id} : ${message}`);
    }
  }

  /**
   * Crée un nouveau rappel
   */
  createReminder(dto: CreateReminderDto): ScheduledReminder {
    const reminder = new ScheduledReminder(
      uuidv4(),
      dto.email,
      dto.query,
      dto.sources,
      dto.daysOfWeek,
      dto.hour,
      dto.minute,
      dto.active,
      new Date(),
      new Date(),
    );

    this.reminders.set(reminder.id, reminder);
    this.logger.log(`➕ Rappel créé : ${reminder.id} (${reminder.getTimeLabel()} - ${reminder.getDaysLabel()})`);

    return reminder;
  }

  /**
   * Récupère tous les rappels
   */
  getAllReminders(): ScheduledReminder[] {
    return Array.from(this.reminders.values());
  }

  /**
   * Récupère un rappel par son ID
   */
  getReminderById(id: string): ScheduledReminder | undefined {
    return this.reminders.get(id);
  }

  /**
   * Met à jour un rappel
   */
  updateReminder(id: string, dto: UpdateReminderDto): ScheduledReminder {
    const existing = this.reminders.get(id);
    if (!existing) {
      throw new Error(`Rappel ${id} introuvable`);
    }

    const updated = new ScheduledReminder(
      existing.id,
      dto.email ?? existing.email,
      dto.query ?? existing.query,
      dto.sources ?? existing.sources,
      dto.daysOfWeek ?? existing.daysOfWeek,
      dto.hour ?? existing.hour,
      dto.minute ?? existing.minute,
      dto.active ?? existing.active,
      existing.createdAt,
      new Date(),
    );

    this.reminders.set(id, updated);
    this.logger.log(`✏️ Rappel mis à jour : ${id}`);

    return updated;
  }

  /**
   * Supprime un rappel
   */
  deleteReminder(id: string): boolean {
    const deleted = this.reminders.delete(id);
    if (deleted) {
      this.logger.log(`🗑️ Rappel supprimé : ${id}`);
    }
    return deleted;
  }

  /**
   * Active ou désactive un rappel
   */
  toggleReminder(id: string): ScheduledReminder {
    const existing = this.reminders.get(id);
    if (!existing) {
      throw new Error(`Rappel ${id} introuvable`);
    }

    return this.updateReminder(id, { active: !existing.active });
  }
}

