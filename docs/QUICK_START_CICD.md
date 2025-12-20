# 🚀 Démarrage rapide CI/CD

Guide ultra-rapide pour publier votre package sur npm en 5 minutes.

---

## ⚡ En 3 étapes

### 1️⃣ Créer un token npm (2 min)

1. Allez sur [npmjs.com](https://www.npmjs.com) → Connectez-vous
2. **Account Settings** → **Access Tokens** → **Generate New Token**
3. Choisissez **"Automation"**
4. Copiez le token (commence par `npm_...`)

### 2️⃣ Ajouter le token dans GitHub (1 min)

1. Votre repo GitHub → **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret**
3. Nom : `NPM_TOKEN`
4. Valeur : Collez votre token npm
5. **Add secret**

### 3️⃣ Publier (1 min)

1. Allez dans **Actions** → **Publish to npm**
2. **Run workflow** (bouton vert à droite)
3. Sélectionnez le type de version :
   - `patch` : 1.0.8 → 1.0.9 (corrections de bugs)
   - `minor` : 1.0.8 → 1.1.0 (nouvelles fonctionnalités)
   - `major` : 1.0.8 → 2.0.0 (breaking changes)
4. Cliquez sur **Run workflow**

**C'est tout ! ✅**

Le workflow va automatiquement :
- ✅ Tester et builder le code
- ✅ Incrémenter la version
- ✅ Créer un tag Git
- ✅ Créer une GitHub Release
- ✅ Publier sur npm

---

## 📦 Vérifier la publication

Après 2-3 minutes, vérifiez :

1. **npm** : https://www.npmjs.com/package/logger-multi-db
2. **GitHub Releases** : https://github.com/Jordane9999/logger-multi-db/releases

---

## 🔄 Publication locale (alternative)

Si vous préférez publier manuellement :

```bash
# 1. Build et tests
npm run verify

# 2. Bump version et push
npm run release:patch  # ou release:minor, release:major

# 3. Login npm (première fois seulement)
npm login

# 4. Publier
npm publish
```

---

## 🆘 Problèmes ?

### "npm ERR! 403 Forbidden"
→ Vérifiez que le secret `NPM_TOKEN` est bien configuré dans GitHub

### "version already exists"
→ Incrémentez la version : `npm version patch`

### "build failed"
→ Vérifiez localement : `npm run build`

---

## 📚 Documentation complète

Pour plus de détails : [docs/DEPLOYMENT.md](./DEPLOYMENT.md)

---

**Bon déploiement ! 🎉**
