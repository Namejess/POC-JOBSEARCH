import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Reminder, CreateReminderDto, UpdateReminderDto } from '../../domain/reminder.interface';

/**
 * Service pour gérer les rappels planifiés
 */
@Injectable({
  providedIn: 'root'
})
export class ReminderService {
  private readonly apiUrl = `${environment.apiUrl}/reminders`;

  constructor(private http: HttpClient) {}

  /**
   * Récupère tous les rappels
   */
  getAllReminders(): Observable<{ success: boolean; count: number; reminders: Reminder[] }> {
    return this.http.get<{ success: boolean; count: number; reminders: Reminder[] }>(this.apiUrl);
  }

  /**
   * Récupère un rappel par son ID
   */
  getReminderById(id: string): Observable<{ success: boolean; reminder: Reminder }> {
    return this.http.get<{ success: boolean; reminder: Reminder }>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crée un nouveau rappel
   */
  createReminder(dto: CreateReminderDto): Observable<{ success: boolean; message: string; reminder: Reminder }> {
    return this.http.post<{ success: boolean; message: string; reminder: Reminder }>(this.apiUrl, dto);
  }

  /**
   * Met à jour un rappel existant
   */
  updateReminder(id: string, dto: UpdateReminderDto): Observable<{ success: boolean; message: string; reminder: Reminder }> {
    return this.http.put<{ success: boolean; message: string; reminder: Reminder }>(`${this.apiUrl}/${id}`, dto);
  }

  /**
   * Active ou désactive un rappel
   */
  toggleReminder(id: string): Observable<{ success: boolean; message: string; reminder: { id: string; active: boolean } }> {
    return this.http.put<{ success: boolean; message: string; reminder: { id: string; active: boolean } }>(`${this.apiUrl}/${id}/toggle`, {});
  }

  /**
   * Supprime un rappel
   */
  deleteReminder(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }
}

