# Why This Package Doesn't Use Tailwind CSS

_Document created: March 2026_

## Summary

This package intentionally avoids Tailwind CSS as a dependency (dev or otherwise) to maximize compatibility with consumer projects and avoid CSS conflicts.

## Current Architecture

The package uses:

- **PostCSS** with `postcss-nested` for CSS nesting syntax
- **CSS Custom Properties** (`:root` variables) for theming
- **Pure CSS** output that works universally

No Tailwind directives are used:

- No `@import "tailwindcss"`
- No `@apply`
- No `@theme`
- No `@layer`
- No `@tailwind`

## Analysis: Tailwind v4 as Dev Dependency

### Potential Benefits

| Benefit                               | Reality Check                                                                        |
| ------------------------------------- | ------------------------------------------------------------------------------------ |
| Utility classes for rapid prototyping | We're writing component CSS for HubSpot forms — utility classes don't help much here |
| `@theme` directive for design tokens  | We already have a robust CSS variable system in `:root` that works great             |
| Smaller output via purging            | Our CSS is already focused — ~658 lines of intentional styles                        |
| Consistent spacing/colors             | Already handled by `--color-hs-form-*` and `--font-hs-form-*` variables              |

### Confirmed Drawbacks

| Risk                              | Severity   | Notes                                                                                                                                         |
| --------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **CSS conflicts at install site** | **HIGH**   | Tailwind's reset/preflight injects global styles that break existing sites. This was the primary issue when Tailwind was previously included. |
| **Larger bundle size**            | Medium     | Even tree-shaken, Tailwind adds overhead                                                                                                      |
| **Build complexity**              | Low-Medium | Requires `@tailwindcss/postcss` plugin + config                                                                                               |
| **Consumer confusion**            | Medium     | Users might think they need Tailwind when they don't                                                                                          |
| **Peer dependency conflicts**     | **HIGH**   | If the consuming project has a different Tailwind version, causes version resolution issues                                                   |

## Historical Context

Tailwind was previously included in this project but was removed due to **heavy conflicts** when the package was installed on consumer sites. Even as a dev dependency, issues arose because:

1. Tailwind's Preflight (CSS reset) leaked into the distributed CSS
2. Consumer sites with their own Tailwind installations faced version conflicts
3. The package's CSS variables conflicted with Tailwind's default theme

## Recommended Approach

The current setup is ideal for a distributable npm package:

1. **Pure CSS with nesting** — universally compatible
2. **CSS variables for theming** — consumers override `:root` without build tools
3. **No framework dependencies** — works everywhere (React, Vue, vanilla, WordPress, etc.)
4. **Small, focused output** — exactly what HubSpot forms need

## For Future Contributors

If considering adding Tailwind in the future, ensure:

1. Preflight/reset is completely disabled
2. No utility classes leak into distributed CSS
3. Output is tested on sites with and without Tailwind
4. Version conflicts are documented and tested
5. The value proposition is clear (what does Tailwind provide that CSS variables don't?)

The bar for adding Tailwind should be very high given the historical issues.
