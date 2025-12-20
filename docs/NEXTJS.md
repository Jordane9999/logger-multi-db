# Using logger-multi-db with Next.js

This guide explains how to properly use `logger-multi-db` in Next.js applications.

## 🚨 Important: Server-Side Only 

**All database adapters (MongoDB, PostgreSQL, MySQL, Firebase, File) are server-side only.** They use Node.js APIs that are not available in the browser.

### ✅ Where to Use the Logger

Use the logger in these Next.js contexts:

1. **Server Components** (default in App Router)
2. **API Routes** (`/app/api/**/route.ts` or `/pages/api/*.ts`)
3. **Server Actions** (`'use server'` functions)
4. **Middleware** (`middleware.ts`)
5. **Server-side functions** (`getServerSideProps`, `getStaticProps`)

### ❌ Where NOT to Use the Logger

Do NOT use the logger in:

1. **Client Components** (`'use client'`)
2. **Browser-side code**
3. **React hooks** that run in the browser
4. **Client-side event handlers**

---

## 📦 Installation

```bash
npm install logger-multi-db

# Install your database adapter
npm install mongodb        # For MongoDB
npm install pg             # For PostgreSQL
npm install mysql2         # For MySQL
npm install firebase-admin # For Firebase
```

---

## 🔧 Setup

### Option 1: Singleton Logger (Recommended)

Create a logger instance that can be imported throughout your app:

**`lib/logger.ts`** (Server-side only)

```typescript
import { createLogger, LogLevel } from 'logger-multi-db';
import { createMongoDBAdapter } from 'logger-multi-db/adapters/mongodb';

// Singleton instance
let logger: ReturnType<typeof createLogger> | null = null;

export async function getLogger() {
  if (logger) return logger;

  logger = createLogger({
    adapter: createMongoDBAdapter({
      uri: process.env.MONGODB_URI!,
      dbName: 'myapp',
      collectionName: 'logs',
      ttlDays: 30,
    }),
    service: 'nextjs-app',
    environment: process.env.NODE_ENV || 'development',
    minLevel: LogLevel.INFO,
    enableConsole: process.env.NODE_ENV !== 'production',
  });

  await logger.init();
  return logger;
}

export { LogLevel };
```

### Option 2: Multiple Loggers

Create different loggers for different parts of your app:

**`lib/logger-api.ts`**

```typescript
import { createLogger, LogLevel } from 'logger-multi-db';
import { createPostgreSQLAdapter } from 'logger-multi-db/adapters/postgresql';

export const apiLogger = createLogger({
  adapter: createPostgreSQLAdapter({
    host: process.env.DB_HOST!,
    database: process.env.DB_NAME!,
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
  }),
  service: 'api',
  minLevel: LogLevel.INFO,
});

// Initialize in API route
await apiLogger.init();
```

---

## 📖 Usage Examples

### 1. Server Component (App Router)

```typescript
// app/dashboard/page.tsx
import { getLogger, LogLevel } from '@/lib/logger';

export default async function DashboardPage() {
  const logger = await getLogger();

  await logger.info('Dashboard viewed', {
    userId: 'user123',
    timestamp: new Date(),
  });

  return <div>Dashboard</div>;
}
```

### 2. API Route (App Router)

```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getLogger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  const logger = await getLogger();

  try {
    // Your logic here
    const users = await fetchUsers();

    await logger.info('Users fetched', {
      count: users.length,
      requestId: request.headers.get('x-request-id') || undefined,
    });

    return NextResponse.json({ users });
  } catch (error) {
    await logger.error(
      'Failed to fetch users',
      {
        url: request.url,
        method: request.method,
      },
      error as Error
    );

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
```

### 3. API Route (Pages Router)

```typescript
// pages/api/orders.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getLogger } from '@/lib/logger';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const logger = await getLogger();

  try {
    const orders = await getOrders();

    await logger.info('Orders fetched', {
      count: orders.length,
      userId: req.query.userId as string,
    });

    res.status(200).json({ orders });
  } catch (error) {
    await logger.error(
      'Failed to fetch orders',
      {
        userId: req.query.userId as string,
      },
      error as Error
    );

    res.status(500).json({ error: 'Internal Server Error' });
  }
}
```

### 4. Server Action (App Router)

```typescript
// app/actions/create-user.ts
'use server';

import { getLogger } from '@/lib/logger';

export async function createUser(formData: FormData) {
  const logger = await getLogger();

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;

  try {
    // Create user logic
    const user = await db.users.create({ name, email });

    await logger.info('User created', {
      userId: user.id,
      email: user.email,
    });

    return { success: true, user };
  } catch (error) {
    await logger.error(
      'Failed to create user',
      { name, email },
      error as Error
    );

    return { success: false, error: 'Failed to create user' };
  }
}
```

