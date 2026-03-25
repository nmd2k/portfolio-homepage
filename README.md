# Academic Console

A Vite + React + TypeScript static site template.
## Quick start

1. **Prerequisites:** [Node.js](https://nodejs.org/) 20+ (CI uses 22).

2. **Static assets:**

   Create a [`public/asset/`](./public/asset/) directory for your media (images, PDFs, etc.). This is the root for all asset URLs.

3. **Install and run locally**

   ```bash
   npm install
   npm run dev
   ```

4. **Customize** the root YAML files:

   | File | Purpose |
   |------|--------|
   | [`config.yml`](./config.yml) | Site title, `public/asset` media paths, identity, footer, social icons, `publication_highlight_names`. |
   | [`data.yml`](./data.yml) | Bio, education, experiment (same layout as education), news, blog, projects — **not** the publication list. |

5. **Publications** 
   All publication live in [`_bib/papers.bib`](./_bib/papers.bib) and being convert into json after build.

6. **Production build**

   ```bash
   npm run build
   npm run preview
   ```

   Output is written to `dist/`.

## License

Apache-2.0 (see SPDX header in source files).
