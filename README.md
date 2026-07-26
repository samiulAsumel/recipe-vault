# Homestyle Recipe Book

A small multi-page recipe website built with plain, semantic HTML5 — no CSS,
no JavaScript, by design. This project marks the point where the HTML5 topic
is fully complete and CSS3 hasn't started yet.

## What this demonstrates

- Document structure & metadata (doctype, lang, charset, viewport, title,
  meta description, canonical link, favicon, Open Graph tags, robots directive)
- Semantic sectioning (header, nav, main, section, article, aside, footer)
- Text content elements (headings, paragraphs, blockquote/cite)
- Lists (ul, ol) used for their correct semantic purpose
- Links & navigation (relative links between pages, in-page anchors)
- Images & media (img with alt, figure/figcaption, video/source/track)
- Tables (caption, colgroup, thead/tbody/tfoot, scope, colspan)
- Forms (input types, native validation attributes, fieldset/legend,
  correct enctype for file upload, autocomplete)

## How to view it

No build step, no server required. Open index.html directly in a browser.
Every link is a relative path to another file in this repo.

## Known limitation (intentional)

There is no CSS. The header/nav/footer markup is repeated at the top and
bottom of every page rather than pulled from a shared template, because
HTML5 alone has no include mechanism — that gap gets solved later once
templating/backend topics are covered. This is a static-HTML-only milestone
project, not a finished product.
