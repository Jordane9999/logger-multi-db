# 🚀 Guide : Déclencher le workflow de publication

## Situation actuelle
✅ Workflow "Publish to npm" présent sur GitHub
⏸️ Aucune exécution encore ("This workflow has no runs yet")

---

## Option 1 : Test SANS publier (Recommandé pour le premier essai)

### Étape 1 : Tester le workflow en mode dry-run

Pour tester le workflow SANS publier sur npm :

1. **Sur GitHub**, allez sur la page du workflow :
   - **Actions** → **Publish to npm**

2. Vous devriez voir un bouton **"Run workflow"** à droite

3. **Cliquez sur "Run workflow"**

4. Une boîte de dialogue apparaît avec :
   - **Branch** : Sélectionnez `main` (ou `claude/fix-nextjs-logging-MfnGG`)
   - **Version bump type** : Sélectionnez `patch`

5. **Cliquez sur le bouton vert "Run workflow"**

### ⚠️ Important : Configuration du secret NPM_TOKEN

**Avant de publier réellement**, vous devez configurer le secret npm :

1. **Créer un token npm** :
   - Allez sur https://www.npmjs.com/settings/[votre-username]/tokens
   - Cliquez **"Generate New Token"**
   - Sélectionnez **"Automation"**
   - Copiez le token (commence par `npm_...`)

2. **Ajouter le secret dans GitHub** :
   - Sur votre repo → **Settings** (en haut)
   - **Secrets and variables** → **Actions**
   - **New repository secret**
   - Nom : `NPM_TOKEN`
   - Valeur : Collez votre token npm
   - **Add secret**

### Ce que le workflow va faire

Quand vous déclenchez le workflow, il va :

1. ✅ Installer les dépendances (`npm ci`)
2. ✅ Exécuter les tests (`npm test`)
3. ✅ Builder le projet (`npm run build`)
4. ✅ Vérifier le build (dist/index.js existe)
5. ✅ Bumper la version (1.0.8 → 1.0.9)
6. ✅ Créer un commit + tag Git
7. ✅ Créer une GitHub Release
8. ✅ Publier sur npm (SI le token NPM_TOKEN est configuré)

---

## Option 2 : Merger dans main d'abord (Recommandé)

Avant de publier, il est préférable de merger votre branche dans `main` :

```bash
# 1. Retourner sur main
git checkout main

# 2. Merger votre branche
git merge claude/fix-nextjs-logging-MfnGG

# 3. Pousser vers GitHub
git push origin main
```

**Ensuite :**
- GitHub → Actions → Publish to npm → Run workflow
- Branch : `main`
- Version : `patch`
- Run workflow

---

## Option 3 : Publication locale (si vous préférez)

Si vous préférez publier manuellement en local :

```bash
# 1. Vérifier tout
npm run verify

# 2. Login npm (première fois seulement)
npm login

# 3. Publier
npm publish --access public

# 4. Ou utiliser les scripts
npm run release:patch  # Bump version + push tags
npm publish --access public
```

---

## 🔍 Que se passe-t-il si NPM_TOKEN n'est pas configuré ?

Si vous déclenchez le workflow SANS avoir configuré `NPM_TOKEN`, voici ce qui va se passer :

- ✅ Toutes les étapes vont fonctionner JUSQU'À la publication
- ❌ L'étape "Publish to npm" va échouer avec :
  ```
  npm ERR! 403 Forbidden
  npm ERR! This operation requires authentication
  ```

**Ce n'est pas grave !** Vous pouvez :
1. Configurer le secret `NPM_TOKEN`
2. Relancer le workflow

---

## 📸 À quoi ressemble l'interface GitHub

Quand vous allez sur **Actions** → **Publish to npm**, vous devriez voir :

```
╔════════════════════════════════════════════════════╗
║  Publish to npm                    [Run workflow ▼]║
║                                                     ║
║  This workflow has no runs yet.                    ║
╚════════════════════════════════════════════════════╝
```

**Cliquez sur "Run workflow"**, et vous verrez :

```
╔════════════════════════════════════════════════════╗
║  Run workflow                                       ║
║                                                     ║
║  Use workflow from                                  ║
║  Branch: main ▼                                     ║
║                                                     ║
║  Version bump type                                  ║
║  patch ▼                                            ║
║    - patch                                          ║
║    - minor                                          ║
║    - major                                          ║
║    - prerelease                                     ║
║                                                     ║
║              [Run workflow]                         ║
╚════════════════════════════════════════════════════╝
```

---

## ✅ Checklist avant le premier run

- [ ] Branche mergée dans `main` (recommandé)
- [ ] Token npm créé sur npmjs.com
- [ ] Secret `NPM_TOKEN` ajouté dans GitHub
- [ ] Build local réussi : `npm run verify`
- [ ] Prêt à publier la version 1.0.9

---

## 🎯 Mon conseil : Étapes dans l'ordre

1. **Merger dans main** (si pas déjà fait)
   ```bash
   git checkout main
   git merge claude/fix-nextjs-logging-MfnGG
   git push origin main
   ```

2. **Configurer NPM_TOKEN** (étapes ci-dessus)

3. **Déclencher le workflow**
   - GitHub → Actions → Publish to npm
   - Run workflow → Branch: main → Version: patch
   - Cliquer "Run workflow"

4. **Attendre ~2-3 minutes**

5. **Vérifier** :
   - ✅ Workflow passe au vert
   - ✅ Package sur npm : https://www.npmjs.com/package/logger-multi-db
   - ✅ GitHub Release créée
   - ✅ Version 1.0.9 disponible

---

## 🆘 Dépannage

### "Run workflow" button n'apparaît pas

**Cause** : Permissions insuffisantes

**Solution** :
1. Settings → Actions → General
2. Workflow permissions → ✅ "Read and write permissions"
3. ✅ Cocher "Allow GitHub Actions to create and approve pull requests"

### "npm ERR! 403 Forbidden"

**Cause** : Token NPM_TOKEN manquant ou invalide

**Solution** :
1. Régénérer le token sur npmjs.com
2. Mettre à jour le secret dans GitHub

### "git push failed"

**Cause** : Protection de branche sur main

**Solution** :
1. Settings → Branches
2. Désactiver temporairement les protections
3. Ou ajouter github-actions[bot] aux exceptions

---

## 📺 Voulez-vous que je vous guide en temps réel ?

Si vous voulez, vous pouvez :

1. Déclencher le workflow maintenant
2. Me copier le log d'erreur si ça ne marche pas
3. Je vous aiderai à débugger

**Prêt à lancer votre première publication ? 🚀**
