/**
 * MongoDB Adapter for Universal Logger
 */

import { LogAdapter, LogEntry, LogFilter, LogLevel } from '../types/index.js';

// Type imports only (no runtime import)
type MongoClient = any;
type Db = any;
type Collection<T> = any;
type MongoFilter<T> = any;

export interface MongoDBAdapterConfig {
  uri: string;
  dbName?: string;
  collectionName?: string;
  ttlDays?: number;
}

export class MongoDBAdapter implements LogAdapter {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private collection: Collection<LogEntry> | null = null;
  private config: Required<MongoDBAdapterConfig>;
  private mongodb: any = null;

  constructor(config: MongoDBAdapterConfig) {
    this.config = {
      uri: config.uri,
      dbName: config.dbName || 'logs',
      collectionName: config.collectionName || 'logs',
      ttlDays: config.ttlDays || 30
    };
  }

  async connect(): Promise<void> {
    try {
      // Dynamically import mongodb only when connecting (server-side only)
      if (!this.mongodb) {
        try {
          // @ts-ignore - mongodb is a peer dependency, may not be installed
          this.mongodb = await import('mongodb');
        } catch (error) {
          throw new Error(
            'MongoDB peer dependency is not installed. Please install it with: npm install mongodb'
          );
        }
      }

      this.client = new this.mongodb.MongoClient(this.config.uri);
      await this.client.connect();

      this.db = this.client.db(this.config.dbName);
      this.collection = this.db.collection(this.config.collectionName);

      await this.createIndexes();
    } catch (error) {
      throw new Error(`MongoDB connection failed: ${(error as Error).message}`);
    }
  }

  private async createIndexes(): Promise<void> {
    if (!this.collection) return;

    try {
      await Promise.all([
        this.collection.createIndex({ timestamp: -1 }),
        this.collection.createIndex({ level: 1, timestamp: -1 }),
        this.collection.createIndex({ 'context.userId': 1, timestamp: -1 }),
        this.collection.createIndex({ 'context.requestId': 1 }),
        this.collection.createIndex(
          { timestamp: 1 },
          { expireAfterSeconds: this.config.ttlDays * 24 * 60 * 60 }
        )
      ]);
    } catch (error) {
      console.error('MongoDB: Failed to create indexes', error);
    }
  }

  async write(entry: LogEntry): Promise<void> {
    if (!this.collection) {
      throw new Error('MongoDB not connected');
    }

    await this.collection.insertOne(entry as any);
  }

  async query(filter: LogFilter): Promise<LogEntry[]> {
    if (!this.collection) {
      throw new Error('MongoDB not connected');
    }

    const mongoFilter: MongoFilter<LogEntry> = {};

    if (filter.level) {
      mongoFilter.level = filter.level;
    }

    if (filter.levels && filter.levels.length > 0) {
      mongoFilter.level = { $in: filter.levels } as any;
    }

    if (filter.userId) {
      mongoFilter['context.userId'] = filter.userId;
    }

    if (filter.requestId) {
      mongoFilter['context.requestId'] = filter.requestId;
    }

    if (filter.sessionId) {
      mongoFilter['context.sessionId'] = filter.sessionId;
    }

    if (filter.startDate || filter.endDate) {
      mongoFilter.timestamp = {} as any;
      if (filter.startDate) {
        (mongoFilter.timestamp as any).$gte = filter.startDate;
      }
      if (filter.endDate) {
        (mongoFilter.timestamp as any).$lte = filter.endDate;
      }
    }

    if (filter.searchText) {
      mongoFilter.$or = [
        { message: { $regex: filter.searchText, $options: 'i' } },
        { 'error.message': { $regex: filter.searchText, $options: 'i' } }
      ] as any;
    }

    const cursor = this.collection
      .find(mongoFilter)
      .sort({ timestamp: -1 });

    if (filter.offset) {
      cursor.skip(filter.offset);
    }

    if (filter.limit) {
      cursor.limit(filter.limit);
    }

    return (await cursor.toArray()) as LogEntry[];
  }

  async close(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      this.collection = null;
    }
  }

  getCollection(): Collection<LogEntry> | null {
    return this.collection;
  }
}

export function createMongoDBAdapter(config: MongoDBAdapterConfig): MongoDBAdapter {
  return new MongoDBAdapter(config);
}
