/**
 * File Adapter for Universal Logger
 * Writes logs to local files with rotation support
 */

import { appendFile, mkdir, readFile, readdir, stat, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { LogAdapter, LogEntry, LogFilter, LogLevel } from '../types/index.js';

export interface FileAdapterConfig {
  logDir?: string;              // Directory for log files (default: './logs')
  filename?: string;            // Base filename (default: 'app.log')
  maxSize?: number;             // Max file size in bytes (default: 10MB)
  maxFiles?: number;            // Max number of rotated files (default: 5)
  enableRotation?: boolean;     // Enable file rotation (default: true)
  format?: 'json' | 'text';     // Log format (default: 'json')
}

export class FileAdapter implements LogAdapter {
  private config: Required<FileAdapterConfig>;
  private currentFile: string;

  constructor(config: FileAdapterConfig = {}) {
    this.config = {
      logDir: config.logDir || './logs',
      filename: config.filename || 'app.log',
      maxSize: config.maxSize || 10 * 1024 * 1024, // 10MB
      maxFiles: config.maxFiles || 5,
      enableRotation: config.enableRotation ?? true,
      format: config.format || 'json'
    };

    this.currentFile = join(this.config.logDir, this.config.filename);
  }

  async connect(): Promise<void> {
    try {
      // Create log directory if it doesn't exist
      if (!existsSync(this.config.logDir)) {
        await mkdir(this.config.logDir, { recursive: true });
      }
    } catch (error) {
      throw new Error(`File adapter connection failed: ${(error as Error).message}`);
    }
  }

  async write(entry: LogEntry): Promise<void> {
    try {
      // Check if rotation is needed
      if (this.config.enableRotation) {
        await this.rotateIfNeeded();
      }

      // Format log entry
      const logLine = this.formatLogEntry(entry);

      // Append to file
      await appendFile(this.currentFile, logLine + '\n', 'utf-8');
    } catch (error) {
      console.error('FileAdapter: Failed to write log', error);
    }
  }

  private formatLogEntry(entry: LogEntry): string {
    if (this.config.format === 'json') {
      return JSON.stringify(entry);
    }

    // Text format: [TIMESTAMP] [LEVEL] [SERVICE] MESSAGE {context}
    const parts = [
      `[${entry.timestamp.toISOString()}]`,
      `[${entry.level.toUpperCase()}]`,
      `[${entry.service}]`,
      entry.message
    ];

    if (entry.context && Object.keys(entry.context).length > 0) {
      parts.push(JSON.stringify(entry.context));
    }

    if (entry.error) {
      parts.push(`\nError: ${entry.error.message}`);
      if (entry.error.stack) {
        parts.push(`\n${entry.error.stack}`);
      }
    }

    return parts.join(' ');
  }

  private async rotateIfNeeded(): Promise<void> {
    try {
      // Check if current file exists and its size
      if (!existsSync(this.currentFile)) {
        return;
      }

      const stats = await stat(this.currentFile);

      if (stats.size >= this.config.maxSize) {
        await this.rotateFiles();
      }
    } catch (error) {
      console.error('FileAdapter: Rotation check failed', error);
    }
  }

  private async rotateFiles(): Promise<void> {
    try {
      const baseName = this.config.filename;
      const ext = baseName.includes('.') ? baseName.split('.').pop() : 'log';
      const nameWithoutExt = baseName.replace(`.${ext}`, '');

      // Delete oldest file if we're at max files
      const oldestFile = join(this.config.logDir, `${nameWithoutExt}.${this.config.maxFiles}.${ext}`);
      if (existsSync(oldestFile)) {
        await unlink(oldestFile);
      }

      // Rotate existing files
      for (let i = this.config.maxFiles - 1; i >= 1; i--) {
        const oldFile = join(this.config.logDir, `${nameWithoutExt}.${i}.${ext}`);
        const newFile = join(this.config.logDir, `${nameWithoutExt}.${i + 1}.${ext}`);

        if (existsSync(oldFile)) {
          await appendFile(newFile, await readFile(oldFile, 'utf-8'));
          await unlink(oldFile);
        }
      }

      // Rotate current file to .1
      const rotatedFile = join(this.config.logDir, `${nameWithoutExt}.1.${ext}`);
      await appendFile(rotatedFile, await readFile(this.currentFile, 'utf-8'));
      await unlink(this.currentFile);
    } catch (error) {
      console.error('FileAdapter: Rotation failed', error);
    }
  }

  async query(filter: LogFilter): Promise<LogEntry[]> {
    try {
      const logs: LogEntry[] = [];

      // Read all log files
      const files = await this.getLogFiles();

      for (const file of files) {
        const content = await readFile(file, 'utf-8');
        const lines = content.split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            let entry: LogEntry;

            if (this.config.format === 'json') {
              const parsed = JSON.parse(line);
              // Convert timestamp string back to Date object
              entry = {
                ...parsed,
                timestamp: new Date(parsed.timestamp)
              };
            } else {
              entry = this.parseTextLog(line);
            }

            if (this.matchesFilter(entry, filter)) {
              logs.push(entry);
            }
          } catch (error) {
            // Skip malformed lines
            continue;
          }
        }
      }

      // Sort by timestamp descending
      logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      // Apply limit and offset
      const offset = filter.offset || 0;
      const limit = filter.limit || logs.length;

      return logs.slice(offset, offset + limit);
    } catch (error) {
      console.error('FileAdapter: Query failed', error);
      return [];
    }
  }

  private async getLogFiles(): Promise<string[]> {
    try {
      const files = await readdir(this.config.logDir);
      const baseName = this.config.filename.replace(/\.[^.]+$/, '');

      return files
        .filter(file => file.startsWith(baseName))
        .map(file => join(this.config.logDir, file))
        .sort()
        .reverse(); // Most recent first
    } catch (error) {
      return [];
    }
  }

  private parseTextLog(line: string): LogEntry {
    // Simple text parser - may not be perfect for all cases
    const match = line.match(/\[(.*?)\] \[(.*?)\] \[(.*?)\] (.*)/);

    if (!match) {
      throw new Error('Invalid log format');
    }

    const [, timestamp, level, service, rest] = match;

    return {
      timestamp: new Date(timestamp),
      level: level.toLowerCase() as LogLevel,
      service,
      message: rest,
      environment: 'unknown',
    };
  }

  private matchesFilter(entry: LogEntry, filter: LogFilter): boolean {
    if (filter.level && entry.level !== filter.level) {
      return false;
    }

    if (filter.levels && !filter.levels.includes(entry.level)) {
      return false;
    }

    if (filter.userId && entry.context?.userId !== filter.userId) {
      return false;
    }

    if (filter.requestId && entry.context?.requestId !== filter.requestId) {
      return false;
    }

    if (filter.sessionId && entry.context?.sessionId !== filter.sessionId) {
      return false;
    }

    if (filter.startDate && entry.timestamp < filter.startDate) {
      return false;
    }

    if (filter.endDate && entry.timestamp > filter.endDate) {
      return false;
    }

    if (filter.searchText) {
      const searchLower = filter.searchText.toLowerCase();
      const messageMatch = entry.message.toLowerCase().includes(searchLower);
      const errorMatch = entry.error?.message?.toLowerCase().includes(searchLower);

      if (!messageMatch && !errorMatch) {
        return false;
      }
    }

    return true;
  }

  async close(): Promise<void> {
    // Nothing to close for file adapter
  }

  /**
   * Get the current log file path
   */
  getLogFilePath(): string {
    return this.currentFile;
  }

  /**
   * Clear all log files
   */
  async clearLogs(): Promise<void> {
    try {
      const files = await this.getLogFiles();

      for (const file of files) {
        await unlink(file);
      }
    } catch (error) {
      console.error('FileAdapter: Failed to clear logs', error);
    }
  }
}

export function createFileAdapter(config: FileAdapterConfig = {}): FileAdapter {
  return new FileAdapter(config);
}
