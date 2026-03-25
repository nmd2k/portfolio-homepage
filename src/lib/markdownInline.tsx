import React from 'react';
import {openInNewTabProps} from './openInNewTab';

type Token = {type: 'text' | 'bold' | 'link'; value: string; href?: string};

function parseInline(md: string): Token[] {
  const tokens: Token[] = [];
  const linkOrBold = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;

  while ((m = linkOrBold.exec(md)) !== null) {
    if (m.index > last) tokens.push({type: 'text', value: md.slice(last, m.index)});
    if (m[1] && m[2]) tokens.push({type: 'link', value: m[1], href: m[2]});
    else if (m[3]) tokens.push({type: 'bold', value: m[3]});
    last = linkOrBold.lastIndex;
  }
  if (last < md.length) tokens.push({type: 'text', value: md.slice(last)});
  return tokens;
}

export function renderMarkdownParagraph(md: string): React.ReactNode {
  const lines = md.split(/\r?\n/);
  return lines.map((line, lineIdx) => (
    <React.Fragment key={`l-${lineIdx}`}>
      {lineIdx > 0 ? <br /> : null}
      {parseInline(line).map((t, i) => {
        if (t.type === 'bold') return <strong key={`b-${i}`}>{t.value}</strong>;
        if (t.type === 'link' && t.href) {
          return (
            <a
              key={`a-${i}`}
              href={t.href}
              className="underline decoration-outline hover:text-primary transition-colors"
              {...openInNewTabProps(t.href)}
            >
              {t.value}
            </a>
          );
        }
        return <React.Fragment key={`t-${i}`}>{t.value}</React.Fragment>;
      })}
    </React.Fragment>
  ));
}
