import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';

const root = process.cwd();
const files = (await readdir(root)).filter(name => name.endsWith('.html'));
let checks = 0;
const pass = message => { checks++; console.log(`✓ ${message}`); };

// Static production-path checks, including the project-site subpath model.
for (const file of files) {
  const html = await readFile(path.join(root, file), 'utf8');
  const ids = new Set([...html.matchAll(/\bid=["']([^"']+)["']/g)].map(m => m[1]));
  for (const match of html.matchAll(/\b(?:href|src)=["']([^"']+)["']/g)) {
    const raw = match[1];
    if (/^(?:https?:|mailto:|tel:|javascript:|data:|\/\/)/i.test(raw)) continue;
    const [pathname, fragment] = raw.split('#');
    const pathOnly = (pathname || '').split('?')[0];
    if (fragment && !pathOnly && fragment !== '') assert(ids.has(fragment), `${file}: missing #${fragment}`);
    if (pathOnly && pathOnly !== './') {
      const target = path.resolve(root, pathOnly);
      assert(target.startsWith(root + path.sep), `${file}: path escapes project: ${raw}`);
      await stat(target);
    }
  }
  assert.match(html, /<meta[^>]+name="description"/i, `${file}: missing description metadata`);
  pass(`${file}: local links/assets and fragment targets resolve`);
}
const css = await readFile(path.join(root, 'styles.css'), 'utf8');
const js = await readFile(path.join(root, 'app.js'), 'utf8');
assert.match(css, /prefers-reduced-motion\s*:\s*reduce/);
assert.match(css, /:focus-visible/);
assert.match(css, /@media\s*\(max-width:\s*700px\)/);
pass('CSS includes mobile layout, keyboard focus, and reduced-motion support');
assert.match(js, /localStorage\.setItem/);
assert.match(js, /data-filter/);
assert.match(js, /data-sort/);
pass('JavaScript contains cart persistence, product filtering and sorting handlers');

// Run cart logic in a dependency-free VM with a minimal browser stub.
const store = new Map();
const fakeDocument = {
  addEventListener() {},
  querySelectorAll() { return []; },
  querySelector() { return null; },
  createElement() { return { setAttribute() {}, remove() {}, textContent: '', className: '' }; },
  body: { append() {} }
};
const context = {
  document: fakeDocument,
  localStorage: {
    getItem(key) { return store.has(key) ? store.get(key) : null; },
    setItem(key, value) { store.set(key, value); }
  },
  setTimeout() { return 1; }, clearTimeout() {},
  Intl, JSON, Math, Number, URLSearchParams, console
};
vm.runInNewContext(`${js}\nglobalThis.__qa = { PRODUCTS, readCart, saveCart, addToCart, cartCount, byId, cartSubtotal, productCard, getCatalogItems };`, context);
const { PRODUCTS, readCart, addToCart, cartCount, cartSubtotal, productCard, byId, getCatalogItems } = context.__qa;
assert.equal(PRODUCTS.length, 8); pass('exactly eight original product records are present');
assert.equal(getCatalogItems('tops').length, 3);
assert.equal(getCatalogItems('outerwear').length, 3);
assert.equal(getCatalogItems('accessories').length, 2); pass('category filters return the expected products');
assert.deepEqual(Array.from(getCatalogItems('all','price-asc'), p => p.price), [28,32,42,54,88,96,112,148]);
assert.deepEqual(Array.from(getCatalogItems('all','price-desc'), p => p.price), [148,112,96,88,54,42,32,28]);
pass('price sorting returns correctly ordered catalogues');
assert.equal(addToCart('not-a-product', 'M'), false); pass('unknown products are rejected');
assert.equal(addToCart('afterhours-tee', 'XXL'), false); pass('invalid sizes are rejected');
assert.equal(addToCart('afterhours-tee', 'M', 2, 'Bone'), true);
assert.equal(addToCart('afterhours-tee', 'M', 3, 'Bone'), true);
assert.equal(cartCount(), 5); pass('same product/size/colour merges quantities correctly');
assert.equal(addToCart('afterhours-tee', 'M', 1, 'Obsidian'), true);
assert.equal(cartCount(), 6); assert.equal(readCart().length, 2); pass('different colours remain separate cart variants');
assert.equal(cartSubtotal(), 42 * 6); pass('cart subtotal multiplies unit prices by quantities correctly');
assert.equal(addToCart('district-cap', 'ONE SIZE', 30, 'Acid'), true);
assert.equal(readCart().find(x => x.id === 'district-cap').qty, 20); pass('cart quantity is capped at 20 per variant');
assert.equal(readCart().find(x => x.id === 'district-cap').colour, 'Acid'); pass('valid selected colour is persisted');
assert.match(productCard(byId('afterhours-tee')), /CHOOSE OPTIONS/);
assert.match(productCard(byId('district-cap')), /QUICK ADD/); pass('product-card actions describe their actual behaviour');
console.log(`\n${checks} QA checks passed.`);
