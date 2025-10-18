import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  HttpCode, 
  HttpStatus,
  NotFoundException,
  Logger
} from '@nestjs/common';
import { SchedulerService } from '../services/scheduler.service';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';

/**
 * Contrôleur pour la gestion des rappels planifiés.
 * Expose les endpoints CRUD pour créer, lire, mettre à jour et supprimer des rappels.
 */
@Controller('api/reminders')
export class RemindersController {
  private readonly logger = new Logger(RemindersController.name);

  constructor(private readonly schedulerService: SchedulerService) {}

  /**
   * Récupère tous les rappels
   */
  @Get()
  getAllReminders() {
    this.logger.log('📋 Requête : Liste de tous les rappels');
    const reminders = this.schedulerService.getAllReminders();
    
    return {
      success: true,
      count: reminders.length,
      reminders: reminders.map(r => ({
        id: r.id,
        email: r.email,
        query: r.query,
        sources: r.sources,
        daysOfWeek: r.daysOfWeek,
        hour: r.hour,
        minute: r.minute,
        active: r.active,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        daysLabel: r.getDaysLabel(),
        timeLabel: r.getTimeLabel(),
      })),
    };
  }

  /**
   * Récupère un rappel par son ID
   */
  @Get(':id')
  getReminderById(@Param('id') id: string) {
    this.logger.log(`📄 Requête : Détails du rappel ${id}`);
    const reminder = this.schedulerService.getReminderById(id);
    
    if (!reminder) {
      throw new NotFoundException(`Rappel ${id} introuvable`);
    }

    return {
      success: true,
      reminder: {
        id: reminder.id,
        email: reminder.email,
        query: reminder.query,
        sources: reminder.sources,
        daysOfWeek: reminder.daysOfWeek,
        hour: reminder.hour,
        minute: reminder.minute,
        active: reminder.active,
        createdAt: reminder.createdAt,
        updatedAt: reminder.updatedAt,
        daysLabel: reminder.getDaysLabel(),
        timeLabel: reminder.getTimeLabel(),
      },
    };
  }

  /**
   * Crée un nouveau rappel
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  createReminder(@Body() dto: CreateReminderDto) {
    try {
      this.logger.log(`➕ Requête : Création d'un rappel pour "${dto.query}"`);
      this.logger.debug(`📋 DTO reçu: ${JSON.stringify(dto)}`);
      
      const reminder = this.schedulerService.createReminder(dto);

      return {
        success: true,
        message: 'Rappel créé avec succès',
        reminder: {
          id: reminder.id,
          email: reminder.email,
          query: reminder.query,
          sources: reminder.sources,
          daysOfWeek: reminder.daysOfWeek,
          hour: reminder.hour,
          minute: reminder.minute,
          active: reminder.active,
          createdAt: reminder.createdAt,
          updatedAt: reminder.updatedAt,
          daysLabel: reminder.getDaysLabel(),
          timeLabel: reminder.getTimeLabel(),
        },
      };
    } catch (error) {
      this.logger.error(`❌ Erreur lors de la création du rappel: ${error instanceof Error ? error.message : error}`);
      throw error;
    }
  }

  /**
   * Met à jour un rappel existant
   */
  @Put(':id')
  updateReminder(@Param('id') id: string, @Body() dto: UpdateReminderDto) {
    this.logger.log(`✏️ Requête : Mise à jour du rappel ${id}`);
    
    try {
      const reminder = this.schedulerService.updateReminder(id, dto);

      return {
        success: true,
        message: 'Rappel mis à jour avec succès',
        reminder: {
          id: reminder.id,
          email: reminder.email,
          query: reminder.query,
          sources: reminder.sources,
          daysOfWeek: reminder.daysOfWeek,
          hour: reminder.hour,
          minute: reminder.minute,
          active: reminder.active,
          createdAt: reminder.createdAt,
          updatedAt: reminder.updatedAt,
          daysLabel: reminder.getDaysLabel(),
          timeLabel: reminder.getTimeLabel(),
        },
      };
    } catch (error) {
      throw new NotFoundException(error instanceof Error ? error.message : 'Erreur inconnue');
    }
  }

  /**
   * Active ou désactive un rappel
   */
  @Put(':id/toggle')
  toggleReminder(@Param('id') id: string) {
    this.logger.log(`🔄 Requête : Toggle du rappel ${id}`);
    
    try {
      const reminder = this.schedulerService.toggleReminder(id);

      return {
        success: true,
        message: `Rappel ${reminder.active ? 'activé' : 'désactivé'}`,
        reminder: {
          id: reminder.id,
          active: reminder.active,
        },
      };
    } catch (error) {
      throw new NotFoundException(error instanceof Error ? error.message : 'Erreur inconnue');
    }
  }

  /**
   * Supprime un rappel
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteReminder(@Param('id') id: string) {
    this.logger.log(`🗑️ Requête : Suppression du rappel ${id}`);
    
    const deleted = this.schedulerService.deleteReminder(id);
    
    if (!deleted) {
      throw new NotFoundException(`Rappel ${id} introuvable`);
    }

    return {
      success: true,
      message: 'Rappel supprimé avec succès',
    };
  }
}

