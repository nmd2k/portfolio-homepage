import type {HTMLAttributeAnchorTarget} from 'react';

type AnchorTargetRel = {
  target?: HTMLAttributeAnchorTarget;
  rel?: string;
};

/**
 * Opens navigational links in a new tab. Skips `mailto:`, `tel:`, and same-page `#` anchors.
 */
export function openInNewTabProps(href: string): AnchorTargetRel {
  const h = href.trim();
  if (/^mailto:/i.test(h) || /^tel:/i.test(h)) return {};
  if (h === '' || h === '#' || /^#[^/]*$/.test(h)) return {};
  return {target: '_blank', rel: 'noopener noreferrer'};
}
