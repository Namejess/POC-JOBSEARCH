import { Injectable } from '@nestjs/common';
import { JobOffer } from '../../domain/entities/job-offer.entity';
import { RawJobOffer } from '../../domain/entities/raw-job-offer.type';
import { INormalizer } from '../../domain/ports/normalizer.interface';
import { v4 as uuidv4 } from 'uuid';

/**
 * Service de normalisation des offres d'emploi brutes vers le modèle pivot.
 * Implémente les règles de nettoyage, parsing et transformation des données.
 */
@Injectable()
export class NormalizerService implements INormalizer {
  /**
   * Normalise une offre brute vers le schéma pivot JobOffer.
   * 
   * @param raw Offre brute extraite de la source
   * @returns Offre normalisée selon le modèle domaine
   */
  toPivot(raw: RawJobOffer): JobOffer {
    return new JobOffer(
      this.generateId(raw),
      this.cleanText(raw.title),
      this.cleanText(raw.company),
      this.cleanText(raw.location),
      this.parseDate(raw.publishedAt),
      this.cleanUrl(raw.url),
      this.cleanText(raw.description),
      raw.source,
      raw.contractType ? this.normalizeContractType(raw.contractType) : undefined,
      raw.salary ? this.parseSalary(raw.salary) : undefined,
      this.extractSkills(raw.description)
    );
  }

  /**
   * Génère un ID unique pour l'offre (UUID v4).
   */
  private generateId(_raw: RawJobOffer): string {
    // Pour le MVP, on utilise un UUID simple
    // Post-MVP : hash (titre+entreprise+localisation) pour déduplication
    return uuidv4();
  }

  /**
   * Nettoie un texte : trim, suppression espaces multiples.
   */
  private cleanText(text: string): string {
    return text
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, ' ');
  }

  /**
   * Parse une date depuis différents formats possibles.
   */
  private parseDate(date: string | Date): Date {
    if (date instanceof Date) {
      return date;
    }

    // Essayer de parser différents formats de date
    const parsed = new Date(date);
    
    // Si la date est invalide, retourner la date actuelle
    if (isNaN(parsed.getTime())) {
      return new Date();
    }

    return parsed;
  }

  /**
   * Nettoie et valide une URL.
   */
  private cleanUrl(url: string): string {
    const cleaned = url.trim();
    
    // S'assurer que l'URL est complète
    if (!cleaned.startsWith('http')) {
      return `https://${cleaned}`;
    }
    
    return cleaned;
  }

  /**
   * Normalise le type de contrat selon des catégories standards.
   */
  private normalizeContractType(contractType: string): string {
    const normalized = contractType.toLowerCase().trim();
    
    // Mapping des types de contrat vers catégories standards
    if (normalized.includes('cdi')) return 'CDI';
    if (normalized.includes('cdd')) return 'CDD';
    if (normalized.includes('stage')) return 'Stage';
    if (normalized.includes('alternance') || normalized.includes('apprentissage')) return 'Alternance';
    if (normalized.includes('freelance') || normalized.includes('indépendant')) return 'Freelance';
    if (normalized.includes('intérim') || normalized.includes('interim')) return 'Intérim';
    
    // Retourner le type original si non reconnu
    return contractType;
  }

  /**
   * Parse un salaire depuis une chaîne de caractères.
   * Formats gérés : 
   * - "30K - 45K EUR" ou "30k - 45k €"
   * - "35000 EUR" ou "35 000 €"
   * - "40 000 - 50 000 € / an"
   * - "13,50 - 15,50 € / heure"
   */
  private parseSalary(salaryStr: string): { min?: number; max?: number; currency?: string } | undefined {
    const cleaned = salaryStr.trim().toLowerCase();
    
    // Extraire la devise
    let currency = 'EUR';
    if (cleaned.includes('€') || cleaned.includes('eur')) currency = 'EUR';
    if (cleaned.includes('$') || cleaned.includes('usd')) currency = 'USD';
    if (cleaned.includes('£') || cleaned.includes('gbp')) currency = 'GBP';
    
    // Détecter si c'est un salaire horaire
    const isHourly = cleaned.includes('heure') || cleaned.includes('hour') || cleaned.includes('/h');
    
    // Vérifier si on a des "K" (milliers)
    const hasK = cleaned.includes('k');
    
    // Nettoyer et extraire les nombres (garder les virgules pour les décimaux)
    const cleanedForNumbers = cleaned
      .replace(/\s+/g, '') // Supprimer les espaces
      .replace(/[€$£]/g, '') // Supprimer symboles monétaires
      .replace(/k/g, ''); // Supprimer K
    
    // Extraire les nombres (avec décimales)
    const numberMatches = cleanedForNumbers.match(/\d+[,.]?\d*/g);
    
    if (!numberMatches || numberMatches.length === 0) {
      return undefined;
    }
    
    const numbers = numberMatches.map(n => parseFloat(n.replace(',', '.')));
    
    // Si c'est horaire, convertir en annuel (base 35h/semaine sur 52 semaines)
    if (isHourly) {
      const annualHours = 35 * 52; // ~1820 heures/an
      if (numbers.length === 1) {
        return { min: Math.round(numbers[0] * annualHours), currency };
      }
      return {
        min: Math.round(numbers[0] * annualHours),
        max: Math.round(numbers[1] * annualHours),
        currency,
      };
    }
    
    // Déterminer le multiplicateur pour les salaires annuels
    let multiplier = 1;
    if (hasK) {
      multiplier = 1000;
    } else if (numbers[0] < 1000 && !hasK && !cleaned.includes(',')) {
      // Si le nombre est < 1000 sans virgule et pas de "K" explicite, 
      // c'est probablement en milliers (ex: "40" = "40K")
      multiplier = 1000;
    }
    
    if (numbers.length === 1) {
      return { min: Math.round(numbers[0] * multiplier), currency };
    }
    
    // Deux nombres = fourchette min-max
    return {
      min: Math.round(numbers[0] * multiplier),
      max: Math.round(numbers[1] * multiplier),
      currency,
    };
  }

  /**
   * Extrait les compétences techniques depuis la description.
   * Pour le MVP : liste basique de mots-clés communs.
   */
  private extractSkills(description: string): string[] {
    const commonSkills = [
      'javascript', 'typescript', 'python', 'java', 'react', 'angular', 'vue',
      'node.js', 'nestjs', 'express', 'django', 'spring', 'docker', 'kubernetes',
      'aws', 'azure', 'gcp', 'postgres', 'mongodb', 'mysql', 'redis',
      'git', 'ci/cd', 'agile', 'scrum', 'rest', 'graphql', 'microservices'
    ];
    
    const descLower = description.toLowerCase();
    const foundSkills = commonSkills.filter(skill => 
      descLower.includes(skill.toLowerCase())
    );
    
    return [...new Set(foundSkills)]; // Dédupliquer
  }
}

