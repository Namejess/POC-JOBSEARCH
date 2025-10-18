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

/**
 * Contrôleur REST pour les offres d'emploi.
 * Endpoints pour scraping et recherche d'offres.
 */
@Controller('api/offers')
export class OffersController {
  private readonly logger = new Logger(OffersController.name);

  constructor(private readonly scrapeOffersUseCase: ScrapeOffersUseCase) {}

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
    this.logger.log(`📥 Requête de scraping reçue : "${dto.query}"`);

    try {
      const offers = await this.scrapeOffersUseCase.execute(dto.query);
      
      this.logger.log(`📤 Réponse envoyée : ${offers.length} offres`);
      
      return {
        success: true,
        query: dto.query,
        count: offers.length,
        offers,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      this.logger.error(`❌ Erreur lors du scraping : ${message}`);
      
      throw error;
    }
  }
}

