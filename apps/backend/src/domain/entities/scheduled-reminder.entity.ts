/**
 * Représente un rappel planifié pour l'envoi d'offres par email.
 */
export class ScheduledReminder {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly query: string,
    public readonly sources: string[],
    public readonly daysOfWeek: number[], // 0 = Dimanche, 1 = Lundi, ..., 6 = Samedi
    public readonly hour: number, // 0-23
    public readonly minute: number, // 0-59
    public readonly active: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  /**
   * Retourne une représentation lisible des jours de la semaine
   */
  getDaysLabel(): string {
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    return this.daysOfWeek.map(d => days[d]).join(', ');
  }

  /**
   * Retourne l'heure formatée (HH:MM)
   */
  getTimeLabel(): string {
    const h = this.hour.toString().padStart(2, '0');
    const m = this.minute.toString().padStart(2, '0');
    return `${h}:${m}`;
  }

  /**
   * Vérifie si le rappel doit s'exécuter maintenant
   */
  shouldRunNow(now: Date): boolean {
    if (!this.active) return false;
    
    const currentDay = now.getDay();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    return (
      this.daysOfWeek.includes(currentDay) &&
      this.hour === currentHour &&
      this.minute === currentMinute
    );
  }
}

