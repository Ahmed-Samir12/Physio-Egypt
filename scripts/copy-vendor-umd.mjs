import path from 'path';
import { copyFile, mkdir } from 'fs/promises';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.dirname(__dirname);

const VENDOR_DIR = path.join(ROOT_DIR, 'src/public/js/vendor');
await mkdir(VENDOR_DIR, { recursive: true });

const lucideSrc = path.join(
  ROOT_DIR,
  'node_modules/lucide/dist/umd/lucide.min.js',
);
const chartSrc = path.join(
  ROOT_DIR,
  'node_modules/chart.js/dist/chart.umd.min.js',
);

await copyFile(lucideSrc, path.join(VENDOR_DIR, 'lucide.min.js'));
await copyFile(chartSrc, path.join(VENDOR_DIR, 'chart.umd.min.js'));

console.log('✅ Vendor UMD files copied to src/public/js/vendor/');

