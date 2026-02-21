# DatArchi — Consolidated Guides

This file consolidates important guidance into a single, compact reference and reduces the number of top-level documentation files.

Kept (root-level):
- [INDEX.md](../INDEX.md) — Central navigation hub
- [QUICK_REFERENCE.md](../QUICK_REFERENCE.md) — Quick commands & common tasks
- [README.md](../README.md) — Project README

Archived docs: see `docs/archive/` for the full originals (if needed).

Summary sections

1) Image system & fix summary
- Image path calculation normalized to `partials/images/` with a `getRelativePath()` algorithm.
- Image utilities centralised in `js/image-utilities.js`; image-system initialization in `js/image-system-init.js`.
- 404 image fixes and lazy-loading applied. See archived `IMAGE_PATHS_FIX_GUIDE.md`.

2) Performance & Optimization
- Quick wins: minify, gzip, remove unused CSS, inline critical CSS, convert images to WebP/AVIF.
- Implement Service Worker, code-splitting, lazy-loading and virtual scrolling for long lists.
- See archived `PERFORMANCE_OPTIMIZATION_ROADMAP.md` and `PERFORMANCE_OPTIMIZATION_ROADMAP.md` for full details.

3) Security & Best Practices
- Use Firestore security rules and Storage rules (examples archived in `FIRESTORE-SECURITY-RULES.txt`).
- Apply CSP and security headers in server config (see archived `SECURITY_AND_BEST_PRACTICES.md`).

4) SEO & Structured Data
- Meta tags, Open Graph, JSON-LD and sitemap templates summarized in the archived `SEO_OPTIMIZATION_GUIDE.md`.

5) Research & Implementation Notes
- Research-specific services, CIDOC CRM, CRMarchaeo and VRE integration are documented in the archived `RESEARCH_IMPLEMENTATION_GUIDE.md`.

How to restore archived content
- The files moved to `docs/archive/` are preserved as placeholders; if you need full content restored, open the archived file and I can restore the original content into the working location.

If you'd like, I can also:
- keep a subset of the most-used guides in `docs/` and fully merge the rest into this file (long single-file doc), or
- keep `docs/` as a compact index and move all detailed guides to `docs/archive/` (current approach).

---
Updated: 2026-02-03
