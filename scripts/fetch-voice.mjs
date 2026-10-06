// Mariam's recorded lines live on the voice service's CDN; the build copies them into the site
// so the assistant serves its own audio. A line that fails to download is simply left silent
// (the subtitles still carry it), so the build never breaks over audio.
import { mkdir, writeFile, access } from "node:fs/promises";
import sources from "../src/data/voice.json" with { type: "json" };

const dir = new URL("../public/assistant/voice/", import.meta.url);
await mkdir(dir, { recursive: true });

for (const [id, url] of Object.entries(sources)) {
  const file = new URL(`${id}.mp3`, dir);
  try {
    await access(file);
    continue;
  } catch {}
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    await writeFile(file, Buffer.from(await res.arrayBuffer()));
    console.log(`voice: ${id}`);
  } catch (e) {
    console.warn(`voice: ${id} not fetched (${e.message})`);
  }
}
