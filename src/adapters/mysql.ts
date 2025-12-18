/**
 * MySQL Adapter for Universal Logger
 */

// @ts-expect-error - mysql2 is a peer dependency, may not be installed
import mysql from 'mysql2/promise';
import { LogAdapter, LogEntry, LogFilter, LogLevel } from '../types/index.js';

export interface MySQLAdapterConfig {
  host: string;
  port?: number;
  database: string;
  user: string;
  password: string;
  tableName?: string;
  autoCreateTable?: boolean;
}

export class MySQLAdapter implements LogAdapter {
  private pool: any = null;
  private config: Required<Pick<MySQLAdapterConfig, 'tableName' | 'autoCreateTable'>> & MySQLAdapterConfig;

  constructor(config: MySQLAdapterConfig) {
    this.config = {
      ...config,
      tableName: config.tableName || 'logs',
      autoCreateTable: config.autoCreateTable ?? true
    };
  }

  async connect(): Promise<void> {
    try {
      this.pool = mysql.createPool(this.config);

      if (this.config.autoCreateTable) {
        await this.createTable();
      }
    } catch (error) {
      throw new Error(`MySQL connection failed: ${(error as Error).message}`);
    }
  }

  private async createTable(): Promise<void> {
    if (!this.pool) return;

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS ${this.config.tableName} (
        id INT AUTO_INCREMENT PRIMARY KEY,
        level VARCHAR(10) NOT NULL,
        message TEXT NOT NULL,
        context JSON,
        timestamp DATETIME NOT NULL,
        environment VARCHAR(50),
        service VARCHAR(100),
        error JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_timestamp (timestamp DESC),
        INDEX idx_level (level, timestamp DESC)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await this.pool.execute(createTableQuery);
  }

  async write(entry: LogEntry): Promise<void> {
    if (!this.pool) {
      throw new Error('MySQL not connected');
    }

    const query = `
      INSERT INTO ${this.config.tableName} 
        (level, message, context, timestamp, environment, service, error)
      VALUES (?, ?, ?, ?, ?, ?, ?)
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

    await this.pool.execute(query, values);
  }

  async query(filter: LogFilter): Promise<LogEntry[]> {
    if (!this.pool) {
      throw new Error('MySQL not connected');
    }

    let query = `SELECT * FROM ${this.config.tableName} WHERE 1=1`;
    const values: any[] = [];

    if (filter.level) {
      query += ` AND level = ?`;
      values.push(filter.level);
    }

    if (filter.levels && filter.levels.length > 0) {
      query += ` AND level IN (?)`;
      values.push(filter.levels);
    }

    if (filter.userId) {
      query += ` AND JSON_EXTRACT(context, '$.userId') = ?`;
      values.push(filter.userId);
    }

    if (filter.requestId) {
      query += ` AND JSON_EXTRACT(context, '$.requestId') = ?`;
      values.push(filter.requestId);
    }

    if (filter.sessionId) {
      query += ` AND JSON_EXTRACT(context, '$.sessionId') = ?`;
      values.push(filter.sessionId);
    }

    if (filter.startDate) {
      query += ` AND timestamp >= ?`;
      values.push(filter.startDate);
    }

    if (filter.endDate) {
      query += ` AND timestamp <= ?`;
      values.push(filter.endDate);
    }

    if (filter.searchText) {
      query += ` AND (message LIKE ? OR JSON_EXTRACT(error, '$.message') LIKE ?)`;
      values.push(`%${filter.searchText}%`);
      values.push(`%${filter.searchText}%`);
    }

    query += ` ORDER BY timestamp DESC`;

    if (filter.limit) {
      query += ` LIMIT ?`;
      values.push(filter.limit);
    }

    if (filter.offset) {
      query += ` OFFSET ?`;
      values.push(filter.offset);
    }

    const [rows] = await this.pool.execute(query, values);

    return (rows as any[]).map((row: any) => ({
      id: row.id.toString(),
      level: row.level as LogLevel,
      message: row.message,
      context: row.context ? (typeof row.context === 'string' ? JSON.parse(row.context) : row.context) : undefined,
      timestamp: new Date(row.timestamp),
      environment: row.environment,
      service: row.service,
      error: row.error ? (typeof row.error === 'string' ? JSON.parse(row.error) : row.error) : undefined
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

export function createMySQLAdapter(config: MySQLAdapterConfig): MySQLAdapter {
  return new MySQLAdapter(config);
}
