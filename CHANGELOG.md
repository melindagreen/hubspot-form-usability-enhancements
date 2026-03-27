# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Theme template file** (`theme-template.css`) — copy-ready file with all CSS variables organized by component, published with the package
- **CSS Variables Reference** in README with collapsible sections showing cascade relationships
- **`.nvmrc`** file specifying Node 24.14.1
- **CSS minification** via cssnano (~30% smaller CSS output)
- **Export for theme-template** — can now import via `@fahlgren-mortine/hubspot-form-usability-enhancements/theme-template`
- Documentation: `docs/DEVELOPMENT.md` — build process, local dev workflow, publishing guide
- Documentation: `docs/why-no-tailwind.md` — rationale for pure CSS approach

### Changed

- **Node requirement raised to ≥20** (from ≥18) due to @rollup/plugin-terser v1.0.0
- **@rollup/plugin-terser upgraded to v1.0.0** — fixes serialize-javascript vulnerability
- Replaced `concurrently` with `nodemon` for simpler dev watch mode
- Switched from Tailwind CSS to pure PostCSS with `postcss-nested` for CSS nesting
- Improved checkbox/radio error border styling
- Updated copilot-instructions to use function names instead of hardcoded line numbers

### Fixed

- Removed stray `console.log()` in validation error handling
- Fixed incorrect `@theme` directive references in README (Tailwind v4 artifact)
- Fixed misleading environment variable documentation in examples.js
- Resolved all npm audit vulnerabilities (was 5, now 0)

### Removed

- Tailwind CSS dependency and all `@apply`/`@theme` usage
- `concurrently` dev dependency

## [1.0.1] - 2026-03-14

### Fixed

- CSS fixes for form field styling
- Minor style adjustments

## [1.0.0] - 2026-03-14

### Added

- Initial production release
- React hydration support with two-phase initialization
- WCAG 2.1 AA compliant validation
- Character limit validation with counter UI
- File upload validation (type and size)
- Dark background support via `.hs-form-reverse` class
- CSS custom properties system for theming
- TypeScript type definitions
- ESM and CommonJS dual builds

### Removed

- All Tailwind CSS references from documentation

## [0.1.0-alpha.1] - 2026-03-01

### Added

- Alpha release for testing
- Core form enhancement functionality
- Basic validation system

## [0.1.0-alpha.0] - 2026-02-15

### Added

- Initial alpha release
- Basic HubSpot form detection and enhancement
- Character limit enforcement

[Unreleased]: https://github.com/FahlgrenMortineDigital/hubspot-form-usability-enhancements/compare/v1.0.1...HEAD
[1.0.1]: https://github.com/FahlgrenMortineDigital/hubspot-form-usability-enhancements/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/FahlgrenMortineDigital/hubspot-form-usability-enhancements/compare/v0.1.0-alpha.1...v1.0.0
[0.1.0-alpha.1]: https://github.com/FahlgrenMortineDigital/hubspot-form-usability-enhancements/compare/v0.1.0-alpha.0...v0.1.0-alpha.1
[0.1.0-alpha.0]: https://github.com/FahlgrenMortineDigital/hubspot-form-usability-enhancements/releases/tag/v0.1.0-alpha.0
