# 🚨 CORRECTIF DE SÉCURITÉ - Credentials exposés

## ⚠️ Problème détecté

GitHub a détecté des credentials SMTP (clé API Resend) dans l'historique Git.

## ✅ Actions correctives immédiates

### 1. Révoquer IMMÉDIATEMENT la clé API Resend exposée

🔴 **URGENT** : Votre clé API Resend a été détectée par GitHub !

1. Aller sur : https://resend.com/api-keys
2. **Supprimer/Révoquer** la clé API exposée
3. **Créer une nouvelle clé** API
4. Mettre à jour `apps/backend/.env` avec la nouvelle clé

### 2. Vérifier le .gitignore

✅ Le `.gitignore` a été mis à jour pour ignorer tous les fichiers `.env` :

```gitignore
# Environment - CRITIQUE : Ne jamais commit les .env !
.env
.env.local
.env.*.local
apps/backend/.env
apps/backend/.env.local
apps/backend/.env.*.local
**/.env
**/.env.local
```

### 3. Nettoyer l'historique Git (OPTIONNEL mais recommandé)

⚠️ **Si le repo est public ou partagé**, il faut nettoyer l'historique Git pour retirer complètement les credentials.

#### Option A : Utiliser BFG Repo-Cleaner (recommandé)

```bash
# Installer BFG
brew install bfg

# Nettoyer les credentials de l'historique
git clone --mirror https://github.com/votre-user/poc_jobsearch.git
cd poc_jobsearch.git
bfg --replace-text <(echo 're_VOTRE_CLE_EXPOSEE==>***REMOVED***')
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --force
```

#### Option B : Utiliser git filter-branch

```bash
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch apps/backend/.env" \
  --prune-empty --tag-name-filter cat -- --all

git push origin --force --all
```

#### Option C : Recommencer avec un nouveau repo (plus simple)

Si le repo n'a pas d'historique important :

```bash
# Sauvegarder le code actuel
cp -r ../poc_jobsearch ../poc_jobsearch_backup

# Supprimer l'historique git
rm -rf .git

# Réinitialiser
git init
git add .
git commit -m "Initial commit - credentials nettoyées"

# Pousser sur un nouveau repo ou forcer le push
git remote add origin https://github.com/votre-user/poc_jobsearch.git
git push -f origin main
```

### 4. Mettre à jour le fichier .env local

```bash
# Copier le template
cp apps/backend/env.example apps/backend/.env

# Éditer et ajouter la NOUVELLE clé API Resend
nano apps/backend/.env
```

### 5. Vérifier que .env n'est pas tracké

```bash
git status apps/backend/.env
# Doit afficher : "fatal: pathspec 'apps/backend/.env' did not match any files"
# Ou être dans "Untracked files" seulement
```

### 6. Avant chaque commit, vérifier

```bash
# Vérifier qu'aucun secret n'est inclus
git diff --cached | grep -i "password\|secret\|api.key\|smtp"

# Utiliser git-secrets (optionnel)
brew install git-secrets
git secrets --install
git secrets --register-aws
```

## 📋 Checklist de sécurité

- [ ] ✅ Clé API Resend révoquée
- [ ] ✅ Nouvelle clé API créée
- [ ] ✅ `apps/backend/.env` mis à jour avec la nouvelle clé
- [ ] ✅ `.gitignore` mis à jour (déjà fait)
- [ ] ✅ Vérifier que `.env` n'est pas dans `git status`
- [ ] 🔴 Nettoyer l'historique Git (si repo public/partagé)
- [ ] ✅ Créer un nouveau commit sans credentials

## 🔒 Bonnes pratiques futures

1. **Toujours** vérifier `.gitignore` avant de créer des fichiers de config
2. **Jamais** commit de fichiers contenant :
   - Mots de passe
   - Clés API
   - Tokens
   - Secrets
   - Credentials
3. Utiliser des **placeholders** dans les fichiers `.example`
4. Utiliser **git-secrets** ou **pre-commit hooks** pour détecter les secrets
5. Scanner avec **GitGuardian** ou **TruffleHog** avant de push

## 📚 Ressources

- Révoquer clés Resend : https://resend.com/api-keys
- Git-secrets : https://github.com/awslabs/git-secrets
- BFG Repo-Cleaner : https://rtyley.github.io/bfg-repo-cleaner/
- GitHub secret scanning : https://docs.github.com/en/code-security/secret-scanning

---

✅ **Une fois la clé révoquée et l'historique nettoyé, vous serez en sécurité !**

