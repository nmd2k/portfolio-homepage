import fs from 'node:fs';
import path from 'node:path';
import type {Plugin} from 'vite';

const MIME: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

function copyDirPreferDest(src: string, dest: string) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, {recursive: true});
  for (const ent of fs.readdirSync(src, {withFileTypes: true})) {
    const s = path.join(src, ent.name);
    const d = path.join(dest, ent.name);
    if (ent.isDirectory()) {
      copyDirPreferDest(s, d);
      continue;
    }
    if (fs.existsSync(d)) continue;
    fs.mkdirSync(path.dirname(d), {recursive: true});
    fs.copyFileSync(s, d);
  }
}

/**
 * Serves `/asset/*` from `public/asset/` (Vite default) or, if missing, from `./asset/` at project root.
 * On build, copies only **missing** files from `./asset/` into `dist/asset/` so `public/asset/` wins on name clashes.
 */
export function dualAssetDirs(): Plugin {
  let root = process.cwd();
  let outDir = path.resolve('dist');

  const publicAsset = () => path.join(root, 'public', 'asset');
  const rootAsset = () => path.join(root, 'asset');

  return {
    name: 'dual-asset-dirs',
    configResolved(config) {
      root = config.root;
      outDir = path.resolve(config.root, config.build.outDir);
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const raw = req.url?.split('?')[0] ?? '';
        if (!raw.startsWith('/asset/')) {
          next();
          return;
        }
        const decoded = decodeURIComponent(raw.slice('/asset/'.length));
        const parts = decoded.split(/[/\\]/).filter((p) => p && p !== '..');
        if (parts.length === 0) {
          next();
          return;
        }
        const tries = [path.join(publicAsset(), ...parts), path.join(rootAsset(), ...parts)];
        for (const fp of tries) {
          try {
            if (fs.existsSync(fp) && fs.statSync(fp).isFile()) {
              const ext = path.extname(fp).toLowerCase();
              res.setHeader('Content-Type', MIME[ext] ?? 'application/octet-stream');
              fs.createReadStream(fp).pipe(res);
              return;
            }
          } catch {
            /* try next path */
          }
        }
        next();
      });
    },
    closeBundle() {
      copyDirPreferDest(rootAsset(), path.join(outDir, 'asset'));
    },
  };
}
