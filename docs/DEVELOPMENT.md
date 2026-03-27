# Development & Publishing Guide

This document covers the build process, local development workflow, and NPM publishing for `@fahlgren-mortine/hubspot-form-usability-enhancements`.

## Prerequisites

- Node.js 18+
- npm 9+
- NPM registry access for `@fahlgren-mortine` scope

## Build System Overview

The package uses a dual-output build system producing both ESM and CJS bundles:

| Command               | Description                 | Output                               |
| --------------------- | --------------------------- | ------------------------------------ |
| `npm run build`       | Full production build       | All dist files                       |
| `npm run build:js`    | JavaScript only (Rollup)    | `dist/index.esm.js`, `dist/index.js` |
| `npm run build:css`   | CSS only (PostCSS/Tailwind) | `dist/styles.css`                    |
| `npm run build:types` | TypeScript definitions      | `dist/index.d.ts`                    |
| `npm run dev`         | Watch mode for development  | Live rebuilds                        |

### Output Files

After running `npm run build`, the `dist/` directory contains:

```
dist/
├── index.esm.js      # ES Module (for modern bundlers)
├── index.js          # CommonJS (for Node/older bundlers)
├── index.d.ts        # TypeScript definitions
└── styles.css        # Compiled CSS (no Tailwind dependency for consumers)
```

## Local Development Workflow

### Working with a Consumer Project (e.g., hsforms-sbx)

When developing the package alongside a project that consumes it:

#### 1. Build the Package

```bash
cd /path/to/hubspot-form-usability-enhancements
npm run build
```

#### 2. Link to Consumer Project

The consumer project should have a `file:` reference in its `package.json`:

```json
{
  "dependencies": {
    "@fahlgren-mortine/hubspot-form-usability-enhancements": "file:../hubspot-form-usability-enhancements"
  }
}
```

#### 3. Reinstall in Consumer Project

After building the package:

```bash
cd /path/to/consumer-project
npm uninstall @fahlgren-mortine/hubspot-form-usability-enhancements
npm install ../hubspot-form-usability-enhancements
npm run build
```

Or use a convenience script (if available):

```bash
./upgrade_enhancements_local
```

#### 4. Iterate

1. Make changes to source files in `src/`
2. Run `npm run build` in this package
3. Run `npm run build` in consumer project
4. Test changes

### Watch Mode (Development)

For faster iteration during active development:

```bash
npm run dev
```

This watches both JS and CSS files and rebuilds on changes. Note: You'll still need to rebuild the consumer project to see changes.

## Publishing to NPM

### Pre-Publish Checklist

1. **Ensure all changes are committed**

   ```bash
   git status
   ```

2. **Test the build**

   ```bash
   npm run build
   ```

3. **Verify dist/ contents**

   ```bash
   ls -la dist/
   # Should contain: index.esm.js, index.js, index.d.ts, styles.css
   ```

4. **Test in consumer project with local link**
   - Ensure the package works correctly before publishing

### Version Bump

Follow [Semantic Versioning](https://semver.org/):

- **Patch** (1.0.x): Bug fixes, no API changes
- **Minor** (1.x.0): New features, backward compatible
- **Major** (x.0.0): Breaking changes

```bash
# Patch release
npm version patch

# Minor release
npm version minor

# Major release
npm version major
```

This automatically:

- Updates `package.json` version
- Creates a git commit
- Creates a git tag

### Publish

```bash
npm publish
```

The `prepublishOnly` script automatically runs `npm run build` before publishing.

### Post-Publish

1. **Push git tags**

   ```bash
   git push && git push --tags
   ```

2. **Update consumer projects** to use the new NPM version:
   ```bash
   # In consumer project
   npm install @fahlgren-mortine/hubspot-form-usability-enhancements@latest
   ```

## Complete Release Workflow

Here's the full workflow for releasing a new version:

```bash
# 1. Ensure working directory is clean
git status

# 2. Build and test
npm run build

# 3. Bump version (choose one)
npm version patch  # or minor/major

# 4. Publish to NPM
npm publish

# 5. Push to git
git push && git push --tags

# 6. Notify consumer projects to update
```

## Source File Reference

| File                   | Purpose                                      |
| ---------------------- | -------------------------------------------- |
| `src/hubspot-forms.js` | Core form manager and validators             |
| `src/index.js`         | Main entry point, exports, auto-init logic   |
| `src/index.d.ts`       | TypeScript type definitions                  |
| `src/styles.css`       | CSS styles (uses postcss-nested for nesting) |
| `rollup.config.js`     | JavaScript bundling configuration            |
| `postcss.config.js`    | CSS processing configuration                 |

## Troubleshooting

### Build Fails with CSS Errors

Ensure dependencies are installed:

```bash
npm install
npm run build:css
```

### Consumer Project Doesn't See Changes

1. Ensure the package was rebuilt: `npm run build`
2. Reinstall in consumer: `npm uninstall && npm install <path>`
3. Rebuild consumer project: `npm run build`

### NPM Publish Fails

- Verify you're logged in: `npm whoami`
- Verify scope access: Check `@fahlgren-mortine` organization membership
- Check for version conflicts: Ensure version doesn't already exist
