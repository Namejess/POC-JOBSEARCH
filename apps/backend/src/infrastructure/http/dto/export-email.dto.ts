import { IsEmail, IsString, IsNotEmpty, IsArray } from 'class-validator';
import { JobOffer } from '../../../domain/entities/job-offer.entity';

/**
 * DTO pour l'export et l'envoi des offres par email.
 */
export class ExportEmailDto {
  /**
   * Adresse email du destinataire
   */
  @IsEmail({}, { message: 'L\'adresse email n\'est pas valide' })
  @IsNotEmpty({ message: 'L\'adresse email est requise' })
  email!: string;

  /**
   * Requête de recherche utilisée
   */
  @IsString({ message: 'La requête doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'La requête est requise' })
  query!: string;

  /**
   * Liste des offres à envoyer
   */
  @IsArray({ message: 'Les offres doivent être un tableau' })
  offers!: JobOffer[];
}

