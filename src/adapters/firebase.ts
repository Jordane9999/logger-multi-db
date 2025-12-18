/**
 * Firebase/Firestore Adapter for Universal Logger
 */

// @ts-expect-error - firebase-admin is a peer dependency, may not be installed
import admin from 'firebase-admin';
import { LogAdapter, LogEntry, LogFilter, LogLevel } from '../types/index.js';

export interface FirebaseAdapterConfig {
  serviceAccount?: any;
  projectId?: string;
  collectionName?: string;
  ttlDays?: number;
}

export class FirebaseAdapter implements LogAdapter {
  private app: admin.app.App | null = null;
  private db: admin.firestore.Firestore | null = null;
  private config: Required<Pick<FirebaseAdapterConfig, 'collectionName' | 'ttlDays'>> & FirebaseAdapterConfig;

  constructor(config: FirebaseAdapterConfig) {
    this.config = {
      ...config,
      collectionName: config.collectionName || 'logs',
      ttlDays: config.ttlDays || 30
    };
  }

  async connect(): Promise<void> {
    try {
      const appConfig: any = {};

      if (this.config.serviceAccount) {
        appConfig.credential = admin.credential.cert(this.config.serviceAccount);
      }

      if (this.config.projectId) {
        appConfig.projectId = this.config.projectId;
      }

      this.app = admin.initializeApp(appConfig);
      this.db = admin.firestore(this.app);
    } catch (error) {
      throw new Error(`Firebase connection failed: ${(error as Error).message}`);
    }
  }

  async write(entry: LogEntry): Promise<void> {
    if (!this.db) {
      throw new Error('Firebase not connected');
    }

    const docData = {
      level: entry.level,
      message: entry.message,
      context: entry.context || null,
      timestamp: admin.firestore.Timestamp.fromDate(entry.timestamp),
      environment: entry.environment,
      service: entry.service,
      error: entry.error || null,
      createdAt: admin.firestore.Timestamp.now()
    };

    await this.db.collection(this.config.collectionName).add(docData);
  }

  async query(filter: LogFilter): Promise<LogEntry[]> {
    if (!this.db) {
      throw new Error('Firebase not connected');
    }

    let query: any = this.db.collection(this.config.collectionName);

    if (filter.level) {
      query = query.where('level', '==', filter.level);
    }

    if (filter.levels && filter.levels.length > 0) {
      query = query.where('level', 'in', filter.levels);
    }

    if (filter.userId) {
      query = query.where('context.userId', '==', filter.userId);
    }

    if (filter.requestId) {
      query = query.where('context.requestId', '==', filter.requestId);
    }

    if (filter.sessionId) {
      query = query.where('context.sessionId', '==', filter.sessionId);
    }

    if (filter.startDate) {
      query = query.where('timestamp', '>=', admin.firestore.Timestamp.fromDate(filter.startDate));
    }

    if (filter.endDate) {
      query = query.where('timestamp', '<=', admin.firestore.Timestamp.fromDate(filter.endDate));
    }

    query = query.orderBy('timestamp', 'desc');

    if (filter.limit) {
      query = query.limit(filter.limit);
    }

    if (filter.offset) {
      query = query.offset(filter.offset);
    }

    const snapshot = await query.get();

    const logs: LogEntry[] = [];

    snapshot.forEach((doc: any) => {
      const data = doc.data();
      
      if (filter.searchText) {
        const searchLower = filter.searchText.toLowerCase();
        const messageMatch = data.message.toLowerCase().includes(searchLower);
        const errorMatch = data.error?.message?.toLowerCase().includes(searchLower);
        
        if (!messageMatch && !errorMatch) {
          return;
        }
      }

      logs.push({
        id: doc.id,
        level: data.level as LogLevel,
        message: data.message,
        context: data.context,
        timestamp: data.timestamp.toDate(),
        environment: data.environment,
        service: data.service,
        error: data.error
      });
    });

    return logs;
  }

  async close(): Promise<void> {
    if (this.app) {
      await this.app.delete();
      this.app = null;
      this.db = null;
    }
  }

  getFirestore(): admin.firestore.Firestore | null {
    return this.db;
  }

  async cleanOldLogs(): Promise<number> {
    if (!this.db) {
      throw new Error('Firebase not connected');
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.ttlDays);

    const snapshot = await this.db
      .collection(this.config.collectionName)
      .where('timestamp', '<', admin.firestore.Timestamp.fromDate(cutoffDate))
      .get();

    const batch = this.db.batch();
    let count = 0;

    snapshot.forEach((doc: any) => {
      batch.delete(doc.ref);
      count++;
    });

    if (count > 0) {
      await batch.commit();
    }

    return count;
  }
}

export function createFirebaseAdapter(config: FirebaseAdapterConfig): FirebaseAdapter {
  return new FirebaseAdapter(config);
}
