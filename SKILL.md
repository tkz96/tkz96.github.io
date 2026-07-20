---
name: swiss-docs-site
description: Converts a markdown document (playbook, spec, README, internal guide) into a polished static documentation website in the Swiss / International Typographic Style, ready to deploy on GitHub Pages. Use this whenever the user wants to turn an .md file into a website, build a docs site from existing content, publish a playbook or guide as a webpage, or asks for "Swiss design," "International Typographic Style," a grid-based minimalist docs site, or a GitHub Pages site sourced from markdown — even if they don't use those exact words. Push toward this skill any time the deliverable is "take this doc and make it a real site."
---

# Swiss Docs Site

Turns a markdown source (playbook, spec, guide) into a disciplined, grid-driven documentation site — not a generic docs-theme clone — deployable on GitHub Pages.

## Phase 1 — Inventory

Before designing anything, read the *entire* source markdown file. Don't assume its structure — extract it:
- Heading hierarchy (H1–H4) → this becomes the TOC/nav. Never invent structure the source doesn't have.
- Every code block and its language.
- Every table.
- Any images, footnotes, callouts, or internal cross-references.

This inventory determines the nav, the anchor slugs, and how much room code/tables need in the grid.

## Phase 2 — Design tokens (Swiss / International Typographic Style)

Produce a short, named token plan before writing any code. This is a specific, disciplined visual language, not "modern-ish":

- **Grid**: state the numbers explicitly — column count, gutter, baseline unit (e.g. 12 columns, 24px gutter, 8px baseline rhythm). Every element aligns to it.
- **Type**: one grotesque/neo-grotesque sans for display + body (Helvetica/Akzidenz-Grotesk-style — Inter, IBM Plex Sans, Neue Haas Grotesk, or similar), one monospace for code, a defined modular scale with a small number of weights. Type carries the hierarchy — not color, not boxes, not shadows.
- **Color**: near-black text on white/off-white base, plus exactly one accent used sparingly and consistently (red is the canonical Swiss choice; any single deliberate accent is fine — just justify it). No gradients, no drop shadows, no glassmorphism, no rounded-corner cards.
- **Alignment**: flush-left, ragged-right, always. Never justify text.
- **Signature**: pick one considered moment to spend the "boldness budget" on (e.g. how the TOC responds on scroll, how code blocks are framed) — keep everything else quiet and disciplined.

Check the plan against generic AI-docs defaults before building: hairline rules with no real grid math underneath, or a broadsheet look with no actual typographic hierarchy, is a costume, not Swiss design. Earn it.

## Phase 3 — Build

Required regardless of stack:
- Sticky sidebar TOC with scrollspy (highlights current section on scroll), collapsing to a drawer/hamburger on mobile.
- Anchor-linked headings with hover-to-copy.
- Syntax-highlighted code blocks: language label, copy-to-clipboard button, and the source code preserved byte-for-byte (no reformatting).
- Tables styled with hairline rules consistent with the grid; horizontally scrollable on narrow viewports rather than squeezed.
- Fully responsive to small mobile; visible keyboard focus states; semantic landmarks (`nav`, `main`, `aside`); skip-to-content link.

**Stack guidance**: for a static markdown-derived site, a small Node build script (`marked` or `remark` + `shiki`/`highlight.js`) or a minimal generator (e.g. Eleventy) that outputs plain HTML/CSS with light JS is preferable to a full SPA framework — docs content doesn't need one, and it keeps Lighthouse scores trivially high. Justify any framework choice that adds real runtime weight.

**Deploy target**: GitHub Pages — either a committed `/docs` folder on `main`, or a `gh-pages` branch built via a small GitHub Actions workflow. Match whichever convention the repo already leans toward.

## Phase 4 — Quality gate

Before calling it done, verify:
- [ ] Nav/TOC matches the source's real heading structure exactly
- [ ] Every code snippet renders identical to source (no re-wrapped lines, no altered whitespace/escaping)
- [ ] Every table is legible and scrolls on mobile rather than squeezing
- [ ] Contrast ratios pass for body text and for accent-on-background
- [ ] Every interactive element is keyboard-reachable with a visible focus ring
- [ ] Grid alignment holds at desktop, tablet, and mobile breakpoints
- [ ] Performance/accessibility checks are clean (should be easy for a static, JS-light site)

## Phase 5 — Self-critique

Ask directly: does this look like it was designed for this specific content, or like a templated docs theme with Swiss surface dressing over it? If it's the latter, the usual culprits are (a) the grid isn't actually driving spacing decisions, or (b) the accent color is decorative rather than functional. Fix before shipping.