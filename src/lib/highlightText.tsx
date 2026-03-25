import React from 'react';

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Wraps configured substrings in a boxy <mark> (longest matches first in the regex).
 */
export function highlightSubstrings(text: string, rawNames: string[]): React.ReactNode {
  const names = [...rawNames].map((n) => n.trim()).filter((n) => n.length > 0);
  if (names.length === 0) return text;

  const sorted = [...names].sort((a, b) => b.length - a.length);
  const nameSet = new Set(sorted);
  const re = new RegExp(`(${sorted.map(escapeRegExp).join('|')})`, 'g');
  const parts = text.split(re);

  return parts.map((part, i) =>
    nameSet.has(part) ? (
      <mark
        key={`h-${i}-${part}`}
        className="bg-surface-container-highest text-primary font-semibold px-0.5 border border-outline rounded-none"
      >
        {part}
      </mark>
    ) : (
      <React.Fragment key={`t-${i}`}>{part}</React.Fragment>
    ),
  );
}
