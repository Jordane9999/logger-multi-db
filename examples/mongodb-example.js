/**
 * Example: MongoDB Adapter with ESM
 */

import { createLogger, createMongoDBAdapter } from "logger-multi-db";

async function main() {
  console.log("🍃 Universal Logger - MongoDB Example (ESM)\n");

  // Create MongoDB adapter
  const adapter = createMongoDBAdapter({
    uri: process.env.MONGODB_URI || "mongodb://localhost:27017",
    dbName: "myapp",
    collectionName: "logs",
    ttlDays: 30,
  });

  // Create logger
  const logger = createLogger({
    adapter,
    service: "api",
    environment: "development",
    enableConsole: true,
    minLevel: "info",
  });

  // Initialize
  await logger.init();
  console.log("✅ Logger initialized\n");

  // Log different levels
  logger.info("User logged in", {
    userId: "user123",
    email: "jordan@example.com", // Will be masked
    ip: "192.168.1.1",
  });

  logger.warn("Rate limit approaching", {
    userId: "user123",
    current: 95,
    limit: 100,
  });

  logger.error(
    "Payment failed",
    {
      userId: "user123",
      amount: 50.0,
      paymentMethod: "stripe",
    },
    new Error("Stripe timeout")
  );

  console.log("\n✅ Logs created!\n");

  // Query logs
  const recentLogs = await logger.query({
    limit: 10,
  });

  console.log(`📊 Found ${recentLogs.length} recent logs\n`);

  // Query by user
  const userLogs = await logger.query({
    userId: "user123",
    limit: 5,
  });

  console.log(`👤 Found ${userLogs.length} logs for user123\n`);

  // Close
  await logger.close();
  console.log("👋 Connection closed");
}

main().catch(console.error);
