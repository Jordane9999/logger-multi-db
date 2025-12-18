---
name: Bug Report
about: Create a report to help us improve
title: '[BUG] '
labels: bug
assignees: ''
---

## 🐛 Bug Description

A clear and concise description of what the bug is.

## 📋 Steps to Reproduce

1. Go to '...'
2. Create logger with '...'
3. Call method '...'
4. See error

## ✅ Expected Behavior

A clear and concise description of what you expected to happen.

## ❌ Actual Behavior

A clear and concise description of what actually happened.

## 💻 Code Sample

```javascript
// Minimal code to reproduce the issue
import { createLogger, createFileAdapter } from '@trenderz/universal-logger';

const logger = createLogger({
  adapter: createFileAdapter()
});

// ... code that triggers the bug
```

## 🔧 Environment

- **Package Version**: [e.g., 1.0.0]
- **Node.js Version**: [e.g., 20.10.0]
- **OS**: [e.g., Ubuntu 22.04, Windows 11, macOS 14]
- **Adapter**: [e.g., MongoDB, PostgreSQL, File]
- **Database Version** (if applicable): [e.g., MongoDB 7.0]

## 📸 Screenshots

If applicable, add screenshots or error logs to help explain your problem.

## 📝 Additional Context

Add any other context about the problem here.

## 🔍 Possible Solution

If you have suggestions on how to fix the bug, please describe them here.
