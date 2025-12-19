/**
 * logger-multi-db
 * Universal logging library for Node.js with ESM support
 */

// Core
export { createLogger, UniversalLogger } from "./core/logger.js";

// Types (interfaces et types)
export type {
  ErrorAnalysis,
  LogAdapter,
  LogContext,
  LogEntry,
  LogFilter,
  LoggerConfig,
  LogStats,
} from "./types/index.js";

// Enum (exporté comme valeur, pas comme type)
export { LogLevel } from "./types/index.js";

// File Adapter (no peer dependencies - always available)
export { createFileAdapter, FileAdapter } from "./adapters/file.js";
export type { FileAdapterConfig } from "./adapters/file.js";

// Default export
export { createLogger as default } from "./core/logger.js";

// Note: Database adapters (MongoDB, PostgreSQL, MySQL, Firebase) are available
// via subpath imports to avoid loading peer dependencies:
// - import { createMongoDBAdapter } from 'logger-multi-db/adapters/mongodb'
// - import { createPostgreSQLAdapter } from 'logger-multi-db/adapters/postgresql'
// - import { createMySQLAdapter } from 'logger-multi-db/adapters/mysql'
// - import { createFirebaseAdapter } from 'logger-multi-db/adapters/firebase'
