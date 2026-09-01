import { ChevronDown } from 'lucide-react';
import type { ServiceFaq } from '@/lib/content/types';

/**
 * FAQ accordion built on native details and summary elements, which are
 * keyboard accessible and expandable without JavaScript.
 */
export function FaqList({ faqs }: { faqs: readonly ServiceFaq[] }) {
  if (faqs.length === 0) return null;

  return (
    <div className="divide-y divide-border-subtle overflow-hidden rounded-xl border border-border-subtle bg-surface">
      {faqs.map((faq) => (
        <details key={faq.question} className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 text-left sm:p-6 [&::-webkit-details-marker]:hidden">
            <span className="text-base font-semibold text-strong">{faq.question}</span>
            <ChevronDown
              className="h-5 w-5 shrink-0 text-accent-ink transition-transform duration-200 group-open:rotate-180"
              aria-hidden="true"
            />
          </summary>
          <div className="px-5 pb-5 sm:px-6 sm:pb-6">
            <p className="measure text-sm leading-relaxed text-muted">{faq.answer}</p>
          </div>
        </details>
      ))}
    </div>
  );
}
