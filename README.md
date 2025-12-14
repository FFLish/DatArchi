# DatArchi

## Workspace cleanup (automated)

- Fixed page script references in `pages/*/index.html` to point to central `js/` modules.
- Corrected imports in `js/navbar.js` (now imports `about-us.js` and `funde.js`).
- Disabled unused duplicate scripts: `js/header/navbar.js` and `js/sidebar/sidebar.js` (kept as no-op stubs for history).

If you'd like, I can permanently remove the deprecated files or run a site build to verify runtime behavior.