/**
 * Universal Logger - Core
 */

import { LogLevel, LogEntry, LogContext, LoggerConfig, LogFilter } from '../types/index.js';

const DEFAULT_SENSITIVE_PATTERNS = [
  'password',
  'token',
  'apikey',
  'api_key',
  'secret',
  'creditcard',
  'credit_card',
  'ssn',
  'bankaccount',
  'bank_account',
  'privatekey',
  'private_key',
  'accesstoken',
  'access_token',
  'refreshtoken',
  'refresh_token',
  'authorization'
];

export class UniversalLogger {
  private config: Required<LoggerConfig>;
  private levelPriority: Record<LogLevel, number> = {
    [LogLevel.TRACE]: 0,
    [LogLevel.DEBUG]: 1,
    [LogLevel.INFO]: 2,
    [LogLevel.WARN]: 3,
    [LogLevel.ERROR]: 4
  };

  constructor(config: LoggerConfig) {
    // Safe environment detection for Next.js and other environments
    const getEnvironment = (): string => {
      if (config.environment) return config.environment;

      // Check if process.env is available (Node.js/Next.js server-side)
      if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV) {
        return process.env.NODE_ENV;
      }

      return 'development';
    };

    this.config = {
      adapter: config.adapter,
      environment: getEnvironment(),
      service: config.service || 'app',
      enableConsole: config.enableConsole ?? true,
      minLevel: config.minLevel || LogLevel.INFO,
      sanitize: config.sanitize ?? true,
      sanitizePatterns: config.sanitizePatterns || DEFAULT_SENSITIVE_PATTERNS
    };
  }

  async init(): Promise<void> {
    // Warn if trying to use server-side adapters in browser environment
    // Check if we're in a browser by looking for window on globalThis
    if (typeof globalThis !== 'undefined' && 'window' in globalThis && (globalThis as any).window !== undefined) {
      console.warn(
        '⚠️  Logger: You are running in a browser environment. ' +
        'Database adapters (MongoDB, PostgreSQL, MySQL, Firebase) require a server-side environment. ' +
        'In Next.js, use this logger only in Server Components, API Routes, or Server Actions. ' +
        'Consider using the File adapter or implement a client-safe adapter.'
      );
    }

    await this.config.adapter.connect();
  }

  private sanitizeContext(context: LogContext): LogContext {
    if (!this.config.sanitize) return context;

    const sanitized = { ...context };

    for (const key in sanitized) {
      const lowerKey = key.toLowerCase();

      if (this.config.sanitizePatterns.some(pattern => lowerKey.includes(pattern.toLowerCase()))) {
        sanitized[key] = '***REDACTED***';
      }

      if (key === 'email' && typeof sanitized[key] === 'string') {
        const email = sanitized[key] as string;
        sanitized[key] = email.replace(/(.{2}).*(@.*)/, '$1***$2');
      }
    }

    return sanitized;
  }

  private shouldLog(level: LogLevel): boolean {
    return this.levelPriority[level] >= this.levelPriority[this.config.minLevel];
  }

  private logToConsole(entry: LogEntry): void {
    if (!this.config.enableConsole) return;

    const emoji: Record<LogLevel, string> = {
      [LogLevel.ERROR]: '🔴',
      [LogLevel.WARN]: '🟡',
      [LogLevel.INFO]: '🔵',
      [LogLevel.DEBUG]: '⚪',
      [LogLevel.TRACE]: '⚫'
    };

    const logFn = entry.level === LogLevel.ERROR ? console.error :
                  entry.level === LogLevel.WARN ? console.warn :
                  console.log;

    const parts = [
      emoji[entry.level],
      `[${entry.level.toUpperCase()}]`,
      entry.timestamp.toISOString(),
      `[${entry.service}]`,
      entry.message
    ];

    if (entry.context && Object.keys(entry.context).length > 0) {
      parts.push(JSON.stringify(entry.context));
    }

    if (entry.error) {
      parts.push(`\n❌ ${entry.error.message}`);
    }

    logFn(...parts);

    if (entry.error?.stack && this.config.environment === 'development') {
      console.error(entry.error.stack);
    }
  }

  private async log(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ): Promise<void> {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      context: context ? this.sanitizeContext(context) : undefined,
      timestamp: new Date(),
      environment: this.config.environment,
      service: this.config.service,
      error: error ? {
        message: error.message,
        stack: error.stack,
        code: (error as any).code,
        name: error.name
      } : undefined
    };

    this.logToConsole(entry);

    // Await the write to ensure logs are not lost (critical for Next.js)
    try {
      await this.config.adapter.write(entry);
    } catch (err) {
      console.error('Logger: Failed to write to database', err);
    }
  }

  error(message: string, context?: LogContext, error?: Error): Promise<void> {
    return this.log(LogLevel.ERROR, message, context, error);
  }

  warn(message: string, context?: LogContext): Promise<void> {
    return this.log(LogLevel.WARN, message, context);
  }

  info(message: string, context?: LogContext): Promise<void> {
    return this.log(LogLevel.INFO, message, context);
  }

  debug(message: string, context?: LogContext): Promise<void> {
    return this.log(LogLevel.DEBUG, message, context);
  }

  trace(message: string, context?: LogContext): Promise<void> {
    return this.log(LogLevel.TRACE, message, context);
  }

  async query(filter: LogFilter = {}): Promise<LogEntry[]> {
    return this.config.adapter.query(filter);
  }

  async close(): Promise<void> {
    await this.config.adapter.close();
  }

  getAdapter() {
    return this.config.adapter;
  }
}

export function createLogger(config: LoggerConfig): UniversalLogger {
  return new UniversalLogger(config);
}
