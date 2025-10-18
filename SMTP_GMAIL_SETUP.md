# Configuration SMTP pour Gmail

## 📧 Configuration simple avec Gmail

Gmail est très facile à configurer pour envoyer des emails depuis l'application !

## 🔐 Créer un mot de passe d'application

### Étape 1 : Activer la validation en 2 étapes (si pas déjà fait)

1. Aller sur : https://myaccount.google.com/security
2. Dans "Se connecter à Google", cliquer sur "Validation en 2 étapes"
3. Suivre les instructions pour l'activer

### Étape 2 : Générer un mot de passe d'application

1. Aller sur : https://myaccount.google.com/apppasswords
2. Dans "Sélectionner l'application", choisir **"Autre (nom personnalisé)"**
3. Entrer un nom : `JobSearch MVP`
4. Cliquer sur **"Générer"**
5. **Copier le mot de passe généré** (16 caractères sans espaces)

   ⚠️ **Important** : Ce mot de passe ne sera affiché qu'une seule fois !

## 📝 Configurer le fichier .env

### Créer le fichier .env

```bash
# Copier le template
cp apps/backend/env.example apps/backend/.env
```

### Modifier apps/backend/.env

Ouvrir le fichier et remplacer les valeurs SMTP :

```env
# Configuration SMTP pour Gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=jessy.drouin87@gmail.com
SMTP_PASS=votre_mot_de_passe_application_16_caracteres
SMTP_FROM=jessy.drouin87@gmail.com
```

**Remplacer** `SMTP_PASS` par le mot de passe d'application que vous avez copié à l'étape 2.

## 🚀 Installation et démarrage

### 1. Installer les dépendances

```bash
npm install
```

### 2. Lancer l'application

```bash
# Terminal 1 - Backend
npm run backend:dev

# Terminal 2 - Frontend (dans un autre terminal)
npm run frontend:dev
```

### 3. Tester l'envoi d'email

1. Ouvrir http://localhost:4200
2. Faire une recherche (ex: "Développeur TypeScript")
3. Cliquer sur **"Envoyer par email"**
4. Vérifier votre boîte Gmail (jessy.drouin87@gmail.com) ! 📬

## ✅ Email reçu

Vous recevrez un email HTML professionnel avec :
- Toutes les offres dans un tableau formaté
- Badges colorés pour les types de contrat et sources
- Liens directs vers chaque offre
- Design responsive et moderne

## ⚠️ Dépannage

### Erreur "Invalid login"

- Vérifiez que la validation en 2 étapes est activée
- Vérifiez que vous avez copié le bon mot de passe d'application
- Le mot de passe doit être les 16 caractères SANS espaces

### Erreur "Connection refused"

- Vérifiez que `SMTP_HOST=smtp.gmail.com` et `SMTP_PORT=587`
- Vérifiez votre connexion internet

### L'email n'arrive pas

- Vérifier les **spams** dans Gmail
- Vérifier les logs du backend pour voir s'il y a des erreurs

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

# Configuration SMTP pour Gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=jessy.drouin87@gmail.com
SMTP_PASS=abcdéfghijklmnop
SMTP_FROM=jessy.drouin87@gmail.com
```

## 🔒 Sécurité

- Ne **jamais** commit le fichier `.env` (déjà dans `.gitignore`)
- Ne pas partager votre mot de passe d'application
- Vous pouvez révoquer le mot de passe à tout moment sur Google Account

## 📚 Ressources

- Documentation Gmail SMTP : https://support.google.com/mail/answer/7126229
- Mots de passe d'application : https://myaccount.google.com/apppasswords
- Sécurité du compte : https://myaccount.google.com/security

---

✨ C'est tout ! Gmail est maintenant configuré pour envoyer vos emails d'offres d'emploi !

