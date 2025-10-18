# 🚀 Guide de démarrage rapide

Ce guide vous permet de démarrer rapidement le MVP Job Search.

## Prérequis

- Node.js 22.13.0
- npm 10.9.2+

## Installation (une seule fois)

```bash
# 1. Activer la bonne version de Node
nvm use 22.13.0

# 2. Installer les dépendances
npm install --cache=./.npm-cache --legacy-peer-deps
```

## Lancer l'application

### Option 1 : Tout en un seul terminal (recommandé pour le développement)

```bash
# Lancer backend et frontend simultanément
npm run backend:dev & npm run frontend:dev
```

### Option 2 : Deux terminaux séparés

**Terminal 1 - Backend :**
```bash
cd /Users/jdrouin/Prokov-Dev/poc_jobsearch
nvm use 22.13.0
npm run backend:dev
```

**Terminal 2 - Frontend :**
```bash
cd /Users/jdrouin/Prokov-Dev/poc_jobsearch
nvm use 22.13.0
npm run frontend:dev
```

## Accéder à l'application

- **Frontend** : http://localhost:4200
- **Backend API** : http://localhost:3000/api/offers/scrape

## Tester l'application

1. Ouvrir http://localhost:4200 dans votre navigateur
2. Entrer une recherche (exemple : "développeur javascript paris")
3. Cliquer sur "Rechercher"
4. Attendre 30 secondes à 2 minutes (scraping en cours)
5. Les offres s'affichent dans la liste

## Commandes utiles

### Développement
```bash
npm run backend:dev    # Lancer le backend en mode watch
npm run frontend:dev   # Lancer le frontend en mode watch
```

### Build production
```bash
npm run backend:build   # Compiler le backend
npm run frontend:build  # Compiler le frontend
```

### Tests
```bash
npm test               # Lancer tous les tests
nx test backend        # Tests backend uniquement
nx test frontend       # Tests frontend uniquement
```

### Linting
```bash
nx lint backend
nx lint frontend
```

## Structure des URLs

### Frontend
- Page principale : http://localhost:4200

### Backend (API)
- Scraping : `POST http://localhost:3000/api/offers/scrape`
  ```json
  {
    "query": "développeur typescript"
  }
  ```

## Résolution de problèmes

### Erreur de cache npm
```bash
npm install --cache=./.npm-cache --legacy-peer-deps
```

### Port déjà utilisé
Si le port 3000 ou 4200 est déjà utilisé :

**Backend (modifier dans apps/backend/env.example) :**
```bash
PORT=3001
```

**Frontend (modifier dans apps/frontend/project.json) :**
```json
"serve": {
  "options": {
    "port": 4201
  }
}
```

### Problème de compilation TypeScript
```bash
# Nettoyer le cache Nx
npx nx reset

# Recompiler
npm run backend:build
npm run frontend:build
```

## Prochaines étapes

1. Lire [README.md](./README.md) pour la documentation complète
2. Consulter [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) pour comprendre l'architecture
3. Lire [docs/SCRAPING_POLICY.md](./docs/SCRAPING_POLICY.md) avant toute mise en production

## Support

Pour toute question, consulter la documentation ou ouvrir une issue.

