/**
 * @typedef {{ id: string, message: string, pattern: RegExp, allow?: (match: string) => boolean }} Rule
 * @typedef {{ rule: string, message: string, line: number }} Violation
 */

/** The only email address the site may show. */
export const ALLOWED_EMAIL = 'baileyhannah995@gmail.com';

/** @type {Rule[]} */
export const RULES = [
  {
    id: 'phone',
    message: 'a phone number or tel: link',
    pattern: /tel:|\(\d{3}\)\s?\d{3}[-.\s‑]\d{4}\b|\b\d{3}[-.‑]\d{3}[-.‑]\d{4}\b/gi,
  },
  {
    id: 'email',
    message: `an email address other than ${ALLOWED_EMAIL}`,
    pattern: /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/gi,
    allow: (match) => match.toLowerCase() === ALLOWED_EMAIL,
  },
  { id: 'placeholder', message: 'a placeholder', pattern: /\b(?:TODO|TBD|lorem ipsum)\b/gi },
];

/**
 * Find rule matches in a text.
 * @param {string} text
 * @returns {Violation[]}
 */
export function findViolations(text) {
  /** @type {Violation[]} */
  const found = [];
  for (const rule of RULES) {
    for (const match of text.matchAll(rule.pattern)) {
      if (rule.allow?.(match[0])) continue;
      const at = match.index ?? 0;
      found.push({ rule: rule.id, message: rule.message, line: text.slice(0, at).split('\n').length });
    }
  }
  return found;
}

/**
 * The text a visitor sees on an HTML page: scripts, styles and tags removed, common entities decoded,
 * so an address written with entities is still caught.
 * @param {string} html
 */
export function visibleText(html) {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#64;|&commat;/g, '@')
    .replace(/&amp;/g, '&');
}
