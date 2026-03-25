/**
 * Reads `_bib/papers.bib` and writes `src/generated/publications.json` for the app bundle.
 */
import {parse} from 'bibtex-parse';
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const bibPath = path.join(root, '_bib', 'papers.bib');
const outPath = path.join(root, 'src', 'generated', 'publications.json');

function field(entry, name) {
  const f = entry.fields?.find((x) => x.name.toLowerCase() === name.toLowerCase());
  const v = f?.value;
  if (typeof v !== 'string') return '';
  return v.replace(/\s+/g, ' ').trim();
}

/** Conference / journal / publisher — shown on its own line above authors. */
function buildVenueLine(entry) {
  const venue =
    field(entry, 'booktitle') ||
    field(entry, 'journal') ||
    field(entry, 'publisher') ||
    '';
  return venue ? `${venue}.` : '';
}

/** Full author list + year — line below venue (highlights match names here). */
function buildAuthorsLine(entry) {
  const author = field(entry, 'author');
  const year = field(entry, 'year') || 'n.d.';
  if (author) return `${author} (${year}).`;
  return `(${year}).`;
}

function buildUrl(entry) {
  const u = field(entry, 'url');
  if (u) return u;
  const doi = field(entry, 'doi');
  if (doi) {
    const d = doi.replace(/^\s*(https?:\/\/(dx\.)?doi\.org\/)/i, '').trim();
    return `https://doi.org/${d}`;
  }
  const eprint = field(entry, 'eprint');
  const ap = (field(entry, 'archiveprefix') || field(entry, 'archivePrefix') || '').toLowerCase();
  if (eprint && ap.includes('arxiv')) {
    return `https://arxiv.org/abs/${eprint}`;
  }
  return null;
}

function main() {
  if (!fs.existsSync(bibPath)) {
    console.warn(`No BibTeX file at ${bibPath}; writing empty publications list.`);
    fs.mkdirSync(path.dirname(outPath), {recursive: true});
    fs.writeFileSync(outPath, '[]\n', 'utf8');
    return;
  }

  const rawBib = fs.readFileSync(bibPath, 'utf8');
  const parsed = parse(rawBib).filter((x) => x.itemtype === 'entry');

  const pubs = parsed.map((entry) => {
    const year = parseInt(field(entry, 'year'), 10) || 0;
    const bibtex = `${(entry.raw || '').trim()}\n`;
    return {
      key: entry.key,
      title: field(entry, 'title') || entry.key,
      venueLine: buildVenueLine(entry),
      authorsLine: buildAuthorsLine(entry),
      url: buildUrl(entry),
      bibtex,
      year,
    };
  });

  pubs.sort((a, b) => b.year - a.year || a.title.localeCompare(b.title));

  const numbered = pubs.map(({year: _y, ...rest}, i) => ({
    ...rest,
    num: String(i + 1).padStart(2, '0'),
  }));

  fs.mkdirSync(path.dirname(outPath), {recursive: true});
  fs.writeFileSync(outPath, `${JSON.stringify(numbered, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${numbered.length} publication(s) → ${path.relative(root, outPath)}`);
}

main();
