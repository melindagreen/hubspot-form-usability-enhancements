import { nodeResolve } from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";

export default [
  // ESM build (for bundlers)
  {
    input: "src/index.js",
    output: {
      file: "dist/index.esm.js",
      format: "es",
      sourcemap: true,
    },
    plugins: [nodeResolve(), terser()],
  },
  // CommonJS build (for Node.js)
  {
    input: "src/index.js",
    output: {
      file: "dist/index.js",
      format: "cjs",
      sourcemap: true,
      exports: "named",
    },
    plugins: [nodeResolve(), terser()],
  },
  // IIFE build (for CDN/script tags - auto-initializes)
  {
    input: "src/index-cdn.js",
    output: {
      file: "dist/index.cdn.js",
      format: "iife",
      name: "HubSpotFormEnhancements",
      sourcemap: true,
    },
    plugins: [nodeResolve(), terser()],
  },
];
