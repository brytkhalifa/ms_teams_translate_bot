import fs from 'node:fs';
import path from 'node:path';

/** Prefer built `dist/tabs`, fall back to `src/tabs` for dev. */
export function resolveTabFilePath(fileName: string): string {
  const distPath = path.resolve('dist/tabs', fileName);
  const srcPath = path.resolve('src/tabs', fileName);
  return fs.existsSync(distPath) ? distPath : srcPath;
}
