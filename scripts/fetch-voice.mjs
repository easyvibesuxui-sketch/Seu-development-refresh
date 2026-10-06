// Mariam's recorded lines live on the voice service's CDN; the build copies them into the site
// so the assistant serves its own audio. A line that fails to download is simply left silent
// (the subtitles still carry it), so the build never breaks over audio.
import { mkdir, writeFile, access } from "node:fs/promises";
import sources from "../src/data/voice.json" with { type: "json" };

const dir = new URL("../public/assistant/voice/", import.meta.url);
await mkdir(dir, { recursive: true });

// On GitHub Actions the outcome shows up as annotations on the run, so it can be checked at a glance.
const ci = !!process.env.GITHUB_ACTIONS;
const fetched = [];
const missing = [];

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
    fetched.push(id);
  } catch (e) {
    missing.push(`${id} (${e.message})`);
  }
}

const summary = `voice: ${fetched.length} fetched${fetched.length ? ` (${fetched.join(", ")})` : ""}`;
console.log(ci ? `::notice title=Voice lines::${summary}` : summary);
if (missing.length) {
  const note = `voice not fetched: ${missing.join(", ")}`;
  console.warn(ci ? `::warning title=Voice lines::${note}` : note);
}
