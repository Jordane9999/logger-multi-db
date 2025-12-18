/**
 * Example: MySQL Adapter with ESM
 */

import { createLogger } from '@trenderz/universal-logger';
import { createMySQLAdapter } from '@trenderz/universal-logger/adapters/mysql';

async function main() {
  console.log('🐬 Universal Logger - MySQL Example (ESM)\n');

  // Create MySQL adapter
  const adapter = createMySQLAdapter({
    host: 'localhost',
    port: 3306,
    database: 'myapp',
    user: 'root',
    password: 'password',
    tableName: 'logs',
    autoCreateTable: true
  });

  // Create logger
  const logger = createLogger({
    adapter,
    service: 'backend',
    environment: 'staging'
  });

  // Initialize
  await logger.init();
  console.log('✅ Logger initialized\n');

  // Log examples
  logger.info('Order created', {
    orderId: 'order123',
    userId: 'user456',
    amount: 99.99
  });

  logger.warn('Low stock alert', {
    productId: 'prod789',
    currentStock: 5,
    threshold: 10
  });

  console.log('\n✅ Logs created!\n');

  // Query logs
  const recentLogs = await logger.query({
    startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
    limit: 20
  });

  console.log(`📊 Found ${recentLogs.length} logs in last 24h\n`);

  // Close
  await logger.close();
  console.log('👋 Connection closed');
}

main().catch(console.error);
