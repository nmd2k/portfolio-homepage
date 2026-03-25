/** Files typically live in `public/asset/` or project-root `asset/`. */

function viteBase(): string {
  const b = import.meta.env.BASE_URL ?? '/';
  return b.endsWith('/') ? b.slice(0, -1) : b;
}

/**
 * Resolves a path for static media in `/asset/...`, respecting `import.meta.env.BASE_URL`
 * (needed if the app is served from a subpath).
 */
export function assetUrl(relativePath: string, configBasePath = '/asset'): string {
  const p = (relativePath ?? '').trim();
  if (!p) return '';
  if (/^https?:\/\//i.test(p) || p.startsWith('//')) return p;

  let base = (configBasePath || '/asset').trim();
  if (!base.startsWith('/')) base = `/${base}`;
  base = base.replace(/\/$/, '');

  const vb = viteBase();

  if (p.startsWith('/')) {
    const pathPart = p.replace(/\/+/g, '/');
    return `${vb}${pathPart}`.replace(/\/+/g, '/') || '/';
  }

  const rel = p.replace(/^\.\//, '').replace(/^\/+/, '');
  const joined = `${vb}${base}/${rel}`.replace(/\/+/g, '/');
  return joined || '/';
}
