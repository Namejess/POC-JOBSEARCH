# Politique de scraping responsable

## 🎯 Objectif

Ce document définit les règles et bonnes pratiques de scraping appliquées dans le projet Job Search MVP pour garantir un comportement **responsable**, **éthique** et **conforme** aux usages web.

## ⚖️ Légalité et conformité

### Conditions d'utilisation

⚠️ **Important** : Ce projet est un **MVP à des fins éducatives et de démonstration technique uniquement**.

Avant toute utilisation en production :

1. **Vérifier les CGU de HelloWork** et obtenir leur autorisation si nécessaire
2. **Respecter le RGPD** : minimiser les données personnelles collectées
3. **Consulter un conseiller juridique** pour valider la conformité

### Cadre légal

- Le scraping est **légal** dans certaines conditions (données publiques, pas de contournement de protections)
- Le scraping peut être **illégal** si :
  - Il contrevient aux CGU du site
  - Il contourne des mesures de protection (CAPTCHA, login obligatoire)
  - Il collecte des données personnelles sans consentement
  - Il nuit au service (DDoS involontaire)

## 🛡️ Mesures techniques de scraping responsable

### 1. User-Agent identifié

```
JobSearchMVP/1.0 (+contact@example.com)
```

- **Identifiable** : Le site cible peut nous identifier
- **Contact** : Email de contact en cas de problème
- **Version** : Permet de tracer les requêtes

Configuration dans `HelloWorkAdapter` :
```typescript
userAgent: 'JobSearchMVP/1.0 (+contact@example.com)'
```

### 2. Respect du robots.txt

Le fichier `robots.txt` indique les pages autorisées/interdites au scraping.

**Crawlee** gère automatiquement le respect du `robots.txt` :

```typescript
const crawler = new CheerioCrawler({
  // Crawlee vérifie automatiquement robots.txt
  // Pas besoin de configuration supplémentaire
});
```

Exemple de robots.txt :
```
User-agent: *
Disallow: /admin/
Disallow: /api/
Allow: /emplois
```

Si HelloWork interdit le scraping dans son robots.txt, **nous devons respecter cette directive**.

### 3. Throttling et rate limiting

Pour éviter de surcharger le serveur cible :

#### Concurrence limitée
```typescript
maxConcurrency: 1  // 1 seule requête à la fois
```

#### Requêtes par minute
```typescript
maxRequestsPerMinute: 20  // Max 20 requêtes/minute
```

#### Timeout
```typescript
requestHandlerTimeoutSecs: 60  // Timeout après 60s
```

#### Backoff exponentiel
En cas d'erreur répétée, Crawlee applique automatiquement un **backoff exponentiel** :
- 1ère erreur : attend 1s
- 2ème erreur : attend 2s
- 3ème erreur : attend 4s
- etc.

### 4. Détection et gestion des blocages

#### Codes HTTP à surveiller

- **429 Too Many Requests** : Rate limit dépassé → augmenter le délai
- **403 Forbidden** : Accès interdit → vérifier robots.txt
- **503 Service Unavailable** : Serveur surchargé → arrêter temporairement

#### Actions en cas de blocage

1. **Logging de l'erreur** avec contexte
2. **Arrêt du scraping** si blocage répété (> 3 fois)
3. **Notification** (email/Slack) pour action manuelle
4. **Retry avec backoff** uniquement si erreur transitoire

Configuration Crawlee :
```typescript
maxRequestRetries: 3,  // Max 3 tentatives
failedRequestHandler: async ({ request }, error) => {
  logger.error(`Échec de ${request.url}: ${error.message}`);
  // Logique de gestion d'erreur
}
```

### 5. Caching et scraping incrémental

Pour réduire la charge sur le serveur cible :

#### Pour le MVP
- Pas de cache (données fraîches à chaque recherche)

#### Post-MVP
- **Cache des pages** : éviter de re-scraper la même page
- **Scraping incrémental** : ne scraper que les nouvelles offres
- **TTL configurable** : invalider le cache après N heures

### 6. Heures creuses (Post-MVP)

Privilégier le scraping pendant les heures creuses du site :
- Nuit : 2h - 6h
- Week-end
- Éviter les heures de pointe (9h-11h, 14h-17h)

