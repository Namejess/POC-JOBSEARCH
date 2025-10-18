# Architecture du projet Job Search MVP

## Vue d'ensemble

Le projet suit une architecture **Clean Architecture** combinée avec les principes de **Domain Driven Design (DDD)** pour garantir la séparation des préoccupations, la maintenabilité et la testabilité.

## Principes architecturaux

### 1. Clean Architecture

L'application backend est organisée en couches concentriques :

```
┌─────────────────────────────────────┐
│     Infrastructure (Adapters)       │  ← Détails techniques
├─────────────────────────────────────┤
│     Application (Use Cases)         │  ← Logique applicative
├─────────────────────────────────────┤
│     Domain (Entities + Ports)       │  ← Cœur métier
└─────────────────────────────────────┘
```

#### Couche Domain (Cœur)
- **Entités** : `JobOffer`, types métier
- **Ports** : Interfaces (`ISourceAdapter`, `INormalizer`)
- **Règles métier** : Logique de validation, méthodes de matching

**Indépendante** de toute technologie externe.

#### Couche Application
- **Use Cases** : `ScrapeOffersUseCase`
- Orchestration des flux métier
- Dépend uniquement du Domain (via les ports)

#### Couche Infrastructure
- **Adapters** : `HelloWorkAdapter` (implémente `ISourceAdapter`)
- **Services** : `NormalizerService` (implémente `INormalizer`)
- **Controllers** : `OffersController` (API REST)
- Dépend du Domain et de l'Application

### 2. Dependency Inversion

Les dépendances pointent **vers l'intérieur** :

```
Infrastructure → Application → Domain
```

- Le Domain ne connaît rien de l'infrastructure
- L'Application dépend des abstractions (ports) du Domain
- L'Infrastructure implémente les ports définis par le Domain

### 3. Injection de dépendances (NestJS)

```typescript
@Module({
  providers: [
    ScrapeOffersUseCase,
    { provide: 'ISourceAdapter', useClass: HelloWorkAdapter },
    { provide: 'INormalizer', useClass: NormalizerService },
  ],
})
```

## Structure des répertoires

### Backend (`apps/backend/src/`)

```
src/
├── domain/
│   ├── entities/
│   │   ├── job-offer.entity.ts       # Entité métier
│   │   └── raw-job-offer.type.ts     # Type brut
│   └── ports/
│       ├── source-adapter.interface.ts  # Port scraping
│       └── normalizer.interface.ts      # Port normalisation
│
├── application/
│   └── use-cases/
│       └── scrape-offers.usecase.ts   # Use case principal
│
├── infrastructure/
│   ├── sources/
│   │   └── hellowork.adapter.ts       # Adapter HelloWork
│   ├── services/
│   │   └── normalizer.service.ts      # Service normalisation
│   └── http/
│       ├── offers.controller.ts        # API REST
│       └── dto/
│           └── scrape-request.dto.ts   # DTO validation
│
├── config/
│   └── (future : env schema, DI config)
│
├── app.module.ts
└── main.ts
```

### Frontend (`apps/frontend/src/`)

```
src/
├── app/
│   ├── domain/
│   │   └── job-offer.interface.ts     # Types métier
│   │
│   ├── features/
│   │   └── search/
│   │       ├── search.page.ts         # Container component
│   │       ├── search.service.ts      # Service HTTP
│   │       └── components/
│   │           └── offer-list.component.ts  # Presentation
│   │
│   ├── shared/
│   │   └── (future : composants UI réutilisables)
│   │
│   └── app.component.ts
│
├── environments/
│   ├── environment.ts
│   └── environment.prod.ts
│
└── styles/
    └── global.css                     # Tailwind + styles globaux
```

## Flux de données

### Scraping d'offres (Backend)

```
1. Client HTTP (POST /api/offers/scrape)
        ↓
2. OffersController (validation DTO)
        ↓
3. ScrapeOffersUseCase.execute(query)
        ↓
4. HelloWorkAdapter.scrape(query)  ← Crawlee + Cheerio
        ↓
5. NormalizerService.toPivot(rawOffer)
        ↓
6. Retour des JobOffer[] normalisées
```

### Affichage des résultats (Frontend)

