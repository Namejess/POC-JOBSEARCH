# Job Search MVP - Agrégateur d'offres d'emploi

MVP d'une application web de recherche centralisée et d'agrégation d'offres d'emploi. Cette application agrège les offres depuis **3 sources** (HelloWork, France Travail, Arbeitnow), les normalise et les affiche dans une interface moderne.

## 🎯 Objectif

Centraliser la recherche d'offres d'emploi en scrapant automatiquement plusieurs job boards, normaliser les données et les présenter dans une interface unique et cohérente.

## 🏗️ Architecture

Le projet est organisé en **monorepo Nx** avec :

- **Backend (NestJS)** : API REST + scraping avec Crawlee
  - Clean Architecture (Domain / Application / Infrastructure)
  - Domain Driven Design
  - Principe SOLID
  
- **Frontend (Angular 19)** : Single Page Application
  - Standalone components
  - Signals pour la réactivité
  - Tailwind CSS pour le styling

### Structure du projet

```
poc_jobsearch/
├── apps/
│   ├── backend/               # API NestJS
│   │   └── src/
│   │       ├── domain/        # Entités et ports
│   │       ├── application/   # Use cases
│   │       ├── infrastructure/# Adapters et services
│   │       └── config/        # Configuration
│   └── frontend/              # Application Angular
│       └── src/
│           ├── app/
│           │   ├── domain/    # Types et interfaces
│           │   ├── features/  # Pages et composants
│           │   └── shared/    # Composants réutilisables
│           └── styles/        # Styles globaux (Tailwind)
├── docs/                      # Documentation
├── package.json
└── nx.json
```

## 📋 Prérequis

- **Node.js** : version 22.13.0 (utilisez `nvm use 22.13.0`)
- **npm** : version 10.9.2 ou supérieure

## 🚀 Installation

1. Cloner le dépôt :
```bash
git clone <repo-url>
cd poc_jobsearch
```

2. Utiliser la bonne version de Node :
```bash
nvm use 22.13.0
```

3. Installer les dépendances :
```bash
npm install --cache=./.npm-cache --legacy-peer-deps
```

## 🎬 Démarrage

### Lancer le backend (API + scraping)

```bash
npm run backend:dev
```

Le backend démarre sur **http://localhost:3000**

API disponible : `POST http://localhost:3000/api/offers/scrape`

### Lancer le frontend

Dans un autre terminal :

```bash
npm run frontend:dev
```

Le frontend démarre sur **http://localhost:4200**

### Utilisation

1. Ouvrir http://localhost:4200 dans votre navigateur
2. Entrer une recherche (ex: "développeur typescript paris")
3. Cliquer sur "Rechercher"
4. Le scraping démarre (cela peut prendre 30s à 2min)
5. Les offres s'affichent dans la liste

## 🧪 Tests

### Backend
```bash
nx test backend
```

### Frontend
```bash
nx test frontend
```

### Tous les tests
```bash
npm test
```

## 📦 Build

### Backend
```bash
npm run backend:build
```

### Frontend
```bash
npm run frontend:build
```

## ✨ Fonctionnalités

### Sources d'offres (3)
- **HelloWork** : Scraping web avec Playwright (jobs France)
- **France Travail** : API officielle (ex Pôle Emploi) - nécessite clés API gratuites
- **Arbeitnow** : API gratuite sans authentification (jobs tech Europe)

### Agrégation intelligente
- Scraping **multi-sources en parallèle** pour performance optimale
- Normalisation automatique vers un schéma pivot unifié
- Parsing avancé des salaires (annuels, horaires, fourchettes)
- Badge de source pour traçabilité

### Interface moderne
- **DataTable professionnelle** inspirée de TailAdmin
- Recherche full-text simple et rapide
- Affichage responsive avec Tailwind CSS
- Badges colorés pour types de contrat et sources

## 🛠️ Technologies utilisées

### Backend
- **NestJS** : Framework Node.js pour l'API
- **Crawlee + Playwright** : Scraping robuste avec JavaScript rendering
- **Fetch API** : Appels aux APIs REST (France Travail, Arbeitnow)
- **class-validator** : Validation des DTOs
- **TypeScript** : Typage strict

### Frontend
- **Angular 19** : Framework frontend moderne
- **Tailwind CSS** : Framework CSS utility-first
- **RxJS** : Programmation réactive
- **TypeScript** : Typage strict

### DevOps
- **Nx** : Outils de monorepo
- **Jest** : Tests unitaires
- **ESLint + Prettier** : Qualité de code

## ⚠️ Scraping responsable

Cette application respecte les bonnes pratiques de scraping :

- **User-Agent identifié** : `JobSearchMVP/1.0 (+contact@example.com)`
- **Respect du robots.txt** : Géré automatiquement par Crawlee
- **Throttling** : Maximum 1 requête concurrente, 20 requêtes/minute
- **Timeout** : 5 minutes maximum par scraping

⚠️ **Important** : Vérifiez les conditions d'utilisation de HelloWork avant toute utilisation en production. Ce projet est un **MVP à des fins éducatives**.

## 📚 Documentation technique

Consultez le dossier `docs/` pour plus de détails :

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) : Architecture détaillée
- [docs/SCRAPING_POLICY.md](docs/SCRAPING_POLICY.md) : Politique de scraping

## 🔮 Roadmap future

- [ ] Persistance des offres en base de données (Postgres + Prisma)
- [ ] Déduplication inter-sources par hash
- [ ] Ajout d'autres sources (Apec, Indeed, LinkedIn Jobs, etc.)
- [ ] Pagination et tri des résultats
- [ ] Filtres avancés (salaire, type de contrat, date, source)
- [ ] Sauvegarde des requêtes favorites
- [ ] Notifications par email
- [ ] Export CSV/PDF
- [ ] Authentification utilisateurs
- [ ] Cache des résultats pour éviter re-scraping

## 📄 Licence

Ce projet est à des fins éducatives uniquement.

## 👥 Contributeurs

Développé par Jerome DROUIN (@jdrouin) dans le cadre d'un MVP d'agrégateur d'offres d'emploi.
