import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../..');
const dist = path.resolve(__dirname, '../dist');

const filesToCopy = [
  'index.html',
  'landing-terminal.html',
  'pricing.html',
  'founders-letter.html',
  'terms.html',
  'privacy-policy.html',
  'risk-disclosure.html',
  'cancellation-refunds.html',
  'support.js',
  'robots.txt',
  'sitemap.xml',
  'favicon.ico',
  'favicon-32x32.png',
  'apple-touch-icon.png',
  '.nojekyll',
];

if (!fs.existsSync(dist)) {
  fs.mkdirSync(dist, { recursive: true });
}

for (const file of filesToCopy) {
  const src = path.join(root, file);
  const dest = path.join(dist, file);
  if (!fs.existsSync(src)) {
    console.warn(`Skipping missing file: ${file}`);
    continue;
  }
  // Never overwrite the Astro blog output directory.
  if (file === 'blog' && fs.existsSync(dest)) {
    console.warn('Skipping blog/ to protect Astro output.');
    continue;
  }
  fs.cpSync(src, dest, { recursive: true, force: true });
  console.log(`Copied ${file}`);
}

const uploadsSrc = path.join(root, 'uploads');
const uploadsDest = path.join(dist, 'uploads');
if (fs.existsSync(uploadsSrc)) {
  fs.cpSync(uploadsSrc, uploadsDest, { recursive: true, force: true });
  console.log('Copied uploads/');
}

console.log('Root assets merged into Astro dist.');
