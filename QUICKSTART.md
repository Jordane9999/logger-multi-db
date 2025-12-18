# 🚀 Quick Start - @trenderz/universal-logger (ESM)

Guide rapide pour démarrer avec le logger universel en **5 minutes** avec **ES Modules**.

---

## ⚡ Installation (2 min)

### 1. Installer le package

```bash
npm install @trenderz/universal-logger
```

### 2. Installer un adaptateur de base de données

```bash
# Choisis UNE base de données
npm install mongodb            # MongoDB
npm install pg                 # PostgreSQL
npm i --save-dev @types/pg     # PostgreSQL
npm install mysql2             # MySQL
npm install firebase-admin     # Firebase
```

---

## 💻 Utilisation (3 min)

### MongoDB

```javascript
import { createLogger, createMongoDBAdapter } from "@trenderz/universal-logger";

const logger = createLogger({
  adapter: createMongoDBAdapter({
    uri: "mongodb://localhost:27017",
    dbName: "myapp",
  }),
  service: "api",
});

await logger.init();

logger.info("Hello World!", { userId: "123" });
```

### PostgreSQL

```javascript
import {
  createLogger,
  createPostgreSQLAdapter,
} from "@trenderz/universal-logger";

const logger = createLogger({
  adapter: createPostgreSQLAdapter({
    host: "localhost",
    database: "myapp",
    user: "postgres",
    password: "password",
  }),
  service: "api",
});

await logger.init();

logger.info("Hello World!", { userId: "123" });
```

### MySQL

```javascript
import { createLogger, createMySQLAdapter } from "@trenderz/universal-logger";

const logger = createLogger({
  adapter: createMySQLAdapter({
    host: "localhost",
    database: "myapp",
    user: "root",
    password: "password",
  }),
  service: "api",
});

await logger.init();

logger.info("Hello World!", { userId: "123" });
```

### Firebase

```javascript
import {
  createLogger,
  createFirebaseAdapter,
} from "@trenderz/universal-logger";

const logger = createLogger({
  adapter: createFirebaseAdapter({
    serviceAccount: "./serviceAccountKey.json",
  }),
  service: "api",
});

await logger.init();

logger.info("Hello World!", { userId: "123" });
```

---

## 🎯 Exemples Rapides

### Log Simple

```javascript
logger.info("Application started", { port: 3000 });
```

### Log avec Erreur

```javascript
try {
  await riskyOperation();
} catch (error) {
  logger.error("Operation failed", { userId: "123" }, error);
}
```

### Rechercher des Logs

```javascript
// Les logs des dernières 24h
const logs = await logger.query({
  startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
  limit: 100,
});

// Les erreurs d'un utilisateur
const userErrors = await logger.query({
  level: "error",
  userId: "user123",
});
```

---

## 🔄 Changer de Base de Données

C'est facile ! Change juste l'adaptateur :

```javascript
// Avant : MongoDB
const adapter = createMongoDBAdapter({ uri: "..." });

// Après : PostgreSQL
const adapter = createPostgreSQLAdapter({ host: "..." });

// Ton code reste identique !
```

---

## 🔒 Protection Automatique

```javascript
logger.info("Login", {
  email: "jordan@example.com", // → jor***@example.com
  password: "secret123", // → ***REDACTED***
  userId: "user123", // ✅ Non masqué
});
```

---

## 📊 Niveaux de Log

```javascript
logger.trace("Détails très fins");
logger.debug("Debug info");
logger.info("Info normale"); // ← Défaut
logger.warn("Attention !");
logger.error("Erreur !", {}, error);
```

---

## ✅ C'est Tout

Tu es prêt ! Lis le [README.md](./README.md) pour plus de détails.

---

**Made with ❤️ using ES Modules**
