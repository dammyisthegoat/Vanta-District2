# VANTA DISTRICT — QA report

**Status:** Static storefront prepared for GitHub Pages. Not yet deployed to a public repository URL.

## Passed checks

- `node --check app.js`
- `node tests/qa.mjs`: 19 checks passed.
- HTTP smoke test from a parent-directory server at `/vanta-district/`: homepage, all five content pages, `404.html`, `styles.css`, and `app.js` each returned HTTP 200.
- Chromium/Playwright interaction checks using the project's CSS and JavaScript in an isolated test document: homepage renders four featured product cards; mobile menu opens and closes with Escape; shop starts with eight products; Tops filter returns three; ascending price sort returns the correct order; product size and quantity controls work; adding two units of the tee produces a £84 subtotal; increasing to three updates it to £126; removing the item restores the empty-bag state.
- No browser JavaScript page errors were reported during those interaction checks.
- Responsive overflow checks at 320, 390, 768, and 1440 CSS pixels across homepage, shop, product, bag, and campaign pages found no horizontal document overflow.
- ZIP archive integrity check passed.

## Limitations not represented as passes

- This environment blocks direct browser navigation to local HTTP/file URLs, so the browser interaction checks used an isolated document with the project's local CSS and JavaScript embedded. The separate HTTP smoke test checked actual relative paths under the repository subpath.
- Outbound DNS/network access was unavailable while testing, so individual Unsplash image responses and Google Fonts delivery could not be verified. The live deployed browser Network and Console panels should be checked after publishing.
- No public GitHub Pages deployment URL exists yet. The project is static and has no separate compilation/build step.
