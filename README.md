# VANTA DISTRICT — Drop 04 / Night Shift

A fictional independent streetwear e-commerce concept created for the FORM11 TECH STUDIOS portfolio. This is a static, GitHub Pages-compatible storefront. It is not a real retailer and has no payment or commerce backend.

## Pages
- `index.html` — editorial homepage, latest pieces, campaign story and demo newsletter
- `shop.html` — category filters and price/newest sorting
- `product.html?id=afterhours-tee` — product details, colour and size selection, quantity, add-to-bag
- `bag.html` — persistent browser cart, quantity changes, remove, subtotal and demo checkout preview
- `campaign.html` — brand story and campaign editorial
- `404.html` — branded not-found page

## Run locally
No packages or build step are required. With Python installed, from this folder run:

```bash
python -m http.server 8000
```

Open <http://localhost:8000>.

## Production / GitHub Pages
All local links and asset references are relative, so they work when hosted beneath a repository path such as `https://USERNAME.github.io/REPOSITORY/`. The site is plain static HTML/CSS/JavaScript, so there is no bundler or production compilation step. The production equivalent is the same files served from the repository subpath.

1. Create a GitHub repository, for example `vanta-district`.
2. Copy the contents of this folder into the repository root (not the folder itself nested one level deeper).
3. Commit and push the files to the `main` branch.
4. In GitHub, open **Settings → Pages**. Choose **Deploy from a branch**, branch `main`, folder `/ (root)`, then save.
5. Wait for the Pages deployment to finish. The published URL will be `https://USERNAME.github.io/vanta-district/` (use your exact repository name).

Example commands after creating the empty GitHub repository:

```bash
git init
git add .
git commit -m "Build Vanta District storefront"
git branch -M main
git remote add origin https://github.com/USERNAME/vanta-district.git
git push -u origin main
```

If the repository already exists, use its actual URL and avoid adding a second `origin` remote. The Pages URL is only final after deployment succeeds.

## Demo behaviour and limitations
- Cart items persist in `localStorage` on the same browser/device.
- Product filtering, sorting, size/colour selection, quantity controls and subtotal calculation run in client-side JavaScript.
- Newsletter validation is a local demo confirmation only. No email is sent or stored by a server.
- Demo checkout only shows a notice. No payment, customer information, or real order is submitted.
- Product descriptions, prices, collection and brand are fictional concept content.
- Product/campaign photos are loaded from Unsplash image URLs; typefaces are loaded from Google Fonts. These require an internet connection and are not bundled locally.

## QA and production-path checks
Run the included dependency-free checks from the project root:

```bash
node --check app.js
node tests/qa.mjs
```

To smoke-test the project-site base path locally (the important difference from serving the folder as `/`), start a server from the parent directory:

```bash
cd ..
python -m http.server 8000
```

Then visit `http://localhost:8000/vanta-district/` and check that the page loads `vanta-district/styles.css` and `vanta-district/app.js`. The automated QA script checks local file/fragment references, core catalogue sorting/filtering, cart validation, variant merging, quantity caps, and subtotal arithmetic. See `QA-REPORT.md` for the exact checks run and the limitations. Remote image and Google Fonts delivery is not covered by that script; after deployment, inspect the browser Network and Console panels and confirm each remote asset returns successfully before calling the live site fully verified.
