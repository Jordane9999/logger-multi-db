# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Complete CI/CD pipeline with GitHub Actions
- Automated npm publishing workflow
- Comprehensive deployment documentation
- Release scripts and checklist
- Winston comparison documentation

### Fixed
- Next.js compatibility issues with process.env
- Critical bug: await adapter.write() to prevent log loss
- TypeScript compilation errors with Node.js types
- Browser environment detection

### Changed
- Improved environment detection for Next.js
- Better error handling in async write operations

## [1.0.8] - 2024-12-20

### Added
- Next.js compatibility guide (docs/NEXTJS.md)
- Winston comparison guide (docs/COMPARISON-WINSTON.md)

### Fixed
- TypeScript configuration for Node.js types
- Unsafe process.env.NODE_ENV access
- Unawaited async adapter.write() calls
- Build compilation errors

### Changed
- Environment detection now safely checks for process availability
- Logger warns when used in browser environments

## [1.0.7] - 2024-XX-XX

### Added
- File adapter with rotation support
- Query API for all adapters
- Automatic data sanitization

### Fixed
- Minor bug fixes and improvements

## [1.0.0] - 2024-XX-XX

### Added
- Initial release
- MongoDB adapter
- PostgreSQL adapter
- MySQL adapter
- Firebase adapter
- File adapter
- Universal Logger API
- TypeScript support
- ESM support
- Automatic sanitization
- Console logging with colors

---

## Release Types

- **MAJOR** (X.0.0): Breaking changes
- **MINOR** (1.X.0): New features, backward compatible
- **PATCH** (1.0.X): Bug fixes, documentation updates

[Unreleased]: https://github.com/Jordane9999/logger-multi-db/compare/v1.0.8...HEAD
[1.0.8]: https://github.com/Jordane9999/logger-multi-db/releases/tag/v1.0.8
[1.0.7]: https://github.com/Jordane9999/logger-multi-db/releases/tag/v1.0.7
[1.0.0]: https://github.com/Jordane9999/logger-multi-db/releases/tag/v1.0.0
