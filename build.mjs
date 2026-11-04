import { readFileSync, writeFileSync } from 'node:fs';

// Keep the preview self-contained: no module imports or external assets required.
const template = readFileSync(new URL('./src/index.template.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('./style.css', import.meta.url), 'utf8').replace(/^@import[^;]+;\s*/, '');
const rules = readFileSync(new URL('./game.js', import.meta.url), 'utf8').replace(/^export /gm, '');
const app = readFileSync(new URL('./app.js', import.meta.url), 'utf8').replace(/^import[^\n]+\n/, '');
const html = template
  .replace('<link rel="stylesheet" href="style.css">', () => `<style>\n${css}\n</style>`)
  .replace('<script type="module" src="app.js"></script>', () => `<script>\n(() => {\n${rules}\n${app}\n})();\n</script>`);
writeFileSync(new URL('./index.html', import.meta.url), html);
console.log('Built self-contained index.html');
