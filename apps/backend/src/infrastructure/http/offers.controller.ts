import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ScrapeOffersUseCase } from '../../application/use-cases/scrape-offers.usecase';
import { ScrapeRequestDto } from './dto/scrape-request.dto';
import { ExportEmailDto } from './dto/export-email.dto';
import { EmailService } from '../services/email.service';

/**
 * Contrôleur REST pour les offres d'emploi.
 * Endpoints pour scraping et recherche d'offres.
 */
@Controller('api/offers')
export class OffersController {
  private readonly logger = new Logger(OffersController.name);

  constructor(
    private readonly scrapeOffersUseCase: ScrapeOffersUseCase,
    private readonly emailService: EmailService
  ) {}

  /**
   * POST /api/offers/scrape
   * Lance le scraping d'offres d'emploi pour une requête donnée.
   * 
   * @param dto Données de la requête (query)
   * @returns Liste des offres normalisées
   * 
   * @example
   * POST /api/offers/scrape
   * Body: { "query": "développeur typescript paris" }
   * 
   * Response: [
   *   {
   *     "id": "uuid",
   *     "title": "Développeur TypeScript",
   *     "company": "TechCorp",
   *     "location": "Paris",
   *     ...
   *   }
   * ]
   */
  @Post('scrape')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async scrapeOffers(@Body() dto: ScrapeRequestDto) {
    const sourcesInfo = dto.sources && dto.sources.length > 0 
      ? dto.sources.join(', ') 
      : 'toutes les sources';
    this.logger.log(`📥 Requête de scraping reçue : "${dto.query}" (sources: ${sourcesInfo})`);

    try {
      const offers = await this.scrapeOffersUseCase.execute(dto.query, dto.sources);
      
      this.logger.log(`📤 Réponse envoyée : ${offers.length} offres`);
      
      return {
        success: true,
        query: dto.query,
        sources: dto.sources || ['HelloWork', 'France Travail', 'Arbeitnow'],
        count: offers.length,
        offers,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      this.logger.error(`❌ Erreur lors du scraping : ${message}`);
      
      throw error;
    }
  }

  /**
   * POST /api/offers/export-email
   * Envoie les offres trouvées par email
   * 
   * @param dto Données de la requête (email, query, offers)
   * @returns Confirmation d'envoi
   */
  @Post('export-email')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async exportEmail(@Body() dto: ExportEmailDto) {
    this.logger.log(`📧 Requête d'export email : ${dto.offers.length} offres vers ${dto.email}`);

    try {
      await this.emailService.sendOffersEmail(dto.email, dto.query, dto.offers);
      
      return {
        success: true,
        message: `Email envoyé avec succès à ${dto.email}`,
        offersCount: dto.offers.length,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      this.logger.error(`❌ Erreur lors de l'envoi de l'email : ${message}`);
      
      throw error;
    }
  }
}

