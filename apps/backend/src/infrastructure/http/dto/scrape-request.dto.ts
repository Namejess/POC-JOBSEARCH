import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

/**
 * DTO pour la requête de scraping d'offres.
 * Valide les paramètres d'entrée de l'API.
 */
export class ScrapeRequestDto {
  /**
   * Termes de recherche (métier, mots-clés, compétences)
   * 
   * @example "développeur javascript paris"
   */
  @IsString({ message: 'La requête doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'La requête ne peut pas être vide' })
  @MinLength(2, { message: 'La requête doit contenir au moins 2 caractères' })
  @MaxLength(200, { message: 'La requête ne peut pas dépasser 200 caractères' })
  query!: string;
}

