import { readFile } from 'node:fs/promises';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

/** The name the PDF must show, and the only email address it may carry. */
export const RESUME_NAME = 'Hannah Bailey';
export const RESUME_EMAIL = 'baileyhannah995@gmail.com';
export const RESUME_MAX_PAGES = 2;
export const RESUME_HEADINGS = ['Summary', 'Core skills', 'Experience', 'Selected project', 'Education'];

/** A US phone number, in the shapes the content check also rejects. */
export const PHONE_PATTERN =
  /tel:|\(\d{3}\)\s?\d{3}[-.\s‑]\d{4}\b|\b\d{3}[-.‑]\d{3}[-.‑]\d{4}\b/i;

/**
 * The text of a PDF. Runs are joined as written, with a newline where pdf.js marks a line end,
 * and NFKC folds ligature glyphs (so "ﬂ" reads as "fl").
 * @param {string} path
 * @returns {Promise<{ pages: number, text: string }>}
 */
export async function pdfText(path) {
  const data = new Uint8Array(await readFile(path));
  const doc = await getDocument({ data, useSystemFonts: true }).promise;
  const pages = [];
  for (let n = 1; n <= doc.numPages; n++) {
    const content = await (await doc.getPage(n)).getTextContent();
    pages.push(
      content.items.map((item) => ('str' in item ? item.str + (item.hasEOL ? '\n' : '') : '')).join(''),
    );
  }
  return { pages: doc.numPages, text: pages.join('\n').normalize('NFKC') };
}

/**
 * Problems with a resume PDF's extracted text; an empty list means it passes.
 * @param {{ pages: number, text: string }} pdf
 * @returns {string[]}
 */
export function checkResumePdf({ pages, text }) {
  const problems = [];
  if (!text.trim()) problems.push('the PDF has no extractable text');
  if (pages > RESUME_MAX_PAGES) problems.push(`the PDF runs to ${pages} pages (limit ${RESUME_MAX_PAGES})`);

  const lower = text.toLowerCase();
  if (!lower.includes(RESUME_NAME.toLowerCase())) problems.push(`the PDF text lacks "${RESUME_NAME}"`);
  if (!lower.includes(RESUME_EMAIL.toLowerCase())) problems.push(`the PDF text lacks "${RESUME_EMAIL}"`);
  for (const heading of RESUME_HEADINGS) {
    if (!lower.includes(heading.toLowerCase())) problems.push(`the PDF text lacks "${heading}"`);
  }
  // Applicant tracking systems read the text layer in order, so the header must come first.
  const summaryAt = lower.indexOf(RESUME_HEADINGS[0].toLowerCase());
  const emailAt = lower.indexOf(RESUME_EMAIL.toLowerCase());
  if (!lower.trim().startsWith(RESUME_NAME.toLowerCase()) || emailAt < 0 || emailAt > summaryAt) {
    problems.push(`the PDF text does not start with "${RESUME_NAME}" and her email before "${RESUME_HEADINGS[0]}"`);
  }
  if (PHONE_PATTERN.test(text)) problems.push('the PDF text contains a phone number');
  return problems;
}
