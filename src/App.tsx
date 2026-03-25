/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, {useEffect, useState} from 'react';
import {
  Mail,
  Share2,
  GraduationCap,
  ArrowRight,
  Link as LinkIcon,
  Github,
  Linkedin,
  Newspaper,
  Fingerprint,
  FileDown,
  ClipboardCopy,
  ExternalLink,
  ChevronDown,
  type LucideIcon,
} from 'lucide-react';
import {publicationEntries, siteConfig, siteData} from './lib/siteContent';
import {highlightSubstrings} from './lib/highlightText';
import {assetUrl} from './lib/assetUrl';
import {openInNewTabProps} from './lib/openInNewTab';
import {renderMarkdownParagraph} from './lib/markdownInline';
import type {BioPart} from './types/site';

const SOCIAL_ICONS: Record<string, LucideIcon> = {
  mail: Mail,
  github: Github,
  terminal: Github,
  linkedin: Linkedin,
  substack: Newspaper,
  orcid: Fingerprint,
  cv: FileDown,
  'graduation-cap': GraduationCap,
  share2: Share2,
};

function resolveSocialHref(href: string, assetBase: string): string {
  const h = href.trim();
  if (/^https?:\/\//i.test(h) || h.startsWith('//') || h.startsWith('mailto:') || h.startsWith('#')) {
    return h;
  }
  return assetUrl(h, assetBase);
}

const NEWS_BLOG_PREVIEW = 3;
const PROJECTS_PREVIEW = 4;

/** Stagger for `animate-console-drop` — higher = each block reads as its own drop. */
const CONSOLE_DROP_STAGGER_MS = 100;

function consoleDropDelay(step: number): React.CSSProperties {
  return {animationDelay: `${step * CONSOLE_DROP_STAGGER_MS}ms`};
}

