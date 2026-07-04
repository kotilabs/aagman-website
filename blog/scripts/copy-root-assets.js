import fs from 'fs';
import path from 'path';

const rootDir = path.resolve('..');
const outDir = path.resolve('dist');

const exclude = new Set([
  '.git',
  '.gitignore',
  'README.md',
  'blog',
  'node_modules',
  'package.json',
  'package-lock.json',
  'vercel.json',
]);

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

for (const entry of fs.readdirSync(rootDir)) {
  if (exclude.has(entry)) continue;
  const src = path.join(rootDir, entry);
  const dest = path.join(outDir, entry);
  copyRecursive(src, dest);
}

console.log(`Copied root assets into ${outDir}`);
