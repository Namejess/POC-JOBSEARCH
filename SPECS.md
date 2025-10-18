Voici un cahier des charges complet, structuré sur le modèle fourni, pour une application web de recherche centralisée et d’automatisation autour des offres d’emploi.

# Cahier des Charges — Agrégateur et Automation de Candidatures

### Contexte
L’objectif est de centraliser et automatiser la recherche d’annonces d’emploi à partir de multiples job boards, en normalisant les données, en offrant des filtres, exports, statistiques, et des notifications planifiées, afin d’éliminer les opérations manuelles répétitives et chronophages actuellement nécessaires sur chaque site séparément [1].

***

### Objectifs
- Centraliser la collecte d’annonces issues de requêtes (métier, lieu, date, mots-clés) sur plusieurs job boards au sein d’un référentiel unifié et interrogeable [1].  
- Permettre le scraping/ingestion conforme et robuste, la déduplication et la normalisation des annonces pour analyses et exports [1].  
- Offrir des exports (CSV, PDF) et des notifications programmées (ex. email quotidien à 9h) selon des paramètres utilisateurs [1].

***

### Fonctionnalités

#### Requêtes et métamodèle
- Création et sauvegarde de requêtes multi-critères: métier/intitulé, mots-clés obligatoires/exclus, lieu et rayon, type de contrat, expérience, salaire, date de publication, télétravail, tags personnalisés [1].  
- Scopes de job boards activables par requête (ex. HelloWork, Apec, Indeed, LinkedIn Jobs, Pôle Emploi), avec profils d’authentification/configuration par source si requis [1].  

#### Collecte et ingestion
- Connecteurs par source: scraping HTML responsable et tolérant aux changements, ou APIs officielles quand disponibles; gestion de robots.txt et backoff [1].  
- Scheduling d’ingestion: manuel, à la demande, ou planifié (cron), avec parallélisation contrôlée et quotas par domaine pour éviter le blocage [1].  

#### Normalisation et qualité
- Schéma pivot d’annonce: titre, entreprise, localisation structurée, rémunération (min/max/devise), type de contrat, expérience, description nettoyée, compétences extraites, date publication, URL canonical, identifiants source, géocodage [1].  
- Déduplication multi-sources par empreintes (titre+entreprise+localisation+fenêtre temporelle) et fuzzy matching contrôlé, avec traçabilité des sources fusionnées [1].  

#### Recherche et filtrage
- Moteur de recherche full-text et par facettes (contrat, entreprise, ville, salaire, date), tri multi-clés, sauvegarde de vues et favoris [1].  
- Filtre “nouvelles depuis dernière visite” et mise en évidence des changements (ex. salaire mis à jour) [1].  

#### Enrichissement et scoring
- Extraction de compétences par NER/regex, score de pertinence par correspondance mots-clés, pondération paramétrable par l’utilisateur [1].  
- Détection de doublons inter-sources et regroupement d’offres équivalentes sous une “fiche agrégée” [1].  

#### Historisation et audit
- Journal des collectes (source, durée, volume, erreurs), versioning des annonces et horodatage des champs clés, provenance complète (lineage) [1].  
- Statuts d’annonce (active, retirée, expirée) avec détection d’indisponibilité et archivage [1].  

#### Exports
- Export CSV personnalisable (sélection de colonnes, séparateur, encodage) et PDF (mise en page avec filtres et regroupements) [1].  
- Exports programmés liés aux requêtes sauvegardées, stockés et téléchargeables avec historique des générations [1].  

#### Notifications
- Règles d’alertes: email quotidien/hebdo à heure fixe, webhook, RSS privé, avec seuils (ex. min. 10 nouvelles annonces) [1].  
- Contenu d’alerte paramétrable: top N annonces, résumé statistique, liens vers la vue filtrée [1].  

#### Collaboration et suivi
- Favoris, tags personnels, états (à postuler, en cours, relancé), notes privées; export du pipeline personnel [1].  
- Partage en lecture d’une requête ou d’un tableau de bord via lien sécurisé, sans fuite d’identifiants source [1].  