export default function App() {
  const cfg = siteConfig;
  const data = siteData;
  const publicationHighlights = cfg.publication_highlight_names ?? [];
  const assetBase = cfg.assets?.base_path?.trim() || '/asset';
  const [newsExpanded, setNewsExpanded] = useState(false);
  const [blogExpanded, setBlogExpanded] = useState(false);
  const [projectsExpanded, setProjectsExpanded] = useState(false);

  const newsItems = data.news.items;
  const blogItems = data.blog.items;
  const projectItems = data.projects.items;
  const newsBase = newsItems.slice(0, NEWS_BLOG_PREVIEW);
  const newsExtra = newsItems.slice(NEWS_BLOG_PREVIEW);
  const blogBase = blogItems.slice(0, NEWS_BLOG_PREVIEW);
  const blogExtra = blogItems.slice(NEWS_BLOG_PREVIEW);
  const projectsBase = projectItems.slice(0, PROJECTS_PREVIEW);
  const projectsExtra = projectItems.slice(PROJECTS_PREVIEW);
  const newsHasMore = newsItems.length > NEWS_BLOG_PREVIEW;
  const blogHasMore = blogItems.length > NEWS_BLOG_PREVIEW;
  const projectsHasMore = projectItems.length > PROJECTS_PREVIEW;

  const pubCount = publicationEntries.length;
  const projectsHeaderDropStep = 8 + Math.max(pubCount, 1);
  const footerDropStep = projectsHeaderDropStep + 1 + projectsBase.length;

  const profileSrc = assetUrl(cfg.branding.profile_image, assetBase);
  const logoSrc = cfg.branding.logo_url?.trim()
    ? assetUrl(cfg.branding.logo_url.trim(), assetBase)
    : '';

  useEffect(() => {
    document.title = cfg.site.title;
    if (cfg.site.description) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'description');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', cfg.site.description);
    }
    const lang = cfg.site.language ?? 'en';
    document.documentElement.lang = lang;

    if (logoSrc) {
      let link = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = logoSrc;
    }
  }, [cfg, logoSrc]);

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow py-12 px-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <section className="md:col-span-4 flex flex-col gap-6">
            <div
              className="animate-console-drop pixel-border bg-surface-container-high p-6 flex flex-col items-center text-center"
              style={consoleDropDelay(0)}
            >
              <div className="group w-48 h-48 mb-6 pixel-border-sm overflow-hidden bg-surface-dim">
                <img
                  alt={cfg.branding.profile_image_alt ?? 'Profile'}
                  className="w-full h-full object-cover filter saturate-75 contrast-95 brightness-95 transition-[filter] duration-300 ease-out group-hover:filter-none"
                  src={profileSrc}
                  referrerPolicy="no-referrer"
                />
              </div>
              <h1 className="font-headline text-3xl font-extrabold uppercase tracking-tight text-primary">
                {cfg.identity.name}
              </h1>
              <p className="font-label text-sm font-bold text-secondary mb-6 tracking-widest uppercase">
                {cfg.identity.subtitle}
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {cfg.social.map((s) => {
                  const Icon = SOCIAL_ICONS[s.icon];
                  if (!Icon) return null;
                  const href = resolveSocialHref(s.href, assetBase);
                  return (
                    <React.Fragment key={`${s.icon}-${s.href}`}>
                      <SocialIcon href={href} label={s.label ?? s.icon} icon={<Icon size={20} />} />
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            <div
              className="animate-console-drop pixel-border bg-surface-container-low p-6"
              style={consoleDropDelay(1)}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="w-3 h-3 bg-tertiary"></span>
                <h2 className="font-headline font-bold text-lg uppercase tracking-widest">
                  {data.education.section_title}
                </h2>
              </div>
              <div className="space-y-4">
                {data.education.items.map((item) => (
                  <React.Fragment key={`${item.date}-${item.title}`}>
                    <AwardItem date={item.date} title={item.title} org={item.org} />
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div
              className="animate-console-drop pixel-border bg-surface-container-low p-6"
              style={consoleDropDelay(2)}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="w-3 h-3 bg-tertiary"></span>
                <h2 className="font-headline font-bold text-lg uppercase tracking-widest">
                  {data.experiment.section_title}
                </h2>
              </div>
              <div className="space-y-4">
                {data.experiment.items.map((item) => (
                  <React.Fragment key={`${item.date}-${item.title}`}>
                    <AwardItem date={item.date} title={item.title} org={item.org} />
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div
              className="animate-console-drop pixel-border bg-surface-container-low p-6"
              style={consoleDropDelay(3)}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="w-3 h-3 bg-tertiary"></span>
                <h2 className="font-headline font-bold text-lg uppercase tracking-widest">
                  {data.award.section_title}
                </h2>
              </div>
              <div className="space-y-4">
                {data.award.items.map((item) => (
                  <React.Fragment key={`${item.date}-${item.title}`}>
                    <AwardItem date={item.date} title={item.title} org={item.org} />
                  </React.Fragment>
                ))}
              </div>
            </div>
          </section>

          <section className="md:col-span-8 flex flex-col gap-6">
            <div
              className="animate-console-drop pixel-border bg-surface-container-lowest p-6"
              style={consoleDropDelay(4)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-primary"></span>
                  <h2 className="font-headline font-bold text-lg uppercase tracking-widest">{data.bio.section_title}</h2>
                </div>
                {cfg.identity.bio_log_id ? (
                  <span className="font-label text-[10px] text-secondary">ID: {cfg.identity.bio_log_id}</span>
                ) : null}
              </div>
              <div className="space-y-4 text-on-surface leading-relaxed">
                {data.bio.markdown?.length
                  ? data.bio.markdown.map((md, i) => <p key={i}>{renderMarkdownParagraph(md)}</p>)
                  : data.bio.paragraphs?.map((para, i) => (
                      <p key={i}>
                        <BioParts parts={para.parts} />
                      </p>
                    ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div
                className="animate-console-drop pixel-border bg-surface-container-low p-6"
                style={consoleDropDelay(5)}
              >
                <div className="flex items-center gap-2 mb-6">
                  <span className="w-3 h-3 bg-tertiary"></span>
                  <h2 className="font-headline font-bold text-lg uppercase tracking-widest">{data.news.section_title}</h2>
                </div>
                <ul className="space-y-4">
                  {newsBase.map((item) => (
                    <React.Fragment key={`${item.date}-${item.text}`}>
                      <NewsItem date={item.date} text={item.text} />
                    </React.Fragment>
                  ))}
                  <li
                    className={`overflow-hidden transition-all duration-700 ease-in-out ${
                      newsExpanded ? 'max-h-[80rem] opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'
                    }`}
                  >
                    <ul className="space-y-4">
                      {newsExtra.map((item) => (
                        <React.Fragment key={`${item.date}-${item.text}`}>
                          <NewsItem date={item.date} text={item.text} />
                        </React.Fragment>
                      ))}
                    </ul>
                  </li>
                </ul>
                {newsHasMore ? (
                  <button
                    type="button"
                    onClick={() => setNewsExpanded((e) => !e)}
                    className="mt-4 w-full inline-flex items-center justify-center gap-1.5 font-label text-[10px] font-bold uppercase tracking-widest border border-outline px-3 py-2 bg-surface-container hover:bg-surface-container-highest text-secondary hover:text-primary transition-colors rounded-none active:scale-[0.99]"
                  >
                    <ChevronDown
                      size={12}
                      className={`transition-transform duration-500 ease-in-out ${newsExpanded ? 'rotate-180' : 'rotate-0'}`}
                    />
                    {newsExpanded ? 'Show less' : `Show ${newsItems.length - NEWS_BLOG_PREVIEW} more`}
                  </button>
                ) : null}
              </div>

              <div
                className="animate-console-drop pixel-border bg-surface-container-highest p-6"
                style={consoleDropDelay(6)}
              >
                <div className="flex items-center gap-2 mb-6">
                  <span className="w-3 h-3 bg-primary"></span>
                  <h2 className="font-headline font-bold text-lg uppercase tracking-widest">{data.blog.section_title}</h2>
                </div>
                <div className="space-y-4">
                  {blogBase.map((article, idx) => (
                    <React.Fragment key={article.id}>
                      {idx > 0 ? <div className="h-[1px] bg-outline opacity-30"></div> : null}
                      <BlogArticle
                        title={article.title}
                        excerpt={article.excerpt}
                        id={article.id}
                        href={article.href}
                      />
                    </React.Fragment>
                  ))}
                  <div
                    className={`overflow-hidden transition-all duration-700 ease-in-out ${
                      blogExpanded ? 'max-h-[80rem] opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'
                    }`}
                  >
                    <div className="space-y-4">
                      {blogExtra.map((article) => (
                        <React.Fragment key={article.id}>
                          <div className="h-[1px] bg-outline opacity-30"></div>
                          <BlogArticle
                            title={article.title}
                            excerpt={article.excerpt}
                            id={article.id}
                            href={article.href}
                          />
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>
                {blogHasMore ? (
                  <button
                    type="button"
                    onClick={() => setBlogExpanded((e) => !e)}
                    className="mt-4 w-full inline-flex items-center justify-center gap-1.5 font-label text-[10px] font-bold uppercase tracking-widest border border-outline px-3 py-2 bg-surface-container hover:bg-surface-container-highest text-secondary hover:text-primary transition-colors rounded-none active:scale-[0.99]"
                  >
                    <ChevronDown
                      size={12}
                      className={`transition-transform duration-300 ease-in-out ${blogExpanded ? 'rotate-180' : 'rotate-0'}`}
                    />
                    {blogExpanded ? 'Show less' : `Show ${blogItems.length - NEWS_BLOG_PREVIEW} more`}
                  </button>
                ) : null}
              </div>
            </div>

            <div
              className="animate-console-drop pixel-border bg-surface-container-high p-6"
              style={consoleDropDelay(7)}
            >
              <div className="flex items-center gap-2 mb-6">
                <span className="w-3 h-3 bg-primary"></span>
                <h2 className="font-headline font-bold text-lg uppercase tracking-widest">
                  {data.publications.section_title}
                </h2>
              </div>
              <div className="space-y-2">
                {publicationEntries.length === 0 ? (
                  <p className="text-sm text-secondary font-label">No entries in _bib/papers.bib yet.</p>
                ) : (
                  publicationEntries.map((pub, i) => (
                    <React.Fragment key={pub.key}>
                      <PublicationRow
                        num={pub.num}
                        title={pub.title}
                        venueLine={pub.venueLine}
                        authorsLine={pub.authorsLine}
                        url={pub.url}
                        bibtex={pub.bibtex}
                        highlightNames={publicationHighlights}
                        dropStep={8 + i}
                      />
                    </React.Fragment>
                  ))
                )}
              </div>
            </div>

            <div
              className="animate-console-drop pixel-border bg-surface-container-lowest p-6"
              style={consoleDropDelay(projectsHeaderDropStep)}
            >
              <div className="flex items-center gap-2 mb-6">
                <span className="w-3 h-3 bg-primary"></span>
                <h2 className="font-headline font-bold text-lg uppercase tracking-widest">{data.projects.section_title}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projectsBase.map((p, i) => (
                  <React.Fragment key={p.title}>
                    <ProjectCard
                      title={p.title}
                      desc={p.desc}
                      status={p.status}
                      isExperimental={p.experimental}
                      url={p.url}
                      dropStep={projectsHeaderDropStep + 1 + i}
                    />
                  </React.Fragment>
                ))}
              </div>
              <div
                className={`overflow-hidden transition-all duration-700 ease-in-out ${
                  projectsExpanded ? 'max-h-[120rem] opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'
                }`}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {projectsExtra.map((p) => (
                    <React.Fragment key={p.title}>
                      <ProjectCard
                        title={p.title}
                        desc={p.desc}
                        status={p.status}
                        isExperimental={p.experimental}
                        url={p.url}
                      />
                    </React.Fragment>
                  ))}
                </div>
              </div>
              {projectsHasMore ? (
                <button
                  type="button"
                  onClick={() => setProjectsExpanded((e) => !e)}
                  className="mt-4 w-full inline-flex items-center justify-center gap-1.5 font-label text-[10px] font-bold uppercase tracking-widest border border-outline px-3 py-2 bg-surface-container hover:bg-surface-container-highest text-secondary hover:text-primary transition-colors rounded-none active:scale-[0.99]"
                >
                  <ChevronDown
                    size={12}
                    className={`transition-transform duration-500 ease-in-out ${projectsExpanded ? 'rotate-180' : 'rotate-0'}`}
                  />
                  {projectsExpanded ? 'Show less' : `Show ${projectItems.length - PROJECTS_PREVIEW} more`}
                </button>
              ) : null}
            </div>
          </section>
        </div>
      </main>

      <footer
        className="animate-console-drop w-full flex justify-center items-center px-6 py-4 mt-auto bg-surface-container border-t-2 border-outline"
        style={consoleDropDelay(footerDropStep)}
      >
        <p className="font-headline text-xs text-secondary tracking-wide text-center">
          ® Copyrighted by {cfg.footer.copyright_name} {cfg.footer.year}
        </p>
      </footer>
    </div>
  );
}

function BioParts({parts}: {parts: BioPart[]}) {
  return (
    <>
      {parts.map((part, i) => {
        if ('text' in part) return <React.Fragment key={i}>{part.text}</React.Fragment>;
        if ('code' in part) {
          return (
            <span
              key={i}
              className="bg-surface-container-highest px-1 font-mono text-xs border border-outline rounded-none"
            >
              {part.code}
            </span>
          );
        }
        if ('strong' in part) return <strong key={i}>{part.strong}</strong>;
        return null;
      })}
    </>
  );
}

function SocialIcon({icon, href, label}: {icon: React.ReactNode; href: string; label: string}) {
  return (
    <a
      className="w-10 h-10 flex items-center justify-center pixel-border-sm bg-surface-container-highest hover:bg-primary hover:text-on-primary transition-colors"
      href={href}
      aria-label={label}
      {...openInNewTabProps(href)}
    >
      {icon}
    </a>
  );
}

function AwardItem({date, title, org}: {date: string; title: string; org: string}) {
  return (
    <div className="border-l-4 border-outline p-3 bg-surface-container">
      <p className="font-label text-xs text-secondary font-bold">{date}</p>
      <p className="font-headline font-bold text-sm">{title}</p>
      <p className="text-xs text-on-surface-variant">{org}</p>
    </div>
  );
}

function NewsItem({date, text}: {date: string; text: string}) {
  return (
    <li className="flex gap-4 items-start">
      <span className="font-label text-[10px] bg-outline text-white px-2 py-0.5 whitespace-nowrap rounded-none">{date}</span>
      <p className="text-sm font-medium">{text}</p>
    </li>
  );
}

function BlogArticle({
  title,
  excerpt,
  id,
  href,
}: {
  title: string;
  excerpt: string;
  id: string;
  href?: string;
}) {
  const to = href ?? '#';
  return (
    <article className="group cursor-pointer">
      <a href={to} className="block" {...openInNewTabProps(to)}>
        <h3 className="font-headline font-bold text-sm group-hover:underline transition-colors">{title}</h3>
        <p className="text-xs text-on-surface-variant line-clamp-2 mt-1">{excerpt}</p>
        <div className="flex justify-between items-center mt-2">
          <span className="text-[9px] uppercase font-bold text-secondary">Read Entry_{id}</span>
          <ArrowRight size={14} className="text-secondary" />
        </div>
      </a>
    </article>
  );
}

function PublicationRow({
  num,
  title,
  venueLine,
  authorsLine,
  url,
  bibtex,
  highlightNames,
  dropStep,
}: {
  num: string;
  title: string;
  venueLine: string;
  authorsLine: string;
  url: string | null;
  bibtex: string;
  highlightNames: string[];
  dropStep?: number;
}) {
  const [copied, setCopied] = useState(false);

  async function copyBibtex() {
    try {
      await navigator.clipboard.writeText(bibtex.trim());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div
      className={`flex flex-col gap-3 sm:flex-row sm:items-stretch bg-surface-container-low p-3 border-l-4 border-outline hover:bg-surface-container-highest transition-colors${dropStep !== undefined ? ' animate-console-drop' : ''}`}
      style={dropStep !== undefined ? consoleDropDelay(dropStep) : undefined}
    >
      <div className="flex gap-3 flex-1 min-w-0">
        <span className="font-headline font-bold text-xl text-outline-variant shrink-0 w-8 sm:w-9 text-left">{num}</span>
        <div className="min-w-0 flex-1 flex flex-col gap-1">
          <h3 className="font-headline font-bold text-sm uppercase leading-snug">
            {highlightSubstrings(title, highlightNames)}
          </h3>
          {venueLine.trim() ? (
            <p className="text-[10px] font-label font-bold text-secondary uppercase tracking-wide leading-snug">
              {highlightSubstrings(venueLine.trim(), highlightNames)}
            </p>
          ) : null}
          <p className="text-[11px] text-on-surface-variant leading-snug">
            {highlightSubstrings(authorsLine, highlightNames)}
          </p>
        </div>
      </div>
      <div className="flex flex-row flex-wrap gap-1.5 shrink-0 items-center self-end sm:self-end sm:items-end">
        <button
          type="button"
          onClick={() => void copyBibtex()}
          className="inline-flex items-center justify-center gap-1 font-label text-[8px] font-bold uppercase border border-outline px-1.5 py-0.5 bg-surface-container-highest hover:bg-outline hover:text-white transition-colors rounded-none"
        >
          <ClipboardCopy size={11} aria-hidden className="shrink-0" />
          {copied ? 'Copied' : 'BibTeX'}
        </button>
        {url ? (
          <a
            href={url}
            className="inline-flex items-center justify-center gap-1 font-label text-[8px] font-bold uppercase border border-outline px-1.5 py-0.5 bg-surface-container-highest hover:bg-primary hover:text-on-primary transition-colors rounded-none"
            {...openInNewTabProps(url)}
          >
            <ExternalLink size={11} aria-hidden className="shrink-0" />
            Paper
          </a>
        ) : (
          <span
            className="inline-flex items-center justify-center gap-1 font-label text-[8px] font-bold uppercase border border-outline px-1.5 py-0.5 opacity-40 cursor-not-allowed rounded-none"
            title="No URL or DOI in this entry"
          >
            <ExternalLink size={11} aria-hidden className="shrink-0" />
            Paper
          </span>
        )}
      </div>
    </div>
  );
}

function ProjectCard({
  title,
  desc,
  status,
  isExperimental,
  url,
  dropStep,
}: {
  title: string;
  desc: string;
  status: string;
  isExperimental?: boolean;
  url?: string;
  dropStep?: number;
}) {
  const link = url ?? '#';
  return (
    <div
      className={`pixel-border-sm p-4 bg-surface-container flex flex-col justify-between${dropStep !== undefined ? ' animate-console-drop' : ''}`}
      style={dropStep !== undefined ? consoleDropDelay(dropStep) : undefined}
    >
      <div>
        <h3 className="font-headline font-bold text-sm mb-2 text-primary">{title}</h3>
        <p className="text-xs text-on-surface-variant leading-tight mb-4">{desc}</p>
      </div>
      <div className="flex justify-between items-center">
        <span
          className={`text-[9px] font-bold px-2 py-0.5 border border-outline rounded-none ${
            isExperimental ? 'bg-tertiary text-white' : 'bg-surface-container-highest'
          }`}
        >
          STATUS: {status}
        </span>
        <a href={link} aria-label={`Open project ${title}`} {...openInNewTabProps(link)}>
          <LinkIcon size={16} className="text-primary" />
        </a>
      </div>
    </div>
  );
}
