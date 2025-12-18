/**
 * Example: Firebase/Firestore Adapter with ESM
 */

import { createLogger, LogLevel } from '@trenderz/universal-logger';
import { createFirebaseAdapter } from '@trenderz/universal-logger/adapters/firebase';

async function main() {
  console.log('🔥 Universal Logger - Firebase Example (ESM)\n');

  // Create Firebase adapter
  const adapter = createFirebaseAdapter({
    serviceAccount: './serviceAccountKey.json',
    collectionName: 'logs',
    ttlDays: 30
  });

  // Create logger
  const logger = createLogger({
    adapter,
    service: 'mobile-app',
    environment: 'production'
  });

  // Initialize
  await logger.init();
  console.log('✅ Logger initialized\n');

  // Log examples
  logger.info('User signup', {
    userId: 'user789',
    provider: 'google',
    platform: 'ios'
  });

  logger.error('Push notification failed', {
    userId: 'user789',
    token: 'device-token-xyz'
  }, new Error('FCM error'));

  console.log('\n✅ Logs created!\n');

  // Query logs
  const userLogs = await logger.query({
    userId: 'user789',
    limit: 10
  });

  console.log(`👤 Found ${userLogs.length} logs for user\n`);

  // Close
  await logger.close();
  console.log('👋 Connection closed');
}

main().catch(console.error);
