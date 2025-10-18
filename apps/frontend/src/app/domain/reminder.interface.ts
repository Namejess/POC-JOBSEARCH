/**
 * Interface représentant un rappel planifié côté frontend
 */
export interface Reminder {
  id: string;
  email: string;
  query: string;
  sources: string[];
  daysOfWeek: number[]; // 0 = Dimanche, 1 = Lundi, ..., 6 = Samedi
  hour: number; // 0-23
  minute: number; // 0-59
  active: boolean;
  createdAt: string;
  updatedAt: string;
  daysLabel: string; // ex: "Lun, Mer, Ven"
  timeLabel: string; // ex: "09:00"
}

/**
 * DTO pour créer un nouveau rappel
 */
export interface CreateReminderDto {
  email: string;
  query: string;
  sources: string[];
  daysOfWeek: number[];
  hour: number;
  minute: number;
  active: boolean;
}

/**
 * DTO pour mettre à jour un rappel existant
 */
export interface UpdateReminderDto {
  email?: string;
  query?: string;
  sources?: string[];
  daysOfWeek?: number[];
  hour?: number;
  minute?: number;
  active?: boolean;
}

