/**
 * logger-multi-db
 * Universal logging library for Node.js with ESM support
 */

// Core
export { UniversalLogger, createLogger } from "./core/logger.js";

// Types
export type {
  ErrorAnalysis,
  LogAdapter,
  LogContext,
  LogEntry,
  LogFilter,
  LogLevel,
  LogStats,
  LoggerConfig,
} from "./types/index.js";

// Adapters
export { MongoDBAdapter, createMongoDBAdapter } from "./adapters/mongodb.js";
export type { MongoDBAdapterConfig } from "./adapters/mongodb.js";

export {
  PostgreSQLAdapter,
  createPostgreSQLAdapter,
} from "./adapters/postgresql.js";
export type { PostgreSQLAdapterConfig } from "./adapters/postgresql.js";

export { MySQLAdapter, createMySQLAdapter } from "./adapters/mysql.js";
export type { MySQLAdapterConfig } from "./adapters/mysql.js";

export { FirebaseAdapter, createFirebaseAdapter } from "./adapters/firebase.js";
export type { FirebaseAdapterConfig } from "./adapters/firebase.js";

// Default export
export { createLogger as default } from "./core/logger.js";