Configuration avec cron :
```typescript
// Planifier le scraping à 3h du matin
schedule.scheduleJob('0 3 * * *', async () => {
  await scrapeOffers();
});
```

## 📊 Monitoring et observabilité

### Métriques à surveiller

1. **Nombre de requêtes** par minute/heure/jour
2. **Taux d'erreur** (4xx, 5xx)
3. **Temps de réponse** moyen
4. **Taux de blocage** (429, 403)
5. **Volume de données** scrapées

### Logs structurés

Chaque requête doit être loggée avec :
- Timestamp
- URL cible
- Durée
- Status code
- User-Agent
- Nombre d'offres extraites

Exemple :
```json
{
  "timestamp": "2024-10-18T10:30:45Z",
  "url": "https://www.hellowork.com/fr-fr/emplois.html?k=dev",
  "duration_ms": 1245,
  "status": 200,
  "offers_count": 25,
  "user_agent": "JobSearchMVP/1.0"
}
```

### Alertes

Configurer des alertes si :
- Taux d'erreur > 10%
- Blocage détecté (429, 403)
- Temps de réponse > 5s
- Aucune offre extraite (possible changement de structure HTML)

## 🔒 Sécurité et données personnelles

### RGPD

1. **Minimisation** : Ne collecter que les données nécessaires
   - Titre, entreprise, lieu, description, salaire, type contrat
   - ❌ Pas d'emails, téléphones, noms de recruteurs

2. **Transparence** : Informer les utilisateurs de l'origine des données

3. **Durée de conservation** :
   - MVP : données en mémoire uniquement (volatiles)
   - Post-MVP : purge automatique après 30 jours

4. **Droit à l'effacement** : Permettre la suppression des données à la demande

### Sécurité

- **Pas de stockage de credentials** : pas de login/password
- **HTTPS uniquement** : communications chiffrées
- **Validation des URLs** : éviter les injections

## 🚨 Checklist avant mise en production

- [ ] Vérifier les CGU de HelloWork
- [ ] Contacter HelloWork si nécessaire (demande d'autorisation)
- [ ] Vérifier le robots.txt
- [ ] Configurer le User-Agent avec contact valide
- [ ] Activer le throttling (max 1 req/s, 20 req/min)
- [ ] Implémenter la gestion des erreurs 429/403
- [ ] Configurer les logs structurés
- [ ] Mettre en place le monitoring (Prometheus/Grafana)
- [ ] Configurer les alertes
- [ ] Documenter la politique de données (RGPD)
- [ ] Tester en environnement de staging
- [ ] Prévoir un kill switch (arrêt d'urgence)

## 📞 Contact en cas de problème

Si HelloWork détecte un problème avec notre scraping :

1. **Email de contact** : contact@example.com (à remplacer par un email valide)
2. **Kill switch** : Arrêt immédiat du scraping via variable d'environnement
3. **Dialogue** : Proposer une solution (API officielle, partenariat, etc.)

## 🌐 Alternatives au scraping

Avant de scraper, toujours vérifier s'il existe :

1. **API officielle** : HelloWork propose-t-il une API ?
2. **Partenariat** : Possibilité de partenariat commercial ?
3. **Flux RSS** : Flux de données structuré disponible ?
4. **Agrégateurs existants** : Services tiers autorisés ?

## 📚 Références

- [W3C Best Practices for Web Scraping](https://www.w3.org/community/webscaping/)
- [RGPD - CNIL](https://www.cnil.fr/fr/reglement-europeen-protection-donnees)
- [Robots Exclusion Protocol](https://www.robotstxt.org/)
- [Crawlee Documentation](https://crawlee.dev/)

## ✅ Résumé

Cette politique garantit :

✅ **Respect des sites cibles** : throttling, robots.txt, user-agent identifié  
✅ **Conformité légale** : RGPD, CGU, données minimisées  
✅ **Responsabilité technique** : monitoring, alertes, gestion d'erreurs  
✅ **Éthique** : dialogue avec les sites, alternatives au scraping  
✅ **Réversibilité** : kill switch, arrêt immédiat si demandé  

