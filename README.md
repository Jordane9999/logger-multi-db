# logger-multi-db

[![npm version](https://img.shields.io/npm/v/logger-multi-db.svg)](https://www.npmjs.com/package/logger-multi-db)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Universal logging library for Node.js** - One API, multiple databases, pure ESM

Log to **MongoDB**, **PostgreSQL**, **MySQL**, **Firebase**, or any database with a unified, simple API using modern ES Modules.

---

## ✨ Features

- 🎯 **Universal API** - One interface for all databases
- 📦 **Multiple Adapters** - File, MongoDB, PostgreSQL, MySQL, Firebase
- 📁 **File Adapter** - No database required! Log to local files with rotation
- 🔒 **Auto Sanitization** - Masks passwords, tokens, emails automatically
- 🎨 **Pure ESM** - Modern ES Modules (`import/export`)
- 🎨 **TypeScript** - Full type safety
- ⚡ **Zero Dependencies** - File adapter has NO dependencies!
- 📊 **5 Log Levels** - ERROR, WARN, INFO, DEBUG, TRACE
- 🔍 **Powerful Queries** - Filter by user, date, level, text search
- 🌍 **Environment Aware** - dev/staging/production
- 🎭 **Console Output** - Beautiful colored console logs
- 📈 **Production Ready** - Battle-tested

---

## 📦 Installation

```bash
# npm
npm install logger-multi-db

# yarn
yarn add logger-multi-db

# pnpm
pnpm add logger-multi-db
```

**Then install your database adapter:**

```bash
# MongoDB
npm install mongodb

# PostgreSQL
npm install pg
npm i --save-dev @types/pg

# MySQL
npm install mysql2


# Firebase
npm install firebase-admin
```

---

## 🚀 Quick Start

### File (No Database Required!)

```javascript
import { createLogger, createFileAdapter, LogLevel } from "logger-multi-db";

const logger = createLogger({
  adapter: createFileAdapter({
    logDir: "./logs",
    filename: "app.log",
    maxSize: 5 * 1024 * 1024, // 5MB
    maxFiles: 3,
    format: "json", // or 'text'
  }),
  service: "my-app",
  minLevel: LogLevel.INFO,
});

await logger.init();

logger.info("Application started", { version: "1.0.0" });
logger.error("Something went wrong", { userId: "123" }, new Error("Oops!"));

// Query logs from files
const recentErrors = await logger.query({
  level: LogLevel.ERROR,
  limit: 10,
});
```

### MongoDB

```javascript
import { createLogger, LogLevel } from "logger-multi-db";
import { createMongoDBAdapter } from "logger-multi-db/adapters/mongodb";

const logger = createLogger({
  adapter: createMongoDBAdapter({
    uri: "mongodb://localhost:27017",
    dbName: "myapp",
    collectionName: "logs",
    ttlDays: 30,
  }),
  service: "api",
  environment: "production",
});

await logger.init();

logger.info("User logged in", { userId: "123", email: "user@example.com" });
logger.error("Payment failed", { amount: 50 }, new Error("Stripe timeout"));
```

### PostgreSQL

```javascript
import { createLogger } from "logger-multi-db";
import { createPostgreSQLAdapter } from "logger-multi-db/adapters/postgresql";

const logger = createLogger({
  adapter: createPostgreSQLAdapter({
    host: "localhost",
    database: "myapp",
    user: "postgres",
    password: "password",
  }),
  service: "web",
});

await logger.init();

logger.info("Order created", { orderId: "456", amount: 99.99 });
```

### MySQL

```javascript
import { createLogger } from "logger-multi-db";
import { createMySQLAdapter } from "logger-multi-db/adapters/mysql";

const logger = createLogger({
  adapter: createMySQLAdapter({
    host: "localhost",
    database: "myapp",
    user: "root",
    password: "password",
  }),
  service: "backend",
});

await logger.init();

logger.warn("Low stock", { productId: "789", stock: 5 });
```

### Firebase

```javascript
import { createLogger } from "logger-multi-db";
import { createFirebaseAdapter } from "logger-multi-db/adapters/firebase";

const logger = createLogger({
  adapter: createFirebaseAdapter({
    serviceAccount: "./serviceAccountKey.json",
    collectionName: "logs",
  }),
  service: "mobile-app",
});

await logger.init();

logger.info("User signup", { userId: "123", provider: "google" });
```

---

## 📖 API Reference

### createLogger(config)

```javascript
import { createLogger, LogLevel } from "logger-multi-db";

const logger = createLogger({
  adapter, // Database adapter (required)
  environment: "prod", // Environment
  service: "api", // Service name
  enableConsole: true, // Console logging
  minLevel: LogLevel.INFO, // Minimum level (use LogLevel enum)
  sanitize: true, // Auto-sanitize
});
```

### Log Methods

```javascript
// Log levels
logger.error(message, context?, error?)
logger.warn(message, context?)
logger.info(message, context?)
logger.debug(message, context?)
logger.trace(message, context?)

// Initialize
await logger.init()

// Query logs
const logs = await logger.query({
  level: LogLevel.ERROR,
  userId: 'user123',
  startDate: new Date('2024-01-01'),
  limit: 100
})

// Close
await logger.close()
```

---

## 🔒 Automatic Data Sanitization

Sensitive data is **automatically masked**:

```javascript
logger.info("Login attempt", {
  email: "jordan@example.com", // → jor***@example.com
  password: "supersecret123", // → ***REDACTED***
  apiKey: "sk_live_12345", // → ***REDACTED***
  userId: "user123", // ✅ Not masked
});
```

**Default masked fields:**

- password, token, apiKey, secret
- creditCard, ssn, bankAccount
- privateKey, accessToken, refreshToken
- email (partially masked)

---

## 📊 Examples by Use Case

### Request Tracing

```javascript
import { randomUUID } from "crypto";

const requestId = randomUUID();

logger.info("Request started", { requestId, url: "/api/users" });
// ... processing ...
logger.info("Request completed", { requestId, duration: 150 });

// Find all logs for this request
const logs = await logger.query({ requestId });
```

### E-commerce Platform

```javascript
// Track orders
logger.info("Order created", {
  orderId: order.id,
  userId: user.id,
  amount: order.total,
});

// Track payments
logger.info("Payment processed", {
  orderId: order.id,
  transactionId: payment.id,
});
```

### Error Tracking

```javascript
try {
  await processPayment(data);
} catch (error) {
  logger.error(
    "Payment error",
    {
      userId: user.id,
      amount: data.amount,
    },
    error
  );
}
```

---

## 🔄 Switching Databases

**Switch from MongoDB to PostgreSQL?** Just change the adapter:

```javascript
// Before: MongoDB
const adapter = createMongoDBAdapter({ uri: "..." });

// After: PostgreSQL
const adapter = createPostgreSQLAdapter({ host: "..." });

// Your logging code stays the same!
logger.info("Works!", { userId: "123" });
```

---

## 📝 TypeScript

Full TypeScript support:

```typescript
import {
  createLogger,
  LogLevel, // Enum (not a type)
  type LogEntry, // Type
  type LogContext, // Type
  type LogFilter, // Type
} from "logger-multi-db";

import {
  createMongoDBAdapter,
  type MongoDBAdapterConfig,
} from "logger-multi-db/adapters/mongodb";

const config: MongoDBAdapterConfig = {
  uri: "mongodb://localhost:27017",
  dbName: "myapp",
};

// Use LogLevel as a value
const logger = createLogger({
  adapter: createMongoDBAdapter(config),
  minLevel: LogLevel.INFO, // ✅ Correct
});
```

---

## 🎨 Console Output

Beautiful colored console logs:

```
🔴 [ERROR] 2024-11-29T10:30:00.000Z [api] Payment failed {"userId":"123"}
❌ Stripe timeout
```

Disable in production:

```javascript
const logger = createLogger({
  adapter,
  enableConsole: process.env.NODE_ENV !== "production",
});
```

---

## 🤝 Contributing

Contributions welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md)

---

## 📄 License

MIT © [Jordan (Tech converter)]

---

## 🔗 Links

- [npm package](https://www.npmjs.com/package/logger-multi-db)
- [GitHub](https://github.com/Jordane9999/universal-logger)
- [Documentation](https://github.com/Jordane9999/universal-logger/tree/main/docs)

---

**Made with ❤️ using modern ES Modules**
