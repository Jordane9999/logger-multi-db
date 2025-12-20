# 📋 Release Checklist

Checklist à suivre avant chaque publication sur npm.

---

## ✅ Avant de publier

### 1. Code Quality
- [ ] Tous les tests passent : `npm test`
- [ ] Build réussit : `npm run build`
- [ ] TypeCheck OK : `npm run typecheck`
- [ ] Aucune erreur de lint
- [ ] Code reviewed et mergé dans `main`

### 2. Documentation
- [ ] README.md à jour
- [ ] CHANGELOG.md mis à jour avec les nouveautés
- [ ] Exemples fonctionnent
- [ ] Documentation technique à jour (docs/)

### 3. Package Configuration
- [ ] `package.json` version correcte
- [ ] `package.json` keywords pertinents
- [ ] `files` field inclut tout le nécessaire
- [ ] `exports` configurés correctement
- [ ] LICENSE présent

### 4. Tests de publication
- [ ] Dry-run réussi : `npm run publish:dry`
- [ ] Pack test : `npm pack`
- [ ] Test du tarball localement

### 5. Breaking Changes?
Si oui :
- [ ] Version MAJOR incrémentée
- [ ] Migration guide créé
- [ ] Breaking changes documentés dans CHANGELOG

---

## 🚀 Publication

### Méthode automatique (Recommandée)

1. GitHub → Actions → "Publish to npm"
2. Run workflow
3. Sélectionner le type de version :
   - `patch` : Bug fixes (1.0.8 → 1.0.9)
   - `minor` : New features (1.0.8 → 1.1.0)
   - `major` : Breaking changes (1.0.8 → 2.0.0)

### Méthode manuelle

```bash
# 1. Checkout main et update
git checkout main
git pull origin main

# 2. Vérifier tout
npm run verify

# 3. Bump version
npm version patch  # ou minor, major

# 4. Publier
npm publish

# 5. Push tags
git push --follow-tags
```

---

## ✅ Après publication

- [ ] Vérifier sur [npmjs.com](https://www.npmjs.com/package/logger-multi-db)
- [ ] Badge de provenance visible ✅
- [ ] Tester l'installation : `npm install logger-multi-db`
- [ ] GitHub Release créée
- [ ] Annoncer sur les réseaux sociaux (optionnel)

---

## 🔄 Versioning (Semantic Versioning)

### PATCH (1.0.8 → 1.0.9)
- Bug fixes
- Documentation updates
- Performance improvements (sans breaking changes)

### MINOR (1.0.8 → 1.1.0)
- Nouvelles fonctionnalités (backward compatible)
- Nouveaux adapters
- Nouvelles options de configuration

### MAJOR (1.0.8 → 2.0.0)
- Breaking changes
- Suppression de fonctionnalités
- Changements d'API incompatibles

---

## 📝 Convention de commits (Recommandé)

```bash
# Patch
fix: correct bug in MongoDB adapter
docs: update README installation steps

# Minor
feat: add Firebase adapter
feat: add query filtering by date range

# Major
feat!: remove deprecated createFileLogger function
BREAKING CHANGE: MongoDB adapter now requires uri instead of url
```

---

## 🚨 En cas de problème

### Package publié avec erreur

```bash
# Dépublier (dans les 72h)
npm unpublish logger-multi-db@1.0.9

# Corriger et republier
npm version patch
npm publish
```

⚠️ **Attention :** `npm unpublish` n'est possible que dans les 72h.

### Version incorrecte publiée

```bash
# Déprécier la version
npm deprecate logger-multi-db@1.0.9 "Version incorrecte, utilisez 1.0.10"

# Publier la bonne version
npm version patch
npm publish
```

---

## 📞 Support

En cas de problème lors de la publication :
- Vérifier [docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md)
- Consulter les logs GitHub Actions
- Vérifier les secrets GitHub (NPM_TOKEN)
