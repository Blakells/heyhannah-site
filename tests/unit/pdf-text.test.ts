import { describe, expect, it } from 'vitest';
import { checkResumePdf, PHONE_PATTERN } from '../../scripts/lib/pdf-text.mjs';

const good = [
  'Hannah Bailey',
  'Technical Writer · UX Writer · Content Designer',
  'Florence, SC · baileyhannah995@gmail.com · heyhannah.xyz · linkedin.com/in/hannah-bailey-hb2023',
  'SUMMARY',
  'CORE SKILLS',
  'EXPERIENCE',
  'SELECTED PROJECT',
  'EDUCATION',
].join('\n');

describe('checkResumePdf', () => {
  it('accepts a two-page resume with her name, email and every section', () => {
    expect(checkResumePdf({ pages: 2, text: good })).toEqual([]);
  });

  it('rejects a PDF without text', () => {
    expect(checkResumePdf({ pages: 1, text: '  ' })).toContain('the PDF has no extractable text');
  });

  it('rejects a PDF longer than two pages', () => {
    expect(checkResumePdf({ pages: 3, text: good })).toContain('the PDF runs to 3 pages (limit 2)');
  });

  it('rejects a PDF whose text does not open with her name and contact line', () => {
    // Applicant tracking systems read the text layer in order, so the header must come first.
    const [name, role, contact, ...sections] = good.split('\n');
    expect(checkResumePdf({ pages: 2, text: [...sections, name, role, contact].join('\n') })).toContain(
      'the PDF text does not start with "Hannah Bailey" and her email before "Summary"',
    );
  });

  it('rejects a PDF without her name or her email address', () => {
    expect(checkResumePdf({ pages: 1, text: 'SUMMARY' })).toContain('the PDF text lacks "Hannah Bailey"');
    expect(
      checkResumePdf({
        pages: 1,
        text: 'Hannah Bailey\nSUMMARY\nCORE SKILLS\nEXPERIENCE\nSELECTED PROJECT\nEDUCATION',
      }),
    ).toContain('the PDF text lacks "baileyhannah995@gmail.com"');
  });

  it('names each missing section, in any case', () => {
    expect(checkResumePdf({ pages: 1, text: 'Hannah Bailey\nbaileyhannah995@gmail.com' })).toContain(
      'the PDF text lacks "Selected project"',
    );
  });

  it('rejects a phone number in any common shape', () => {
    // Split, so no whole number sits in the repository.
    for (const phone of ['(555) 555-' + '0100', '555-555-' + '0101', '555.555.' + '0102', 'tel' + ':+15555550103']) {
      expect(checkResumePdf({ pages: 1, text: `${good}\n${phone}` })).toContain(
        'the PDF text contains a phone number',
      );
    }
  });

  it('does not mistake her years, dates or degree for a phone number', () => {
    const text = `${good}\n7+ years · Jan 2026 – Present · 2014 – 2018 · Florence, SC, hybrid`;
    expect(PHONE_PATTERN.test(text)).toBe(false);
  });
});
