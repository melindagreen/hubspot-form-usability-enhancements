# Development and Publishing Guide

This package publishes pre-built JS and CSS artifacts from dist.

## Prerequisites

- Node.js 20+
- npm 10+

## Build commands

| Command | Purpose | Output |
| --- | --- | --- |
| npm run build | Full build | dist JS, CSS, and d.ts |
| npm run build:js | Rollup bundles | dist/index.esm.js, dist/index.js, dist/index.cdn.js |
| npm run build:css | PostCSS build | dist/styles.css |
| npm run build:types | Types copy | dist/index.d.ts |

## Important integration detail

Consumer apps using file dependency install from package exports in dist, not src.

If you change src, run npm run build in this repo before testing in a consumer app.

## Local workflow with hsforms-sbx

1. In this repo, run npm run build.
2. In hsforms-sbx, keep dependency as file:../hubspot-form-usability-enhancements.
3. In hsforms-sbx, run npm install and npm run build.
4. Verify behavior in browser.

## Publish workflow

1. Run npm run build.
2. Verify dist files exist:
   - dist/index.esm.js
   - dist/index.js
   - dist/index.cdn.js
   - dist/styles.css
   - dist/index.d.ts
3. Bump version using npm version patch, minor, or major.
4. Publish with npm publish.
5. Push commit and tags.

## Troubleshooting

### Consumer app still shows old behavior

1. Rebuild this package with npm run build.
2. Reinstall dependency in consumer app with npm install.
3. Rebuild consumer app with npm run build.

### Package publish fails

1. Check npm login using npm whoami.
2. Confirm target version is not already published.
