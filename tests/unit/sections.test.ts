import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, it } from 'vitest';
import PhotoPanel from '../../src/components/PhotoPanel.astro';
import ProofStrip from '../../src/components/ProofStrip.astro';
import Quote from '../../src/components/Quote.astro';
import WaveDivider from '../../src/components/WaveDivider.astro';
import WorkCard from '../../src/components/WorkCard.astro';
import WorkPageShell from '../../src/components/WorkPageShell.astro';
import { photo } from '../../src/lib/images';
import { quote } from '../../src/lib/quotes';
import { workPage } from '../../src/lib/work';

let container: AstroContainer;
beforeAll(async () => {
  container = await AstroContainer.create();
});

/** Renders a component without Astro's scoped-style attributes, so the tests read like the markup. */
async function render(...args: Parameters<AstroContainer['renderToString']>): Promise<string> {
  const html = await container.renderToString(...args);
  return html.replace(/ data-astro-cid-[\w-]+(?:="[^"]*")?/g, '');
}

describe('WorkCard', () => {
  it('links its title to the work page, with a name that says where it goes', async () => {
    const html = await render(WorkCard, { props: { page: workPage('microcopy'), accent: 3 } });
    expect(html).toContain('class="card card-3"');
    expect(html).toContain('<p class="label">UX writing</p>');
    expect(html).toMatch(
      /<h3 class="card-title"><a href="\/work\/microcopy\/" aria-label="Read more about Microcopy across multiple products">/,
    );
  });

  it('can use an h2 for the full work list', async () => {
    const html = await render(WorkCard, { props: { page: workPage('video'), level: 'h2' } });
    expect(html).toMatch(/<h2 class="card-title">/);
  });
});

describe('ProofStrip', () => {
  it('shows each figure with its unit and caption, under an accessible name', async () => {
    const html = await render(ProofStrip, {
      props: { figures: [{ figure: '7+', unit: 'years', caption: 'writing for SaaS products' }] },
    });
    expect(html).toContain('aria-label="At a glance"');
    expect(html).toMatch(/7\+\s*<span class="unit">years<\/span>/);
    expect(html).toContain('<p>— writing for SaaS products</p>');
  });
});

describe('Quote', () => {
  it('sets the highlight in the accent colour and names the person', async () => {
    const html = await render(Quote, {
      props: { quote: quote('barbara-green-home'), highlight: 'truly helps users succeed' },
    });
    expect(html).toContain('<span class="quote-mark">truly helps users succeed</span>');
    expect(html).toContain('— Barbara Green, UX Content Strategy &amp; Operations');
    expect(html).not.toContain('managed Hannah directly');
  });

  it('adds the relationship when asked', async () => {
    const html = await render(Quote, {
      props: { quote: quote('barbara-green-home'), tone: 'plain', showRelationship: true },
    });
    expect(html).toContain('quote--plain');
    expect(html).toContain(', managed Hannah directly at ACS Technologies');
  });
});

describe('WorkPageShell', () => {
  it('gives the page its one h1, its live examples and the next and back links', async () => {
    const html = await render(WorkPageShell, {
      props: {
        label: 'Case study',
        title: 'A title',
        lede: 'A lede.',
        links: [{ label: 'The guide', href: 'https://example.com/guide' }],
        next: { label: 'The next page', href: '/work/next/' },
      },
      slots: { default: '<p>Body</p>' },
    });
    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(html).toContain('<h2 id="live-examples">Live examples</h2>');
    expect(html).toMatch(/<a class="work-next" href="\/work\/next\/">\s*Next: The next page/);
    expect(html).toMatch(/<a class="work-back" href="\/work\/">Back to all work<\/a>/);
  });

  it('leaves out the live examples when there are none', async () => {
    const html = await render(WorkPageShell, {
      props: { label: 'Video', title: 'A title', lede: 'A lede.' },
    });
    expect(html).not.toContain('Live examples');
  });
});

describe('PhotoPanel', () => {
  const panel = { image: photo('race'), alt: 'Two motorcycles in a corner', width: 600, height: 400 };

  it('shows the photo with its alt text, the title, the line and the link', async () => {
    const html = await render(PhotoPanel, {
      props: {
        ...panel,
        title: 'Motorsports photography',
        description: 'Fast subjects.',
        link: { href: 'https://umbra.smugmug.com', label: 'See Umbra Photography' },
      },
    });
    expect(html).toMatch(/<img[^>]*alt="Two motorcycles in a corner"[^>]*width="600"[^>]*height="400"/);
    expect(html).toContain('<h3>Motorsports photography</h3>');
    expect(html).toContain('<p>Fast subjects.</p>');
    expect(html).toMatch(/<a class="panel-link" href="https:\/\/umbra\.smugmug\.com">\s*See Umbra Photography/);
  });

  it('leaves out the link when there is none', async () => {
    const html = await render(PhotoPanel, { props: { ...panel, title: 'Kitten fostering', description: 'Kittens.' } });
    expect(html).not.toContain('panel-link');
  });
});

describe('WaveDivider', () => {
  it('is decorative and fills with the colour it is given', async () => {
    const html = await render(WaveDivider, { props: { color: '#08363d', variant: 'out' } });
    expect(html).toMatch(/<div class="wave-block"[^>]*aria-hidden="true"/);
    expect(html).toContain('fill="#08363d"');
  });
});
