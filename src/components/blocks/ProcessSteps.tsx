import { Card, CardHeading } from '@/components/ui/Card';

export interface ProcessStep {
  readonly title: string;
  readonly body: string;
}

/**
 * Numbered process steps. Rendered as an ordered list so the sequence is
 * conveyed to assistive technology, not only by the numerals on screen.
 */
export function ProcessSteps({ steps }: { steps: readonly ProcessStep[] }) {
  return (
    <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((step, index) => (
        <Card as="li" key={step.title} tone="surface">
          <span
            className="font-serif text-[2rem] leading-none font-semibold text-accent-ink/45"
            aria-hidden="true"
          >
            {String(index + 1).padStart(2, '0')}
          </span>
          <CardHeading className="mt-4">{step.title}</CardHeading>
          <p className="mt-3 text-sm leading-relaxed text-muted">{step.body}</p>
        </Card>
      ))}
    </ol>
  );
}
