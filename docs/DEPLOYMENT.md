# Déploiement CI/CD pour logger-multi-db

Guide complet pour configurer le déploiement automatique sur npm avec GitHub Actions.

---

## 🚀 Vue d'ensemble

Le projet utilise **GitHub Actions** pour :
- ✅ Tests automatiques sur Node.js 18, 20, 22
- ✅ Build et validation TypeScript
- ✅ Publication automatique sur npm
- ✅ Création de GitHub Releases
- ✅ Vérification de sécurité

---

## 📋 Prérequis

### 1. Compte npm

Créez un compte sur [npmjs.com](https://www.npmjs.com) si vous n'en avez pas.

### 2. Token npm

1. Connectez-vous sur [npmjs.com](https://www.npmjs.com)
2. Allez dans **Account Settings** → **Access Tokens**
3. Cliquez sur **Generate New Token** → **Classic Token**
4. Sélectionnez **Automation** (pour CI/CD)
5. Copiez le token (commençant par `npm_...`)

### 3. Configurer le secret GitHub

1. Allez sur votre repo GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. Cliquez sur **New repository secret**
4. Nom : `NPM_TOKEN`
5. Valeur : Collez votre token npm
6. Cliquez sur **Add secret**

---

## 🔧 Configuration du projet

### 1. Vérifier package.json

Assurez-vous que votre `package.json` contient :

```json
{
  "name": "logger-multi-db",
  "version": "1.0.8",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],
  "scripts": {
    "build": "tsc",
    "test": "node --test",
    "prepublishOnly": "npm run build"
  }
}
```

### 2. Fichier .npmignore (optionnel)

Créez `.npmignore` pour exclure les fichiers inutiles :

```
# Sources
src/
tests/
examples/

# Config
.github/
.vscode/
tsconfig.json
.prettierrc
.eslintrc

# Build
node_modules/
*.log
.DS_Store

# Docs (garder seulement README)
docs/
*.md
!README.md
!LICENSE.md
```

---

## 🎯 Workflows GitHub Actions

Le projet a **2 workflows** :

### 1. CI - Tests automatiques (`.github/workflows/ci.yml`)

**Déclenchement :**
- Push sur `main`, `develop`, ou branches `claude/**`
- Pull Requests vers `main` ou `develop`

**Actions :**
- ✅ Tests sur Node.js 18, 20, 22
- ✅ Build TypeScript
- ✅ Vérification du code
- ✅ Audit de sécurité

### 2. Publish - Publication npm (`.github/workflows/publish.yml`)

**Déclenchement :**
- Création d'une GitHub Release
- Déclenchement manuel (workflow_dispatch)

**Actions :**
- ✅ Tests et build
- ✅ Bump de version (si manuel)
- ✅ Création GitHub Release
- ✅ Publication sur npm avec provenance
- ✅ Notifications

---

## 📦 Méthodes de déploiement

### Méthode 1 : Déclenchement manuel (Recommandé)

C'est la méthode la plus simple pour publier.

1. Allez sur GitHub → **Actions** → **Publish to npm**
2. Cliquez sur **Run workflow**
3. Sélectionnez le type de version :
   - `patch` : 1.0.8 → 1.0.9 (bug fixes)
   - `minor` : 1.0.8 → 1.1.0 (nouvelles fonctionnalités)
   - `major` : 1.0.8 → 2.0.0 (breaking changes)
   - `prerelease` : 1.0.8 → 1.0.9-0
4. Cliquez sur **Run workflow**

**Le workflow va automatiquement :**
- ✅ Incrémenter la version dans `package.json`
- ✅ Créer un commit de release
- ✅ Créer un tag Git
- ✅ Créer une GitHub Release
- ✅ Publier sur npm

### Méthode 2 : Via GitHub Release

1. Sur GitHub → **Releases** → **Draft a new release**
2. Créez un nouveau tag : `v1.0.9`
3. Titre : `Release v1.0.9`
4. Description : Décrivez les changements
5. Cliquez sur **Publish release**

Le workflow se déclenchera automatiquement et publiera sur npm.

### Méthode 3 : En local (Manuel)

```bash
# 1. Assurez-vous d'être sur main à jour
git checkout main
git pull origin main

# 2. Bump la version
npm version patch  # ou minor, major

# 3. Build
npm run build

# 4. Login npm (si pas déjà connecté)
npm login

# 5. Publier
npm publish --access public

# 6. Push les tags
git push --follow-tags
```

---

## 🔐 Sécurité et bonnes pratiques

### 1. npm Provenance

Le workflow utilise `--provenance` pour :
- ✅ Prouver que le package vient de votre repo GitHub
- ✅ Augmenter la confiance des utilisateurs
- ✅ Afficher un badge vérifié sur npm

### 2. Access Public

```bash
npm publish --access public
```

Obligatoire pour les packages publics gratuits.

### 3. Protection des secrets

- ❌ Ne commitez **JAMAIS** votre token npm
- ✅ Utilisez **GitHub Secrets**
- ✅ Utilisez des tokens **Automation** (pas Classic)
- ✅ Révoquez les tokens inutilisés

### 4. Tests avant publication

Le workflow exécute automatiquement :
```bash
npm ci           # Installation propre
npm test         # Tests
npm run build    # Build
```

---

## 📊 Scripts npm utiles

Ajoutez ces scripts dans `package.json` :

```json
{
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "test": "node --test",
    "prepublishOnly": "npm run build",
    "prepack": "npm run build",

    "release:patch": "npm version patch && git push --follow-tags",
    "release:minor": "npm version minor && git push --follow-tags",
    "release:major": "npm version major && git push --follow-tags",

    "publish:dry": "npm publish --dry-run",
    "publish:check": "npm pack --dry-run && npm notice"
  }
}
```

**Utilisation :**

```bash
# Tester la publication sans publier
npm run publish:dry

# Bump version et push
npm run release:patch

# Vérifier ce qui sera publié
npm run publish:check
```

---

## 🔍 Vérification avant publication

### 1. Checklist manuelle

Avant de publier, vérifiez :

- [ ] `package.json` à jour (name, version, description)
- [ ] `README.md` complet et à jour
- [ ] `LICENSE` présent
- [ ] Build fonctionne : `npm run build`
- [ ] Tests passent : `npm test`
- [ ] Fichier `dist/` contient tous les fichiers nécessaires
- [ ] `.npmignore` ou `files` dans package.json configuré

### 2. Test en local

```bash
# Simuler la publication
npm pack --dry-run

# Créer un tarball local
npm pack

# Tester le package en local
cd /tmp
npm init -y
npm install /chemin/vers/logger-multi-db-1.0.8.tgz

# Tester l'import
node -e "import('logger-multi-db').then(console.log)"
```

### 3. Vérifier les exports

```bash
# Vérifier que tous les exports fonctionnent
node -e "
  import('logger-multi-db').then(pkg => {
    console.log('✅ Main export:', Object.keys(pkg));
  });
"

node -e "
  import('logger-multi-db/adapters/mongodb').then(pkg => {
    console.log('✅ MongoDB adapter:', Object.keys(pkg));
  });
"
```

---

## 🐛 Dépannage

### Erreur : "npm ERR! 403 Forbidden"

**Cause :** Token npm invalide ou manquant

**Solution :**
1. Vérifiez que `NPM_TOKEN` est bien configuré dans GitHub Secrets
2. Vérifiez que le token n'a pas expiré
3. Régénérez un nouveau token si nécessaire

### Erreur : "version already exists"

**Cause :** La version dans `package.json` existe déjà sur npm

**Solution :**
```bash
# Bump la version
npm version patch

# Ou manuellement dans package.json
# 1.0.8 → 1.0.9
```

### Erreur : "missing files in package"

**Cause :** Le dossier `dist/` n'est pas inclus dans la publication

**Solution :**
Vérifiez `package.json` :
```json
{
  "files": ["dist", "README.md", "LICENSE"]
}
```

### Le workflow ne se déclenche pas

**Cause :** Permissions GitHub Actions insuffisantes

**Solution :**
1. GitHub → **Settings** → **Actions** → **General**
2. Workflow permissions → **Read and write permissions**
3. ✅ Cochez "Allow GitHub Actions to create and approve pull requests"

### Erreur de build TypeScript

**Cause :** Erreurs de compilation TypeScript

**Solution :**
```bash
# Vérifier localement
npm run build

# Voir les erreurs TypeScript
npx tsc --noEmit
```

---

## 📈 Monitoring et analytics

### 1. npm Download Stats

Consultez les statistiques :
- https://npm-stat.com/charts.html?package=logger-multi-db
- https://npmtrends.com/logger-multi-db

### 2. GitHub Insights

- **Actions** → Voir l'historique des workflows
- **Insights** → **Traffic** : Clones, vues, visiteurs
- **Insights** → **Community** : Stars, forks, watchers

### 3. npm Package Page

- https://www.npmjs.com/package/logger-multi-db
- Badge de provenance ✅
- Statistiques de téléchargement
- Versions publiées

---

## 🎯 Workflow type de release

### Scénario : Publier une nouvelle version

```bash
# 1. Créer une branche pour votre feature
git checkout -b feature/awesome-feature

# 2. Développer et committer
git add .
git commit -m "feat: add awesome feature"

# 3. Créer une Pull Request
git push origin feature/awesome-feature

# 4. Merger dans main après review
# (via GitHub UI)

# 5. Sur main, déclencher le workflow manuellement
# GitHub → Actions → Publish to npm → Run workflow
# Sélectionner "minor" (car nouvelle feature)

# 6. Le workflow fait automatiquement :
# - npm version minor (1.0.8 → 1.1.0)
# - git commit + tag
# - GitHub Release
# - npm publish

# 7. Vérifier sur npm
# https://www.npmjs.com/package/logger-multi-db
```

---

## 🔄 Release automatique avec semantic-release (Avancé)

Pour automatiser complètement les releases basées sur les commits :

### 1. Installer semantic-release

```bash
npm install --save-dev semantic-release @semantic-release/git @semantic-release/changelog
```

### 2. Créer `.releaserc.json`

```json
{
  "branches": ["main"],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    "@semantic-release/npm",
    "@semantic-release/git",
    "@semantic-release/github"
  ]
}
```

### 3. Convention de commits

```bash
# Patch (1.0.8 → 1.0.9)
git commit -m "fix: correct bug in logger"

# Minor (1.0.8 → 1.1.0)
git commit -m "feat: add new adapter"

# Major (1.0.8 → 2.0.0)
git commit -m "feat!: breaking API change"
```

---

## 📚 Ressources

### Documentation
- [npm Publishing Guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Semantic Versioning](https://semver.org/)

### Outils
- [npm-check-updates](https://github.com/raineorshine/npm-check-updates)
- [np - Better npm publish](https://github.com/sindresorhus/np)
- [semantic-release](https://github.com/semantic-release/semantic-release)

---

## ✅ Checklist finale

Avant votre première publication :

- [ ] Token npm créé et ajouté dans GitHub Secrets
- [ ] Workflows GitHub Actions testés
- [ ] `package.json` complet et valide
- [ ] README.md professionnel
- [ ] LICENSE ajoutée (MIT recommandé)
- [ ] Build fonctionne (`npm run build`)
- [ ] Tests passent (`npm test`)
- [ ] Package testé localement (`npm pack`)
- [ ] Tous les exports fonctionnent
- [ ] Documentation à jour

**Vous êtes prêt à publier ! 🚀**

---

## 🎉 Après la publication

1. **Vérifiez sur npm :**
   - https://www.npmjs.com/package/logger-multi-db
   - Badge de provenance présent ✅

2. **Testez l'installation :**
   ```bash
   npm install logger-multi-db
   ```

3. **Annoncez sur :**
   - Twitter / X
   - Reddit (r/node, r/javascript)
   - Dev.to
   - Votre blog

4. **Ajoutez des badges au README :**
   ```markdown
   [![npm version](https://img.shields.io/npm/v/logger-multi-db.svg)](https://www.npmjs.com/package/logger-multi-db)
   [![npm downloads](https://img.shields.io/npm/dm/logger-multi-db.svg)](https://www.npmjs.com/package/logger-multi-db)
   [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
   ```

---

**Bon déploiement ! 🚀**
