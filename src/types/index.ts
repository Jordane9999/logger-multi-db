/**
 * Core types for Universal Logger
 */

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  TRACE = 'trace'
}

export interface LogContext {
  userId?: string;
  requestId?: string;
  sessionId?: string;
  ip?: string;
  userAgent?: string;
  method?: string;
  url?: string;
  statusCode?: number;
  duration?: number;
  [key: string]: any;
}

export interface LogEntry {
  id?: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  timestamp: Date;
  environment: string;
  service: string;
  error?: {
    message: string;
    stack?: string;
    code?: string;
    name?: string;
  };
}

export interface LoggerConfig {
  adapter: LogAdapter;
  environment?: string;
  service?: string;
  enableConsole?: boolean;
  minLevel?: LogLevel;
  sanitize?: boolean;
  sanitizePatterns?: string[];
}

export interface LogAdapter {
  connect(): Promise<void>;
  write(entry: LogEntry): Promise<void>;
  query(filter: LogFilter): Promise<LogEntry[]>;
  close(): Promise<void>;
}

export interface LogFilter {
  level?: LogLevel;
  levels?: LogLevel[];
  userId?: string;
  requestId?: string;
  sessionId?: string;
  startDate?: Date;
  endDate?: Date;
  searchText?: string;
  limit?: number;
  offset?: number;
}

export interface LogStats {
  total: number;
  error: number;
  warn: number;
  info: number;
  debug: number;
  trace: number;
}

export interface ErrorAnalysis {
  message: string;
  count: number;
  firstOccurrence: Date;
  lastOccurrence: Date;
  affectedUsers: number;
}
