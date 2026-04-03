import * as esbuild from 'esbuild';
import { readdir, mkdir, readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SRC_JS = path.join(__dirname, 'src/public/js');
const SRC_CSS = path.join(__dirname, 'src/public/css');
const OUT_DIR = path.join(__dirname, 'src/public/dist');

await mkdir(OUT_DIR, { recursive: true });
await mkdir(path.join(OUT_DIR, 'css'), { recursive: true });
await mkdir(path.join(OUT_DIR, 'js'), { recursive: true });

const isDev = process.argv.includes('--dev');
console.log(`\n🔧 Building in ${isDev ? 'DEV' : 'PRODUCTION'} mode...\n`);

// ── JS: bundle each page as separate entry (code-splitting shares chunks) ──
const pageFiles = (await readdir(path.join(SRC_JS, 'pages'))).filter((f) =>
  f.endsWith('.js'),
);
const jsEntries = [
  ...pageFiles.map((f) => path.join(SRC_JS, 'pages', f)),
  path.join(SRC_JS, 'alert.js'),
  path.join(SRC_JS, 'search.js'),
];

console.log(`📦 Bundling ${jsEntries.length} JS entry points...`);
const jsResult = await esbuild.build({
  entryPoints: jsEntries,
  bundle: true,
  splitting: true,
  format: 'esm',
  outdir: path.join(OUT_DIR, 'js'),
  minify: !isDev,
  sourcemap: isDev ? 'inline' : false,
  target: ['es2022'], // es2022 supports top-level await
  treeShaking: true,
  metafile: true,
  logLevel: 'warning',
  charset: 'utf8',
});

const outputs = jsResult.metafile?.outputs || {};
let totalJs = 0;
Object.entries(outputs).forEach(([file, info]) => {
  totalJs += info.bytes;
  if (!path.basename(file).startsWith('chunk-')) {
    console.log(
      `  ✓ ${path.basename(file).padEnd(32)} ${(info.bytes / 1024).toFixed(1)} KB`,
    );
  }
});
const chunks = Object.keys(outputs).filter((f) =>
  path.basename(f).startsWith('chunk-'),
).length;
console.log(`  + ${chunks} shared chunk(s)`);
console.log(`  Total JS: ${(totalJs / 1024).toFixed(1)} KB\n`);

// ── CSS: concatenate core files, then minify each page CSS ──
console.log(`🎨 Bundling CSS...`);

const coreCssFiles = ['base.css', 'components.css', 'layout.css'];
let mainCss = '';
for (const f of coreCssFiles) {
  const p = path.join(SRC_CSS, f);
  if (existsSync(p)) mainCss += (await readFile(p, 'utf8')) + '\n';
}
const mainResult = await esbuild.transform(mainCss, {
  loader: 'css',
  minify: !isDev,
});
await writeFile(path.join(OUT_DIR, 'css', 'main.css'), mainResult.code);
console.log(
  `  ✓ main.css (base+components+layout)   ${(mainResult.code.length / 1024).toFixed(1)} KB`,
);

const pageCssFiles = (await readdir(path.join(SRC_CSS, 'pages'))).filter((f) =>
  f.endsWith('.css'),
);
let totalCss = mainResult.code.length;
for (const f of pageCssFiles) {
  const src = await readFile(path.join(SRC_CSS, 'pages', f), 'utf8');
  const result = await esbuild.transform(src, {
    loader: 'css',
    minify: !isDev,
  });
  await writeFile(path.join(OUT_DIR, 'css', f), result.code);
  totalCss += result.code.length;
  console.log(
    `  ✓ ${f.padEnd(32)} ${(result.code.length / 1024).toFixed(1)} KB`,
  );
}
console.log(`  Total CSS: ${(totalCss / 1024).toFixed(1)} KB\n`);

console.log('✅ Build complete → src/public/dist/');
console.log('\nTo use bundles in production, update Pug layouts to reference:');
console.log(
  '  /dist/css/main.css  instead of  /css/base.css + /css/components.css + /css/layout.css',
);
console.log('  /dist/css/<page>.css  instead of  /css/pages/<page>.css');
console.log('  /dist/js/pages/<page>.js  instead of  /js/pages/<page>.js\n');
