# Configuration SMTP avec Resend (Recommandé)

## ✨ Pourquoi Resend ?

- ✅ **Gratuit** : 100 emails/jour (parfait pour le MVP)
- ✅ **Simple** : Juste une clé API, pas de configuration complexe
- ✅ **Moderne** : Interface claire et intuitive
- ✅ **Rapide** : Configuration en 2 minutes
- ✅ **Fiable** : Infrastructure professionnelle

## 🚀 Configuration en 3 étapes

### Étape 1 : Créer un compte Resend (gratuit)

1. Aller sur : https://resend.com/signup
2. S'inscrire avec votre email (jessy.drouin87@gmail.com)
3. Confirmer votre email

### Étape 2 : Créer une clé API

1. Une fois connecté, aller sur : https://resend.com/api-keys
2. Cliquer sur **"Create API Key"**
3. Donner un nom : `JobSearch MVP`
4. Permission : Laisser **"Sending access"** (par défaut)
5. Cliquer sur **"Add"**
6. **Copier la clé API** qui commence par `re_...`

   ⚠️ **Important** : Cette clé ne sera affichée qu'une seule fois !

### Étape 3 : Configurer le fichier .env

```bash
# Créer le fichier .env
cp apps/backend/env.example apps/backend/.env
```

Puis **éditer** `apps/backend/.env` :

```env
# Configuration SMTP pour Resend
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASS=re_VotreCleAPICopieeIci
SMTP_FROM=votre_email@example.com
```

**⚠️ IMPORTANT** : 
- `SMTP_USER` doit **toujours** être `resend` (ne pas changer !)
- `SMTP_PASS` doit être votre clé API Resend (celle qui commence par `re_...`)
- `SMTP_FROM` doit être votre adresse email

## 🎯 Installation et test

### 1. Installer les dépendances

```bash
npm install
```

### 2. Lancer l'application

```bash
# Terminal 1 - Backend
npm run backend:dev

# Terminal 2 - Frontend
npm run frontend:dev
```

### 3. Tester l'envoi d'email

1. Ouvrir http://localhost:4200
2. Faire une recherche d'offres (ex: "Développeur TypeScript")
3. Cliquer sur le bouton **"Envoyer par email"** (bouton vert)
4. ✅ Email envoyé à **jessy.drouin87@gmail.com** !

## 📬 Vérifier l'email

L'email arrivera dans votre boîte Gmail avec :
- Toutes les offres dans un tableau HTML formaté
- Badges colorés pour les types de contrat
- Liens directs vers chaque offre
- Design professionnel et responsive

**Astuce** : Si vous ne voyez pas l'email, vérifier les **spams** !

## 🔍 Monitoring (optionnel)

Vous pouvez voir tous vos emails envoyés dans le dashboard Resend :
- https://resend.com/emails

Utile pour débugger ou voir le statut de livraison !

## ⚠️ Dépannage

### Erreur "Authentication failed"

- Vérifier que vous avez bien copié la clé API (commence par `re_`)
- Vérifier qu'il n'y a pas d'espaces avant/après dans le `.env`
- La clé doit être celle avec permission "Sending access"

### L'email n'arrive pas

1. Vérifier les logs du backend pour voir s'il y a des erreurs
2. Vérifier les spams dans Gmail
3. Aller sur https://resend.com/emails pour voir si l'email a été envoyé

### Erreur "Connection refused"

- Vérifier que `SMTP_HOST=smtp.resend.com` et `SMTP_PORT=587`
- Vérifier votre connexion internet

## 📊 Exemple de configuration complète

```env
# apps/backend/.env

# Configuration du serveur
PORT=3000
NODE_ENV=development

# Configuration CORS
FRONTEND_URL=http://localhost:4200

# Configuration du scraping
SCRAPING_USER_AGENT=JobSearchMVP/1.0 (+contact@example.com)
SCRAPING_MAX_CONCURRENCY=1
SCRAPING_TIMEOUT_MS=300000
SCRAPING_MAX_REQUESTS_PER_MINUTE=20

# Configuration France Travail API (optionnel)
# FRANCE_TRAVAIL_CLIENT_ID=
# FRANCE_TRAVAIL_CLIENT_SECRET=

# Configuration SMTP pour Resend
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASS=re_abc123xyz789
SMTP_FROM=jessy.drouin87@gmail.com
```

## 🔒 Sécurité

- ✅ Ne **jamais** commit le fichier `.env` (déjà dans `.gitignore`)
- ✅ Ne pas partager votre clé API
- ✅ Vous pouvez révoquer/regénérer la clé à tout moment sur Resend

## 🆚 Alternatives

Si vous voulez utiliser un autre service :

### SendGrid (100 emails/jour gratuit)
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=votre_cle_api_sendgrid
```

### Mailgun (100 emails/jour gratuit)
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=votre_username_mailgun
SMTP_PASS=votre_password_mailgun
```

### Brevo / Sendinblue (300 emails/jour gratuit)
```env
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=votre_email_brevo
SMTP_PASS=votre_cle_api_brevo
```

Mais **Resend est le plus simple** ! 🎯

## 📚 Ressources

- Site Resend : https://resend.com
- Documentation : https://resend.com/docs
- Dashboard : https://resend.com/emails
- API Keys : https://resend.com/api-keys

---

✨ **C'est tout !** Resend est configuré et prêt à envoyer vos emails d'offres d'emploi !

