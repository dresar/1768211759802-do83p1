# Changelog

## [1.7.1] - 2026-01-12

### Changed
- Replaced `ourin` dependency (custom fork `elaina-baileys`) with official `@whiskeysockets/baileys` package.
- Updated all `require('ourin')` to `require('@whiskeysockets/baileys')` across the codebase.
- Verified compatibility with the official Baileys library.

### Fixed
- Resolved peer dependency conflicts with `jimp` during installation.

### Removed
- Removed custom `ourin` dependency entry from `package.json`.
