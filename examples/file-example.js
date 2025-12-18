/**
 * Example: File Adapter with ESM
 * Writes logs to local files with automatic rotation
 */

import { createLogger, createFileAdapter, LogLevel } from 'logger-multi-db';

async function main() {
  console.log('📁 Universal Logger - File Adapter Example (ESM)\n');

  // Create File adapter
  const adapter = createFileAdapter({
    logDir: './logs',           // Directory for log files
    filename: 'app.log',        // Base filename
    maxSize: 5 * 1024 * 1024,   // 5MB per file
    maxFiles: 3,                // Keep 3 rotated files
    enableRotation: true,       // Enable rotation
    format: 'json'              // 'json' or 'text'
  });

  // Create logger
  const logger = createLogger({
    adapter,
    service: 'file-example',
    environment: 'development',
    enableConsole: true,
    minLevel: LogLevel.DEBUG
  });

  // Initialize
  await logger.init();
  console.log('✅ Logger initialized\n');
  console.log(`📝 Logs will be written to: ${adapter.getLogFilePath()}\n`);

  // Log different levels
  logger.debug('Application starting', {
    version: '1.0.0',
    nodeVersion: process.version
  });

  logger.info('User logged in', {
    userId: 'user123',
    email: 'jordan@example.com',  // Will be masked
    ip: '192.168.1.1'
  });

  logger.warn('High memory usage detected', {
    memoryUsage: process.memoryUsage(),
    threshold: '80%'
  });

  logger.error('Database connection failed', {
    host: 'localhost',
    port: 5432,
    retries: 3
  }, new Error('Connection timeout after 30s'));

  console.log('\n✅ Logs created! Check the ./logs directory\n');

  // Query recent logs
  const recentLogs = await logger.query({
    limit: 5
  });

  console.log(`📊 Found ${recentLogs.length} recent logs:\n`);
  recentLogs.forEach((log, i) => {
    console.log(`${i + 1}. [${log.level.toUpperCase()}] ${log.message}`);
  });

  // Query only errors
  const errorLogs = await logger.query({
    level: LogLevel.ERROR
  });

  console.log(`\n🔴 Found ${errorLogs.length} error logs\n`);

  // Query by date range
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const todayLogs = await logger.query({
    startDate: yesterday,
    limit: 10
  });

  console.log(`📅 Found ${todayLogs.length} logs from last 24h\n`);

  // Search logs
  const searchResults = await logger.query({
    searchText: 'user',
    limit: 5
  });

  console.log(`🔍 Found ${searchResults.length} logs matching 'user'\n`);

  // Close
  await logger.close();
  console.log('👋 Logger closed');
  console.log('\n💡 Tip: Check the ./logs directory to see your log files!');
}

main().catch(console.error);
