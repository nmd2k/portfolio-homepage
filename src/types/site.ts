/**
 * Types for root `config.yml` (rarely changing site identity and chrome).
 */
export type SocialIconName =
  | 'mail'
  | 'github'
  | 'terminal'
  | 'linkedin'
  | 'substack'
  | 'orcid'
  | 'cv'
  | 'graduation-cap'
  | 'share2';

export interface SiteConfig {
  site: {
    title: string;
    description?: string;
    language?: string;
  };
  /**
   * Optional override for `public/asset/` URL prefix (default `/asset`).
   */
  assets?: {
    base_path?: string;
  };
  branding: {
    /** Favicon — filename under `public/asset/` or absolute URL. */
    logo_url?: string;
    /** Profile photo — filename under `public/asset/` or absolute URL. */
    profile_image: string;
    profile_image_alt?: string;
  };
  identity: {
    name: string;
    subtitle: string;
    bio_log_id?: string;
  };
  footer: {
    /** Shown as: ® Copyrighted by {copyright_name} {year} */
    copyright_name: string;
    year: number;
  };
  /**
   * Substrings to highlight in publication title, venue line, and author line (longest match wins per occurrence).
   */
  publication_highlight_names?: string[];
  social: {
    icon: SocialIconName;
    href: string;
    label?: string;
  }[];
}

export type BioPart =
  | {text: string}
  | {code: string}
  | {strong: string};

export interface BioParagraph {
  parts: BioPart[];
}

/** Generated from `_bib/papers.bib` at build time. */
export interface PublicationEntry {
  key: string;
  num: string;
  title: string;
  /** Conference / journal / publisher — first line under the title. */
  venueLine: string;
  /** Full author list with year — second line. */
  authorsLine: string;
  url: string | null;
  bibtex: string;
}

/**
 * Types for root `data.yml` (frequently updated sections).
 */
export interface SiteData {
  bio: {
    section_title: string;
    /**
     * Preferred authoring format: markdown paragraphs.
     * Supports: **bold**, [text](https://url), and line breaks.
     */
    markdown?: string[];
    /** Legacy format kept for backward compatibility. */
    paragraphs?: BioParagraph[];
  };
  education: {
    section_title: string;
    items: {date: string; title: string; org: string}[];
  };
  /** Same shape as `education` — e.g. lab / research experience. */
  experiment: {
    section_title: string;
    items: {date: string; title: string; org: string; url?: string}[];
  };
  /** Same layout as `education` — honors, funding, etc. */
  award: {
    section_title: string;
    items: {date: string; title: string; org: string}[];
  };
  news: {
    section_title: string;
    items: {date: string; text: string}[];
  };
  blog: {
    section_title: string;
    items: {title: string; excerpt: string; id: string; href?: string}[];
  };
  publications: {
    section_title: string;
  };
  projects: {
    section_title: string;
    items: {
      title: string;
      desc: string;
      status: string;
      experimental?: boolean;
      url?: string;
    }[];
  };
}
