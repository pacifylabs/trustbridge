# Photography provenance

Every image in `public/images` is CC0 or Public Domain Mark. Neither requires
attribution, which is why the site carries no credits page.

This file is a private record for the practice. It is not served: Next.js only
exposes `public/`, and this sits at the repository root.

## Why it matters

An earlier set included nine CC BY images, which would have obliged us to name
each photographer wherever they appeared. They were replaced with public domain
equivalents so the obligation disappears entirely.

**Before replacing any file, check the licence of what you put in its place.**
A CC BY image dropped in here would put the site in breach unless credits are
published alongside it.

## Source

All images were retrieved through Openverse (`api.openverse.org`), filtered to
`license=cc0,pdm`. Each was reviewed by eye before use.

## Files

| File | Licence |
| --- | --- |
| `hero/lake-district.webp` | Public Domain Mark |
| `hero/cornwall-coast.webp` | CC0 |
| `hero/oxford.webp` | CC0 |
| `hero/york-minster.webp` | CC0 |
| `hero/london-skyline.webp` | Public Domain Mark |
| `cluster/consultation.webp` | Public Domain Mark |
| `cluster/london-street.webp` | CC0 |
| `cluster/family.webp` | CC0 |
| `services/spouse-and-partner-visas.webp` | CC0 |
| `services/visitor-visas.webp` | CC0 |
| `services/skilled-worker-visas.webp` | CC0 |
| `services/health-and-care-worker-visas.webp` | Public Domain Mark |
| `services/settlement-indefinite-leave-to-remain.webp` | CC0 |
| `services/british-citizenship.webp` | CC0 |
| `services/eu-settlement-scheme.webp` | CC0 |
| `services/business-immigration.webp` | CC0 |
| `services/complex-immigration-matters.webp` | CC0 |
| `articles/what-to-expect-at-your-first-consultation.webp` | CC0 |
| `articles/how-we-handle-your-documents.webp` | CC0 |
| `articles/where-home-office-fees-are-published.webp` | CC0 |

## Replacing them

These are stand-ins. Real photography of the practice and its advisers will do
far more for a professional-services site than stock ever can. To swap one,
overwrite the file at the same path and update the `width` and `height` in the
matching entry in `src/content/`.
