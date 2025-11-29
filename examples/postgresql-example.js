/**
 * Example: PostgreSQL Adapter with ESM
 */

import { createLogger, createPostgreSQLAdapter } from '@trenderz/universal-logger';

async function main() {
  console.log('🐘 Universal Logger - PostgreSQL Example (ESM)\n');

  // Create PostgreSQL adapter
  const adapter = createPostgreSQLAdapter({
    host: 'localhost',
    port: 5432,
    database: 'myapp',
    user: 'postgres',
    password: 'password',
    tableName: 'logs',
    autoCreateTable: true
  });

  // Create logger
  const logger = createLogger({
    adapter,
    service: 'web',
    environment: 'production',
    enableConsole: false,
    minLevel: 'info'
  });

  // Initialize
  await logger.init();
  console.log('✅ Logger initialized\n');

  // Log examples
  logger.info('Application started', {
    version: '1.0.0',
    port: 3000
  });

  logger.error('Database connection failed', {
    host: 'db.example.com',
    retries: 3
  }, new Error('Connection timeout'));

  console.log('\n✅ Logs created!\n');

  // Query logs
  const errorLogs = await logger.query({
    level: 'error',
    limit: 10
  });

  console.log(`🔴 Found ${errorLogs.length} error logs\n`);

  // Close
  await logger.close();
  console.log('👋 Connection closed');
}

main().catch(console.error);