### 5. Middleware

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getLogger } from '@/lib/logger';

export async function middleware(request: NextRequest) {
  const logger = await getLogger();

  const start = Date.now();

  const response = NextResponse.next();

  await logger.info('Request processed', {
    url: request.url,
    method: request.method,
    duration: Date.now() - start,
    userAgent: request.headers.get('user-agent') || undefined,
  });

  return response;
}

export const config = {
  matcher: '/api/:path*',
};
```

---

## 🔒 Environment Variables

Create a `.env.local` file:

```bash
# MongoDB
MONGODB_URI=mongodb://localhost:27017

# PostgreSQL
DB_HOST=localhost
DB_NAME=myapp
DB_USER=postgres
DB_PASSWORD=password

# MySQL
MYSQL_HOST=localhost
MYSQL_DATABASE=myapp
MYSQL_USER=root
MYSQL_PASSWORD=password

# Firebase
FIREBASE_SERVICE_ACCOUNT=/path/to/serviceAccountKey.json

# General
NODE_ENV=development
```

---

## ⚡ Performance Tips

### 1. Use File Adapter in Development

For faster development, use the file adapter:

```typescript
import { createLogger, createFileAdapter } from 'logger-multi-db';

const logger = createLogger({
  adapter: createFileAdapter({
    logDir: './logs',
    filename: 'app.log',
    maxSize: 5 * 1024 * 1024, // 5MB
  }),
  service: 'dev',
});
```

### 2. Disable Console Logs in Production

```typescript
const logger = createLogger({
  adapter: /* your adapter */,
  enableConsole: process.env.NODE_ENV !== 'production',
});
```

### 3. Set Appropriate Log Levels

```typescript
import { LogLevel } from 'logger-multi-db';

const logger = createLogger({
  adapter: /* your adapter */,
  minLevel: process.env.NODE_ENV === 'production'
    ? LogLevel.WARN  // Only warnings and errors in prod
    : LogLevel.DEBUG // Everything in dev
});
```

### 4. Connection Pooling

Always reuse logger instances (singleton pattern) to avoid creating multiple database connections.

---

## 🐛 Troubleshooting

### Error: "Logger is running in a browser environment"

**Problem:** You're trying to use the logger in a Client Component.

**Solution:** Move the logger call to a Server Component, API Route, or Server Action.

```typescript
// ❌ Wrong - Client Component
'use client';
import { getLogger } from '@/lib/logger';

export default function ClientComponent() {
  const onClick = async () => {
    const logger = await getLogger(); // Error!
    await logger.info('Button clicked');
  };

  return <button onClick={onClick}>Click</button>;
}

// ✅ Correct - Use Server Action
'use client';

export default function ClientComponent() {
  const onClick = async () => {
    await logButtonClick(); // Call server action
  };

  return <button onClick={onClick}>Click</button>;
}

// actions/log.ts
'use server';
import { getLogger } from '@/lib/logger';

export async function logButtonClick() {
  const logger = await getLogger();
  await logger.info('Button clicked');
}
```

### Error: "Cannot find module 'mongodb'"

**Problem:** Database adapter peer dependency is not installed.

**Solution:** Install the required package:

```bash
npm install mongodb  # or pg, mysql2, firebase-admin
```

### Logs Not Appearing

**Problem:** Logger not initialized or write calls not awaited.

**Solution:** Always call `await logger.init()` and `await` all log methods:

```typescript
// ❌ Wrong
logger.info('test'); // Not awaited

// ✅ Correct
await logger.info('test');
```

---

## 📊 Query Logs

Query logs from your API routes:

```typescript
// app/api/logs/route.ts
import { NextResponse } from 'next/server';
import { getLogger, LogLevel } from '@/lib/logger';

export async function GET() {
  const logger = await getLogger();

  const recentErrors = await logger.query({
    level: LogLevel.ERROR,
    limit: 100,
    startDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24h
  });

  return NextResponse.json({ errors: recentErrors });
}
```

---

## 🔐 Security Best Practices

1. **Always sanitize sensitive data** (enabled by default)
2. **Use environment variables** for connection strings
3. **Set log TTL** to comply with GDPR (default: 30 days)
4. **Restrict log query endpoints** with authentication

```typescript
const logger = createLogger({
  adapter: createMongoDBAdapter({
    uri: process.env.MONGODB_URI!,
    ttlDays: 30, // Auto-delete logs after 30 days
  }),
  sanitize: true, // Mask passwords, tokens, etc.
});
```

---

## 📚 Additional Resources

- [Main Documentation](../README.md)
- [API Reference](./API.md)
- [Examples](../examples/)

---

**Made with ❤️ for Next.js developers**
