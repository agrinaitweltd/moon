import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const root = path.join(process.cwd(), process.argv[2] || 'public');
const terms = [
  /Briffa/g,
  /BRIFFA/g,
  /briffa\.com/g,
  /www\.briffa\.com/g,
  /London/g,
  /United Kingdom/g,
  /\bUK\b/g,
  /Ireland/g,
  /Cork/g,
  /\+44/g,
  /\+353/g,
  /020 709/g,
  /wp-admin/g,
  /admin-ajax/g,
  /googletagmanager/g,
  /bat\.bing/g,
  /briffalegal/g
];
const extensions = new Set(['.html', '.js', '.css', '.json', '.txt', '.xml', '.svg']);

const files = [];
const walk = (dir) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (extensions.has(path.extname(entry.name).toLowerCase())) files.push(full);
  }
};

if (!existsSync(root)) throw new Error(`Missing audit folder: ${root}`);
walk(root);

const findings = new Map(terms.map((term) => [term.source, []]));
for (const file of files) {
  let text;
  try {
    text = readFileSync(file, 'utf8');
  } catch {
    continue;
  }
  for (const term of terms) {
    term.lastIndex = 0;
    if (term.test(text)) {
      const rel = path.relative(root, file);
      const match = text.match(term)?.[0] || term.source;
      findings.get(term.source).push(`${rel}: ${match}`);
    }
  }
}

for (const [term, hits] of findings) {
  console.log(`${term}: ${hits.length}`);
  for (const hit of hits.slice(0, 10)) console.log(`  ${hit}`);
}
