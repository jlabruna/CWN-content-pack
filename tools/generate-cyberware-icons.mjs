import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const moduleRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = path.join(moduleRoot, "data", "cyberware");
const outputRoot = path.join(moduleRoot, "assets", "icons", "cyberware");
const palette = ["#46d9ff", "#ff5aa5", "#74e39b", "#ffc857", "#a783ff", "#ff765f"];

const sources = [];
for (const filename of (await fs.readdir(sourceRoot)).filter((name) => name.endsWith(".json")).sort()) {
  sources.push(JSON.parse(await fs.readFile(path.join(sourceRoot, filename), "utf8")));
}
if (sources.length !== 88) throw new Error(`Expected 88 cyberware sources, found ${sources.length}.`);

await fs.rm(outputRoot, { recursive: true, force: true });
await fs.mkdir(outputRoot, { recursive: true });
for (const source of sources) {
  const digest = crypto.createHash("sha256").update(source.sourceKey).digest();
  const accent = palette[digest[0] % palette.length];
  const initials = source.name
    .split(/[\s/()-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
  const circuitY = 150 + (digest[1] % 7) * 30;
  const circuitX = 140 + (digest[2] % 7) * 30;
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-labelledby="title">
  <title>${source.name.replaceAll("&", "&amp;").replaceAll("<", "&lt;")}</title>
  <g fill="none" stroke="${accent}" stroke-width="18" stroke-linecap="round" stroke-linejoin="round">
    <path opacity=".42" d="M256 42 430 142v228L256 470 82 370V142z"/>
    <circle cx="256" cy="256" r="116"/>
    <path d="M140 ${circuitY}H92m328 0h-48M${circuitX} 140V92m0 328v-48"/>
    <circle cx="140" cy="${circuitY}" r="10"/><circle cx="372" cy="${circuitY}" r="10"/>
  </g>
  <text x="256" y="284" text-anchor="middle" fill="${accent}" font-family="system-ui,sans-serif" font-size="72" font-weight="700">${initials}</text>
</svg>
`;
  await fs.writeFile(path.join(outputRoot, `${source.sourceKey}.svg`), svg, "utf8");
}

console.log(`Generated ${sources.length} distinct original cyberware SVG icons.`);