***

### Contraintes techniques
- Respect des conditions d’utilisation des job boards, priorisation des APIs officielles quand disponibles, respect robots.txt, throttling, user-agent identifié [1].  
- Résilience aux changements DOM: sélecteurs robustes, tests d’intégration par source, feature flags pour désactiver une source en panne [1].  
- Performance: ingestion incrémentale, indexation adaptée (full-text + facettes), pagination serveur, cache des pages sources [1].  
- Sécurité: stockage chiffré des secrets, cloisonnement des jobs, protection CSRF/XSS, RGPD (données personnelles minimisées, droit à l’effacement) [1].  

***

### Architecture recommandée
- Clean Architecture: Domain (entités Annonce, Source, Requête, Collecte, Export, Notification), Application (use cases), Infrastructure (connecteurs, persistance, email), Presentation (SPA + API) [1].  
- Ports & Adapters pour isoler chaque source; module “Normalizer” commun; pipeline ETL orchestré (queue + workers) avec retrys/idempotence [1].  

***

### Modèle de données (pivot)
- Annonce: id, hash dédup, titre, entreprise, localisation normalisée, salaire_min/max/devise/période, contrat, expérience, télétravail, description_clean, compétences, date_pub, url_canonique, sources[], statut, timestamps [1].  
- Source: id, nom, type (API/HTML), paramètres, quotas, état, dernières erreurs, version extracteur [1].  
- Requête: id, propriétaire, critères, sources activées, planifications, notifications, score config [1].  

***

### UX/UI clés
- Éditeur de requêtes avec aperçu live du volume estimé; suggestions de filtres et mots-clés exclus [1].  
- Tableau de résultats avec facettes, colonnes configurables, preview description, badges de nouveautés, regroupements par entreprise [1].  
- Tableaux de bord: volume par source, évolutions quotidiennes, top entreprises, répartition contrat/lieu, temps de collecte, erreurs [1].  

***

### Tests et validation
- Tests unitaires des extracteurs (fixtures HTML/API), tests contractuels par source, tests de déduplication avec datasets synthétiques [1].  
- Tests de performance: latence d’ingestion, taille d’index, coût des facettes; campagnes de non-régression à chaque changement DOM détecté [1].  

***

### SLA internes et observabilité
- Cibles: 99.5% disponibilité API, alertes sous 5 minutes en cas d’échec source, ingestion incrémentale < 15 min pour 10k nouvelles annonces [1].  
- Observabilité: logs structurés, métriques par source (taux succès, erreur, débit), traces des pipelines, tableaux d’erreurs actionnables [1].  

***

### Sécurité, conformité, éthique
- Respect RGPD: minimisation, base légale, durée de conservation, journalisation d’accès, export/suppression de compte [1].  
- Scraping responsable: rate limiting, heures creuses, backoff exponentiel, rotation d’IP si autorisé et documenté, arrêt automatique si blocage répété [1].  

***

### Roadmap simplifiée
1. MVP mono-source (HelloWork): requêtes sauvegardées, ingestion incrémentale, normalisation, recherche, export CSV, notification email quotidienne [1].  
2. Ajout déduplication inter-sources et scoring; PDF; tableau de bord; favoris et tags [1].  
3. Connecteurs additionnels (Apec, Indeed, LinkedIn Jobs, Pôle Emploi) avec feature flags et tests contractuels [1].  
4. Optimisation perf et observabilité; API publique et webhooks; flux RSS privés [1].  

***

### Annexes
- Liste des champs pivot et mapping par source (document de mapping par connecteur) [1].  
- Politique de scraping responsable et checklist de conformité par source [1].  
- Stratégies de tests d’extracteurs et trousse d’outillage (fixtures, diff DOM, canary jobs) [1].

Sources
[1] SPECS.md https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/54314045/29298a76-309e-4c43-b02a-df4c330655d4/SPECS.md
