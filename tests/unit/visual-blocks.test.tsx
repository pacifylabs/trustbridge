import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';

import { MediaFrame } from '@/components/ui/MediaFrame';
import { StampBadge } from '@/components/ui/StampBadge';
import { ImageCluster } from '@/components/blocks/ImageCluster';
import { RibbonBand } from '@/components/blocks/RibbonBand';
import { CredentialCard } from '@/components/blocks/CredentialCard';
import { ServiceGrid } from '@/components/blocks/ServiceCard';
import { SERVICES } from '@/content/services';
import { HOME } from '@/content/pages';

/**
 * The decorative layer.
 *
 * These components exist to give pages life, which makes it easy for them to
 * become noise for anyone using a screen reader. The tests below are mostly
 * about that: what is decorative stays hidden, and what carries meaning keeps
 * an accessible name.
 */

describe('MediaFrame', () => {
  it('renders a described placeholder when no image is supplied', () => {
    render(<MediaFrame placeholderLabel="London street" />);

    expect(screen.getByRole('img', { name: 'London street' })).toBeInTheDocument();
  });

  it('still has an accessible name with no label given', () => {
    render(<MediaFrame />);
    expect(screen.getByRole('img', { name: 'Photography to follow' })).toBeInTheDocument();
  });

  it('has no detectable accessibility violations', async () => {
    const { container } = render(<MediaFrame placeholderLabel="Family at home" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('ImageCluster', () => {
  it('renders a frame per supplied image', () => {
    render(<ImageCluster images={HOME.heroMedia} />);

    // Photography is supplied now, so each frame is a real image named by its
    // alt text. The placeholder path is covered by the MediaFrame tests above.
    for (const image of HOME.heroMedia) {
      expect(screen.getByRole('img', { name: image.alt })).toBeInTheDocument();
    }
  });

  it('falls back to a described placeholder for a frame with no photograph', () => {
    render(<ImageCluster images={[{ placeholderLabel: 'Shot to follow' }]} />);
    expect(screen.getByRole('img', { name: 'Shot to follow' })).toBeInTheDocument();
  });

  it('renders the overlay and badge slots', () => {
    render(
      <ImageCluster
        images={HOME.heroMedia}
        overlay={<p>Overlay</p>}
        badge={<p>Badge</p>}
      />,
    );

    expect(screen.getByText('Overlay')).toBeInTheDocument();
    expect(screen.getByText('Badge')).toBeInTheDocument();
  });

  it('reserves the overlay area so it cannot sit on top of a frame', () => {
    const { container } = render(
      <ImageCluster images={HOME.heroMedia} overlay={<p>Overlay</p>} />,
    );

    // No frame is placed below 72% on the left, which is where the overlay
    // starts. Named slots are what keep that guarantee from a caller.
    const overlaySlot = screen.getByText('Overlay').parentElement;
    expect(overlaySlot?.className).toContain('sm:bottom-0');
    expect(container.querySelectorAll('img')).toHaveLength(3);
  });

  it('renders nothing but the shell when given no images', () => {
    render(<ImageCluster images={[]} />);
    expect(screen.queryAllByRole('img')).toHaveLength(0);
  });

  it('has no detectable accessibility violations', async () => {
    const { container } = render(<ImageCluster images={HOME.heroMedia} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('RibbonBand', () => {
  it('is hidden from assistive technology, being decorative', () => {
    const { container } = render(<RibbonBand items={HOME.ribbon} />);
    const band = container.firstElementChild;

    expect(band).toHaveAttribute('aria-hidden', 'true');
  });

  it('duplicates the track so the loop has no seam', () => {
    const { container } = render(<RibbonBand items={['Alpha', 'Beta']} />);

    // Two bands, each with two identical passes.
    expect(container.querySelectorAll('.marquee-track')).toHaveLength(2);
    expect(screen.getAllByText('Alpha')).toHaveLength(4);
  });

  it('runs its two bands in opposing directions', () => {
    const { container } = render(<RibbonBand items={['Alpha']} />);
    const directions = [...container.querySelectorAll('.marquee-track')].map((track) =>
      track.getAttribute('data-direction'),
    );

    expect(directions).toStrictEqual(['normal', 'reverse']);
  });

  it('renders nothing when there is nothing to say', () => {
    const { container } = render(<RibbonBand items={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe('StampBadge', () => {
  it('is decorative and hidden from assistive technology', () => {
    const { container } = render(<StampBadge text="Immigration advice" />);
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('repeats its text so the ring closes evenly', () => {
    render(<StampBadge text="Immigration advice" />);
    const path = document.querySelector('textPath');

    expect(path?.textContent).toBe('Immigration advice · Immigration advice · ');
  });
});

describe('CredentialCard', () => {
  it('renders the registration facts', () => {
    render(<CredentialCard {...HOME.credential} />);

    expect(screen.getByText(HOME.credential.title)).toBeInTheDocument();
    expect(screen.getByText(HOME.credential.subtitle)).toBeInTheDocument();
  });

  it('marks the regulatory line as awaiting wording', () => {
    render(<CredentialCard {...HOME.credential} />);
    expect(screen.getByTestId('regulatory-placeholder-marker')).toBeInTheDocument();
  });

  it('makes no regulatory claim and states no outcome', () => {
    render(<CredentialCard {...HOME.credential} />);
    const text = screen.getByTestId('credential-card').textContent ?? '';

    expect(text).not.toMatch(/OISC/i);
    expect(text).not.toMatch(/regulated by|authorised by/i);
    expect(text).not.toMatch(/level\s*[123]/i);
    expect(text).not.toMatch(/\d+\s*%/);
    expect(text).not.toMatch(/guarantee/i);
    expect(text).not.toMatch(/success/i);
  });

  it('has no detectable accessibility violations', async () => {
    const { container } = render(<CredentialCard {...HOME.credential} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('ServiceGrid featured card', () => {
  it('spans two columns only when asked', () => {
    const { container, rerender } = render(
      <ServiceGrid services={SERVICES.slice(0, 3)} featureFirst />,
    );
    const first = container.querySelector('li');
    expect(first?.className).toContain('sm:col-span-2');

    rerender(<ServiceGrid services={SERVICES.slice(0, 3)} />);
    expect(container.querySelector('li')?.className).not.toContain('sm:col-span-2');
  });

  it('keeps the shared card shell on the featured card', () => {
    const { container } = render(<ServiceGrid services={SERVICES.slice(0, 3)} featureFirst />);
    const items = [...container.querySelectorAll('li')];

    // The card itself is unpadded so the photograph runs to its edges; the
    // padding lives on the content wrapper inside. Radius and full height are
    // what keep the row level, and only the column span differs on the
    // featured card.
    for (const item of items) {
      expect(item.className).toContain('h-full');
      expect(item.className).toContain('rounded-xl');
      expect(item.className).toContain('p-0');

      const content = item.querySelector('h3')?.parentElement;
      expect(content?.className).toContain('p-6');
    }
  });

  it('runs the photograph to the card edges', () => {
    const { container } = render(<ServiceGrid services={SERVICES.slice(0, 2)} />);

    for (const item of container.querySelectorAll('li')) {
      // Both, so neither the base nor the sm padding can reintroduce a margin
      // around the image.
      expect(item.className).toContain('p-0');
      expect(item.className).toContain('sm:p-0');
      expect(item.querySelector('img')).not.toBeNull();
    }
  });

  it('features at most one card', () => {
    const { container } = render(<ServiceGrid services={SERVICES.slice(0, 5)} featureFirst />);
    const spanning = [...container.querySelectorAll('li')].filter((item) =>
      item.className.includes('sm:col-span-2'),
    );

    expect(spanning).toHaveLength(1);
  });

  it('has no detectable accessibility violations', async () => {
    const { container } = render(<ServiceGrid services={SERVICES.slice(0, 4)} featureFirst />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('decorative layers are not announced', () => {
  it('hides every purely visual element in the hero composition', () => {
    const { container } = render(
      <ImageCluster
        images={HOME.heroMedia}
        badge={<StampBadge text="Immigration advice" />}
      />,
    );

    const stamp = container.querySelector('svg')?.closest('[aria-hidden="true"]');
    expect(stamp).not.toBeNull();
  });

  it('leaves the described image slots announced', () => {
    render(<ImageCluster images={HOME.heroMedia} />);
    expect(screen.getAllByRole('img')).toHaveLength(HOME.heroMedia.length);
  });
});
