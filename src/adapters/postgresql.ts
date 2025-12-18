/**
 * PostgreSQL Adapter for Universal Logger
 */

// @ts-expect-error - pg is a peer dependency, may not be installed
import pg from 'pg';
const { Pool } = pg;
import { LogAdapter, LogEntry, LogFilter, LogLevel } from '../types/index.js';

export interface PostgreSQLAdapterConfig {
  host: string;
  port?: number;
  database: string;
  user: string;
  password: string;
  tableName?: string;
  autoCreateTable?: boolean;
}

export class PostgreSQLAdapter implements LogAdapter {
  private pool: any = null;
  private config: Required<Pick<PostgreSQLAdapterConfig, 'tableName' | 'autoCreateTable'>> & PostgreSQLAdapterConfig;

  constructor(config: PostgreSQLAdapterConfig) {
    this.config = {
      ...config,
      tableName: config.tableName || 'logs',
      autoCreateTable: config.autoCreateTable ?? true
    };
  }

  async connect(): Promise<void> {
    try {
      this.pool = new Pool(this.config);

      if (this.config.autoCreateTable) {
        await this.createTable();
      }
    } catch (error) {
      throw new Error(`PostgreSQL connection failed: ${(error as Error).message}`);
    }
  }

  private async createTable(): Promise<void> {
    if (!this.pool) return;

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS ${this.config.tableName} (
        id SERIAL PRIMARY KEY,
        level VARCHAR(10) NOT NULL,
        message TEXT NOT NULL,
        context JSONB,
        timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
        environment VARCHAR(50),
        service VARCHAR(100),
        error JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_${this.config.tableName}_timestamp 
        ON ${this.config.tableName}(timestamp DESC);
      
      CREATE INDEX IF NOT EXISTS idx_${this.config.tableName}_level 
        ON ${this.config.tableName}(level, timestamp DESC);
      
      CREATE INDEX IF NOT EXISTS idx_${this.config.tableName}_user_id 
        ON ${this.config.tableName}((context->>'userId'), timestamp DESC);
      
      CREATE INDEX IF NOT EXISTS idx_${this.config.tableName}_request_id 
        ON ${this.config.tableName}((context->>'requestId'));
    `;

    await this.pool.query(createTableQuery);
  }

  async write(entry: LogEntry): Promise<void> {
    if (!this.pool) {
      throw new Error('PostgreSQL not connected');
    }

    const query = `
      INSERT INTO ${this.config.tableName} 
        (level, message, context, timestamp, environment, service, error)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;

    const values = [
      entry.level,
      entry.message,
      entry.context ? JSON.stringify(entry.context) : null,
      entry.timestamp,
      entry.environment,
      entry.service,
      entry.error ? JSON.stringify(entry.error) : null
    ];

    await this.pool.query(query, values);
  }

  async query(filter: LogFilter): Promise<LogEntry[]> {
    if (!this.pool) {
      throw new Error('PostgreSQL not connected');
    }

    let query = `SELECT * FROM ${this.config.tableName} WHERE 1=1`;
    const values: any[] = [];
    let paramIndex = 1;

    if (filter.level) {
      query += ` AND level = $${paramIndex++}`;
      values.push(filter.level);
    }

    if (filter.levels && filter.levels.length > 0) {
      query += ` AND level = ANY($${paramIndex++})`;
      values.push(filter.levels);
    }

    if (filter.userId) {
      query += ` AND context->>'userId' = $${paramIndex++}`;
      values.push(filter.userId);
    }

    if (filter.requestId) {
      query += ` AND context->>'requestId' = $${paramIndex++}`;
      values.push(filter.requestId);
    }

    if (filter.sessionId) {
      query += ` AND context->>'sessionId' = $${paramIndex++}`;
      values.push(filter.sessionId);
    }

    if (filter.startDate) {
      query += ` AND timestamp >= $${paramIndex++}`;
      values.push(filter.startDate);
    }

    if (filter.endDate) {
      query += ` AND timestamp <= $${paramIndex++}`;
      values.push(filter.endDate);
    }

    if (filter.searchText) {
      query += ` AND (message ILIKE $${paramIndex++} OR error->>'message' ILIKE $${paramIndex})`;
      values.push(`%${filter.searchText}%`);
      values.push(`%${filter.searchText}%`);
      paramIndex += 2;
    }

    query += ` ORDER BY timestamp DESC`;

    if (filter.limit) {
      query += ` LIMIT $${paramIndex++}`;
      values.push(filter.limit);
    }

    if (filter.offset) {
      query += ` OFFSET $${paramIndex++}`;
      values.push(filter.offset);
    }

    const result = await this.pool.query(query, values);

    return result.rows.map((row: any) => ({
      id: row.id.toString(),
      level: row.level as LogLevel,
      message: row.message,
      context: row.context,
      timestamp: new Date(row.timestamp),
      environment: row.environment,
      service: row.service,
      error: row.error
    }));
  }

  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }

  getPool(): any {
    return this.pool;
  }
}

export function createPostgreSQLAdapter(config: PostgreSQLAdapterConfig): PostgreSQLAdapter {
  return new PostgreSQLAdapter(config);
}
