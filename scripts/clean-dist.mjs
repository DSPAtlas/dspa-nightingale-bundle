import { rmSync } from 'node:fs';
import { basename, join } from 'node:path';

const packages = new Set([
  'nightingale-sequence',
  'nightingale-sequence-heatmap',
  'nightingale-structure',
  'nightingale-track',
]);
if (!packages.has(basename(process.cwd()))) {
  throw new Error('Run the build from a Nightingale package directory or via npm workspaces.');
}
rmSync(join(process.cwd(), 'dist'), { recursive: true, force: true });
