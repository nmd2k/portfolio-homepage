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

function firstAuthorSurname(authorStr) {
  if (!authorStr) return '';
  const first = authorStr.split(/\s+and\s+/i)[0].replace(/\n/g, ' ').trim();
  const comma = first.indexOf(',');
  if (comma !== -1) return first.slice(0, comma).trim();
  const parts = first.split(/\s+/);
  return parts[parts.length - 1] || first;
}

function buildMeta(entry) {
  const author = field(entry, 'author');
  const year = field(entry, 'year');
  const venue =
    field(entry, 'booktitle') ||
    field(entry, 'journal') ||
    field(entry, 'publisher') ||
    '';
  const surname = firstAuthorSurname(author);
  const authorShort = surname ? `${surname} et al.` : '';
  const y = year || 'n.d.';
  const ven = venue ? ` ${venue}.` : '';
  return authorShort ? `${authorShort} (${y}).${ven}` : `(${y}).${ven}`;
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
      meta: buildMeta(entry),
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
