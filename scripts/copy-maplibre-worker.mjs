// MapLibre v6 loads its worker as a separate ES module next to the main bundle.
// Bundlers rename chunks, so we ship the worker files from /public instead.
import { cpSync, mkdirSync } from 'node:fs';

const src = 'node_modules/maplibre-gl/dist';
const dest = 'public/maplibre';
mkdirSync(dest, { recursive: true });
for (const file of ['maplibre-gl-worker.mjs', 'maplibre-gl-shared.mjs']) {
  cpSync(`${src}/${file}`, `${dest}/${file}`);
}
