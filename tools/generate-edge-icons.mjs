import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CWN_EDGES } from "../scripts/edge-catalogue.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "assets", "icons", "edges");
await fs.mkdir(output, { recursive: true });
const accents = ["#ffca5c", "#6cf6ff", "#ff5ecf", "#a9ff64"];
for (const [index, edge] of CWN_EDGES.entries()) {
  const color = accents[index % accents.length];
  const angle = (index * 29) % 360;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" role="img" aria-label="${edge.name}">
  <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#151008"/><stop offset="1" stop-color="#16263a"/></linearGradient><filter id="g"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
  <rect x="8" y="8" width="240" height="240" rx="38" fill="url(#bg)" stroke="${color}" stroke-width="8"/>
  <g transform="rotate(${angle} 128 128)" fill="none" stroke="${color}" filter="url(#g)"><path d="M128 34l29 62 67 9-49 47 12 67-59-32-59 32 12-67-49-47 67-9z" stroke-width="5" stroke-dasharray="18 10"/><circle cx="128" cy="128" r="86" stroke-width="3" opacity=".65"/></g>
  <circle cx="128" cy="128" r="58" fill="#0a111c" stroke="${color}" stroke-width="5"/><text x="128" y="145" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="46" font-weight="800" fill="#f7fbff">${edge.iconLabel}</text>
</svg>`;
  await fs.writeFile(path.join(output, `${edge.edgeKey}.svg`), svg, "utf8");
}
console.log(`Generated ${CWN_EDGES.length} original CWN Edge/reference SVG icons.`);
