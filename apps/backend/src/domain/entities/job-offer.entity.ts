/**
 * Entité domaine représentant une offre d'emploi normalisée.
 * Aggregate root du domaine Job Search.
 */
export class JobOffer {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly company: string,
    public readonly location: string,
    public readonly publishedAt: Date,
    public readonly canonicalUrl: string,
    public readonly description: string,
    public readonly source: string,
    public readonly contractType?: string,
    public readonly salary?: { min?: number; max?: number; currency?: string },
    public readonly skills?: string[]
  ) {}

  /**
   * Vérifie si l'offre correspond à un terme de recherche.
   * 
   * @param searchTerm Terme de recherche (case insensitive)
   * @returns true si l'offre correspond au terme
   */
  matches(searchTerm: string): boolean {
    const term = searchTerm.toLowerCase();
    return (
      this.title.toLowerCase().includes(term) ||
      this.company.toLowerCase().includes(term) ||
      this.location.toLowerCase().includes(term) ||
      this.description.toLowerCase().includes(term) ||
      (this.contractType?.toLowerCase().includes(term) ?? false)
    );
  }
}