```
1. SearchPageComponent (formulaire)
        ↓
2. SearchService.scrapeOffers(query)
        ↓
3. HTTP POST /api/offers/scrape
        ↓
4. Backend (voir ci-dessus)
        ↓
5. Réponse ScrapeResponse { offers: JobOffer[] }
        ↓
6. Mise à jour du state (signals)
        ↓
7. OfferListComponent (affichage Tailwind)
```

## Principes SOLID appliqués

### Single Responsibility Principle (SRP)
- **HelloWorkAdapter** : Scraping uniquement
- **NormalizerService** : Normalisation uniquement
- **ScrapeOffersUseCase** : Orchestration du flux

### Open/Closed Principle (OCP)
- Ajout d'une nouvelle source = création d'un nouvel adapter implémentant `ISourceAdapter`
- Pas de modification du use case

### Liskov Substitution Principle (LSP)
- Tout adapter implémentant `ISourceAdapter` peut être utilisé par le use case

### Interface Segregation Principle (ISP)
- `ISourceAdapter` : contrat minimal pour le scraping
- `INormalizer` : contrat minimal pour la normalisation

### Dependency Inversion Principle (DIP)
- Le use case dépend des abstractions (`ISourceAdapter`, `INormalizer`)
- Pas de dépendance directe aux implémentations concrètes

## Technologies et outils

### Backend
- **NestJS** : Framework structuré avec DI native
- **Crawlee** : Framework de scraping avec throttling, retry, respect robots.txt
- **Cheerio** : Parsing HTML léger
- **class-validator** : Validation des DTOs
- **TypeScript strict** : Sécurité du typage

### Frontend
- **Angular 19** : Framework moderne avec standalone components
- **Signals** : Réactivité fine-grained
- **Tailwind CSS** : Utility-first CSS
- **HttpClient** : Requêtes HTTP

### DevOps
- **Nx** : Monorepo tooling, caching, task orchestration
- **Jest** : Tests unitaires et d'intégration
- **ESLint + Prettier** : Qualité de code

## Évolutions futures

### Backend
1. **Persistance** : Ajouter un `IJobOfferRepository` avec implémentation Prisma
2. **Déduplication** : Service de déduplication par hash
3. **Scoring** : Service de scoring de pertinence
4. **Multi-sources** : Nouveaux adapters (Apec, Indeed, LinkedIn)
5. **Queue** : Job queue (BullMQ) pour scraping asynchrone

### Frontend
1. **State management** : NGXS ou NgRx si nécessaire
2. **Routing** : Angular Router pour navigation multi-pages
3. **Filtres avancés** : Composants de filtrage (salaire, contrat, date)
4. **Authentification** : Guards et services d'auth

### Architecture
1. **Event-driven** : Domain events pour découplage
2. **CQRS** : Séparation lecture/écriture si nécessaire
3. **Microservices** : Découpage en services indépendants (scraping, API, notifs)

## Diagrammes

### Diagramme de classes (simplifié)

```
┌─────────────────────┐
│   JobOffer          │
│  (Domain Entity)    │
└─────────────────────┘
          ▲
          │ crée
          │
┌─────────────────────┐         ┌─────────────────────┐
│  INormalizer        │         │  ISourceAdapter     │
│  (Domain Port)      │         │  (Domain Port)      │
└─────────────────────┘         └─────────────────────┘
          ▲                               ▲
          │ implémente                    │ implémente
          │                               │
┌─────────────────────┐         ┌─────────────────────┐
│ NormalizerService   │         │ HelloWorkAdapter    │
│ (Infrastructure)    │         │ (Infrastructure)    │
└─────────────────────┘         └─────────────────────┘
          ▲                               ▲
          │ injecté dans                  │ injecté dans
          │                               │
          └───────────┬───────────────────┘
                      │
          ┌───────────────────────┐
          │ ScrapeOffersUseCase   │
          │   (Application)       │
          └───────────────────────┘
                      ▲
                      │ appelé par
                      │
          ┌───────────────────────┐
          │  OffersController     │
          │  (Infrastructure)     │
          └───────────────────────┘
```

## Résumé

Cette architecture garantit :

✅ **Testabilité** : Chaque couche est testable indépendamment  
✅ **Maintenabilité** : Séparation claire des responsabilités  
✅ **Évolutivité** : Ajout de features sans toucher au cœur métier  
✅ **Indépendance technologique** : Le Domain ne dépend d'aucune lib externe  
✅ **Qualité de code** : Respect des principes SOLID et Clean Code  

