import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// Controllers
import { OffersController } from './infrastructure/http/offers.controller';

// Use Cases
import { ScrapeOffersUseCase } from './application/use-cases/scrape-offers.usecase';

// Infrastructure Services
import { HelloWorkAdapter } from './infrastructure/sources/hellowork.adapter';
import { NormalizerService } from './infrastructure/services/normalizer.service';

// Domain Ports (interfaces - pas besoin d'import pour DI)

/**
 * Module principal de l'application backend.
 * Configure l'injection de dépendances selon Clean Architecture.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
  ],
  controllers: [OffersController],
  providers: [
    // Use Cases
    ScrapeOffersUseCase,

    // Infrastructure : Adapters
    {
      provide: 'ISourceAdapter',
      useClass: HelloWorkAdapter,
    },
    HelloWorkAdapter,

    // Infrastructure : Services
    {
      provide: 'INormalizer',
      useClass: NormalizerService,
    },
    NormalizerService,
  ],
})
export class AppModule {}

