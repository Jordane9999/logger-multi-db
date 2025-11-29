/**
 * @trenderz/universal-logger
 * Universal logging library for Node.js with ESM support
 */

// Core
export { createLogger, UniversalLogger } from "./core/logger.js";

// Types
export type {
  ErrorAnalysis,
  LogAdapter,
  LogContext,
  LogEntry,
  LogFilter,
  LoggerConfig,
  LogLevel,
  LogStats,
} from "./types/index.js";

// Adapters
export { createMongoDBAdapter, MongoDBAdapter } from "./adapters/mongodb.js";
export type { MongoDBAdapterConfig } from "./adapters/mongodb.js";

export {
  createPostgreSQLAdapter,
  PostgreSQLAdapter,
} from "./adapters/postgresql.js";
export type { PostgreSQLAdapterConfig } from "./adapters/postgresql.js";

export { createMySQLAdapter, MySQLAdapter } from "./adapters/mysql.js";
export type { MySQLAdapterConfig } from "./adapters/mysql.js";

export { createFirebaseAdapter, FirebaseAdapter } from "./adapters/firebase.js";
export type { FirebaseAdapterConfig } from "./adapters/firebase.js";

// Default export
export { createLogger as default } from "./core/logger.js";
