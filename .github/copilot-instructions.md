# AI Agent Instructions for HubSpot Form Usability Enhancements

## Project Overview

This is an **npm package** that enhances HubSpot embedded forms with validation, accessibility, and styling. Users get **pre-compiled CSS** — no build tools required in their projects.

## Critical Architecture Decisions

### CSS Custom Properties System

- **Base colors** in `:root` (top of `src/styles.css`) - users override these
- **Component colors** reference base colors via `var()` and cascade automatically
- Users only modify `:root` variables; component styles update automatically
- **Dark backgrounds**: `.hs-form-reverse` class auto-applies white text and inverted colors
- **No Tailwind CSS** — see `docs/why-no-tailwind.md` for rationale

### React Hydration Safety Pattern

**Critical**: This module is designed to avoid React hydration conflicts (Error #418/#422)

- Auto-init uses `window.addEventListener('load')` + 1000ms delay (see `autoInit()` in `src/index.js`)
- Two-phase initialization: immediate CSS positioning, delayed DOM manipulation
- Progress bar positioning happens **immediately** via `positionProgressBars()` to prevent layout shifts
- Form setup happens **after hydration** via `whenSafeToInitialize()`
- Users can disable auto-init: `window.HUBSPOT_FORMS_NO_AUTO_INIT = true`

### Build System (Dual Output)

```bash
npm run build              # All builds
npm run build:js           # Rollup → ESM + CJS
npm run build:css          # PostCSS → compiled CSS (with nesting support)
npm run build:types        # Copy TypeScript definitions
```

**Key files:**

- `rollup.config.js`: Dual builds (ESM + CJS), both terser-minified
- `postcss.config.js`: Uses `postcss-nested` for CSS nesting syntax
- Output: `dist/index.esm.js`, `dist/index.js`, `dist/styles.css`

## Code Conventions

### CSS Architecture (`src/styles.css`)

1. **CSS nesting syntax** - processed by `postcss-nested`
2. **Lines 21-27**: Color customization docs - critical for users
3. **Flexbox ordering system** for validation errors/progress bars:
   - `order: 0` - Headings, rich text, images
   - `order: 1` - Validation errors (`.hsfc-CustomValidationError`)
   - `order: 2` - Progress bars (`.hsfc-ProgressBar--repositioned`)
   - `order: 3` - Form fields
   - `order: 4` - Navigation buttons

### JavaScript Patterns (`src/hubspot-forms.js` + `src/index.js`)

- **MutationObserver pattern**: Watch for dynamically added HubSpot forms and progress bars
- **Cleanup controllers**: Use `AbortController` for event listener cleanup
- **Validator modules**: `CharacterLimitValidator`, `FileUploadValidator`, `FieldValidator` - all exportable
- **NO jQuery** - Pure vanilla JS with modern DOM APIs

### Documentation Standards (`README.md`)

- **Always clarify**: Users get pre-compiled CSS — no build tools needed
- **Prominent features**: Dark background support (`.hs-form-reverse`), React hydration safety
- **Two main audiences**:
  1. Standard projects (override `:root` CSS variables)
  2. React/SSR apps (use delayed init pattern)

## Key Workflows

### Local Development

```bash
npm run dev                # Watch mode (Rollup + PostCSS)
npm run build              # Full production build
```

### Testing Changes

1. Build: `npm run build`
2. Test in `hsforms-sbx` workspace via local linking or file path
3. Check browser console for hydration errors
4. Verify progress bar positioning happens immediately (no flash)

### Publishing Checklist

1. Version bump in `package.json`
2. Full build: `npm run build`
3. Verify `dist/` contains: `index.esm.js`, `index.js`, `styles.css`, `index.d.ts`
4. `npm publish` (runs `prepublishOnly` script automatically)

## Integration Points

### HubSpot Form Detection

- Looks for `.hsfc-Form` class (HubSpot's Developer Code component)
- Targets `.hsfc-Step`, `.hsfc-Row`, `.hsfc-ProgressBar` selectors
- Removes `style[data-hsfc-id="BaseStyle"]` to override HubSpot's default styles

### CSS Class Naming

- Prefix `hsfc-*` = HubSpot Form Component classes (from HubSpot)
- Prefix `hs-form-*` = Our enhancement classes (e.g., `.hs-form-reverse`)
- Color variables: `--color-hs-form-*` (base colors) + component-specific variants

### Export Structure

```javascript
// Main exports (src/index.js)
export default init; // Simple usage
export { init }; // Named export
export { HubSpotFormManager }; // Granular control
export { CharacterLimitValidator }; // Individual validators
export { FileUploadValidator };
export { initializeWithTwoPhases }; // React-safe two-phase init
```

## Common Pitfalls to Avoid

1. **Don't tell users to install any CSS framework** — they get pre-compiled CSS
2. **Don't suggest build tool configurations** — users just import the CSS file
3. **Always call `init()` in delayed import examples** — ensures progress bar positioning works
4. **Don't modify auto-init timing** without testing React hydration scenarios
5. **Character limit**: Default is 500 chars (configurable), matches HubSpot's native limit

## File References

- **Color system docs**: `src/styles.css` — see `:root` block and file header comments
- **React hydration safety**: `src/index.js` — see `whenSafeToInitialize()` and `autoInit()`
- **Progress bar positioning**: `src/index.js` — see `positionProgressBars()`
- **Reverse theme styles**: `src/styles.css` — search for `.hs-form-reverse`
- **Theme template**: `theme-template.css` — published with package for implementers
- **Build configuration**: `package.json` scripts, `rollup.config.js`, `postcss.config.js`
- **Why no Tailwind**: `docs/why-no-tailwind.md`
