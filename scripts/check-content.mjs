// Applies the content rules to the site's sources and the built pages.
// Prints file, line and rule for each problem, never the matched text.
// Reads text files only; images, fonts and PDFs are skipped untouched.
import { existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { findViolations, visibleText } from './lib/content-rules.mjs';

const TEXT = new Set(['.astro', '.ts', '.mjs', '.js', '.css', '.md', '.yaml', '.yml', '.json', '.svg', '.html', '.xml', '.txt']);
const BINARY = new Set(['.pdf', '.png', '.jpg', '.jpeg', '.webp', '.woff', '.woff2', '.ico', '.gif']);

/** @param {string} dir @returns {AsyncGenerator<string>} */
async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else yield path;
  }
}

if (!existsSync('dist')) {
  console.error('Run `npm run build` first: the check reads dist/.');
  process.exit(1);
}

/** @type {string[]} */
const problems = [];
let files = 0;
for (const dir of ['src', 'public', 'dist']) {
  for await (const file of walk(dir)) {
    const ext = extname(file).toLowerCase();
    if (BINARY.has(ext) || !TEXT.has(ext)) continue;
    files++;
    const raw = await readFile(file, 'utf8');
    for (const v of findViolations(raw)) problems.push(`${file}:${v.line}: ${v.message} [${v.rule}]`);
    if (ext === '.html') {
      for (const v of findViolations(visibleText(raw))) problems.push(`${file} (visible text): ${v.message} [${v.rule}]`);
    }
  }
}

if (problems.length > 0) {
  console.error(`Content check failed:\n${problems.join('\n')}`);
  process.exit(1);
}
console.log(`Content check passed: ${files} files.`);
