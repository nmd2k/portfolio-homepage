import React from 'react';

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Wraps configured substrings in bold + underline (longest matches first in the regex).
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
      <span
        key={`h-${i}-${part}`}
        className="font-bold underline decoration-outline underline-offset-2"
      >
        {part}
      </span>
    ) : (
      <React.Fragment key={`t-${i}`}>{part}</React.Fragment>
    ),
  );
}
