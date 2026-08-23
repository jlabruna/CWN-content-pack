import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CWN_FOCI } from "../scripts/focus-catalogue.mjs";

const moduleRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = path.join(moduleRoot, "assets", "icons", "foci");
await fs.mkdir(outputRoot, { recursive: true });

const accent = ["#64f6ff", "#ff4fd8", "#a7ff52", "#ffb84d"];
for (const [index, focus] of CWN_FOCI.entries()) {
  const color = accent[index % accent.length];
  const turn = (index * 37) % 360;
  const orbit = 18 + (index % 5) * 3;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" role="img" aria-label="${focus.name}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#07131d"/><stop offset="1" stop-color="#17233b"/>
    </linearGradient>
    <filter id="glow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <rect x="8" y="8" width="240" height="240" rx="38" fill="url(#bg)" stroke="${color}" stroke-width="8"/>
  <g transform="rotate(${turn} 128 128)" fill="none" stroke="${color}" filter="url(#glow)">
    <circle cx="128" cy="128" r="82" stroke-width="5" stroke-dasharray="20 11"/>
    <path d="M128 ${46 - orbit / 4}L${128 + orbit} ${78 + orbit / 3}L${210 - orbit / 3} 128L${128 + orbit} ${178 - orbit / 3}L128 ${210 + orbit / 4}L${128 - orbit} ${178 - orbit / 3}L${46 + orbit / 3} 128L${128 - orbit} ${78 + orbit / 3}Z" stroke-width="4" opacity=".7"/>
  </g>
  <circle cx="128" cy="128" r="57" fill="#09111e" stroke="${color}" stroke-width="5"/>
  <text x="128" y="145" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="48" font-weight="800" letter-spacing="-2" fill="#f5fbff">${focus.iconLabel}</text>
  <path d="M36 210h42M178 46h42" stroke="${color}" stroke-width="7" stroke-linecap="round"/>
</svg>`;
  await fs.writeFile(path.join(outputRoot, `${focus.focusKey}.svg`), svg, "utf8");
}

console.log(`Generated ${CWN_FOCI.length} original CWN Focus SVG icons.`);

