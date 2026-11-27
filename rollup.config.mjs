import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import json from '@rollup/plugin-json';
import css from 'rollup-plugin-css-only';

// npm workspaces runs this configuration in each package directory.
export default {
  input: 'src/index.ts',
  output: { dir: 'dist', format: 'esm', sourcemap: true },
  plugins: [
    css(),
    nodeResolve({ browser: true }),
    commonjs(),
    typescript({ tsconfig: './tsconfig.json' }),
    json(),
    terser({ ecma: 2020, module: true, maxWorkers: 1 }),
  ],
  onwarn(warning, warn) {
    // A missing dependency must fail a clean build, not become a runtime import.
    if (warning.code === 'UNRESOLVED_IMPORT') throw new Error(warning.message);
    warn(warning);
  },
};
