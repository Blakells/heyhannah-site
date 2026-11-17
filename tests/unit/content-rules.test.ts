import { describe, expect, it } from 'vitest';
import { findViolations, visibleText } from '../../scripts/lib/content-rules.mjs';

const ids = (text: string) => findViolations(text).map((v) => v.rule);

// Contact-shaped test strings are split, so no whole address or number sits in the repository.
describe('findViolations', () => {
  it('flags phone numbers and tel: links, but not dates or invoice numbers', () => {
    expect(ids('call (555) 555-' + '0100')).toEqual(['phone']);
    expect(ids('or 555-555-' + '0101')).toEqual(['phone']);
    expect(ids('<a href="tel' + ':+15555550102">')).toEqual(['phone']);
    expect(ids('October 2026, invoice IL9XXE6Q-0002, DSC_0001')).toEqual([]);
  });

  it('flags every email address except hers', () => {
    expect(ids('write to someone' + '@example.com today')).toEqual(['email']);
    expect(ids('contact' + '@example.org')).toEqual(['email']);
    expect(ids('baileyhannah995@gmail.com')).toEqual([]);
    expect(ids('BaileyHannah995@Gmail.com')).toEqual([]);
  });

  it('flags placeholders', () => {
    expect(ids('TODO: write this')).toEqual(['placeholder']);
    expect(ids('TBD')).toEqual(['placeholder']);
    expect(ids('Lorem ipsum dolor')).toEqual(['placeholder']);
  });

  it('reports the line number of each match', () => {
    expect(findViolations('ok\nok\nTBD')).toEqual([{ rule: 'placeholder', message: 'a placeholder', line: 3 }]);
  });
});

describe('visibleText', () => {
  it('drops scripts, styles and tags, and decodes entities', () => {
    const html = '<style>.a{}</style><p>Fish &amp; chips</p><script>var x = 1;</script>';
    expect(visibleText(html).trim()).toBe('Fish & chips');
  });

  it('decodes an encoded @, so a hidden address is still caught', () => {
    const html = '<p>write to someone&#64;example.com</p>';
    expect(visibleText(html)).toContain('someone' + '@example.com');
    expect(ids(visibleText(html))).toEqual(['email']);
  });
});
