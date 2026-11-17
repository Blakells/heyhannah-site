import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, it } from 'vitest';
import Button from '../../src/components/Button.astro';
import SiteFooter from '../../src/components/SiteFooter.astro';
import SiteHeader from '../../src/components/SiteHeader.astro';
import WaveMark from '../../src/components/WaveMark.astro';

let container: AstroContainer;
beforeAll(async () => {
  container = await AstroContainer.create();
});

describe('SiteHeader', () => {
  it('links Work, About and Resume in order, and the home page from her name', async () => {
    const html = await container.renderToString(SiteHeader, { request: new Request('https://heyhannah.xyz/') });
    const hrefs = [...html.matchAll(/<nav[^>]*>([\s\S]*?)<\/nav>/g)].flatMap((m) =>
      [...m[1].matchAll(/href="([^"]+)"/g)].map((h) => h[1]),
    );
    expect(hrefs).toEqual(['/work/', '/about/', '/resume/']);
    expect(html).toMatch(/<a class="brand"[^>]*href="\/"[^>]*aria-label="Hannah Bailey, home"/);
  });

  it('marks the current section, including on a work page', async () => {
    const html = await container.renderToString(SiteHeader, {
      request: new Request('https://heyhannah.xyz/work/microcopy/'),
    });
    expect(html).toMatch(/href="\/work\/" aria-current="page"/);
    expect(html).not.toMatch(/href="\/about\/" aria-current/);
  });

  it('offers "Email me" to her address', async () => {
    const html = await container.renderToString(SiteHeader, { request: new Request('https://heyhannah.xyz/') });
    expect(html).toMatch(/href="mailto:baileyhannah995@gmail\.com"[^>]*>Email me</);
  });
});

describe('SiteFooter', () => {
  it('names her and the site, and links her email and LinkedIn', async () => {
    const html = await container.renderToString(SiteFooter);
    expect(html).toContain('© 2026 Hannah Bailey · heyhannah.xyz');
    expect(html).toContain('href="mailto:baileyhannah995@gmail.com"');
    expect(html).toContain('href="https://www.linkedin.com/in/hannah-bailey-hb2023/"');
  });
});

describe('Button', () => {
  it('renders a link with its variant and size', async () => {
    const html = await container.renderToString(Button, {
      props: { href: '/work/', variant: 'ghost', size: 'small' },
      slots: { default: 'See my work' },
    });
    expect(html).toMatch(/<a class="btn btn-ghost btn-sm"[^>]*href="\/work\/"[^>]*>See my work<\/a>/);
  });
});

describe('WaveMark', () => {
  it('is decorative and sized', async () => {
    const html = await container.renderToString(WaveMark, { props: { width: 22, height: 14 } });
    expect(html).toMatch(/<svg[^>]*width="22"[^>]*height="14"[^>]*aria-hidden="true"/);
  });
});
