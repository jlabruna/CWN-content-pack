import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const moduleRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const palettes = Object.freeze({
  generic: Object.freeze({ primary: "#596675", accent: "#c2ccd6", wood: "#4d3a2b" }),
  ironbark: Object.freeze({ primary: "#376f35", accent: "#91bd63", wood: "#9a704a" })
});

const icons = Object.freeze({
  "generic/broken-bottle": {
    label: "Broken Bottle",
    shape: `<g transform="rotate(-27 256 256)">
      <path class="glass" d="M211 72h90v74l27 45v111l-35 24-25-31-22 38-54-30V191l25-45z"/>
      <path class="body" d="M204 303l43 20 21-28 25 31 30-20-8 128H202z"/>
      <path class="line" d="M226 102h60M223 182l76 73M213 248l68-70"/>
    </g>`
  },
  "generic/kitchen-knife": {
    label: "Kitchen Knife",
    shape: `<g transform="rotate(-38 256 256)">
      <path class="blade" d="M205 52c74 45 117 121 121 254l-101 10c6-111-2-194-20-264z"/>
      <path class="detail" d="M205 304h133v34H205z"/>
      <path class="wood" d="M230 335h84l-6 126h-72z"/>
      <circle class="bolt" cx="257" cy="371" r="8"/><circle class="bolt" cx="277" cy="421" r="8"/>
      <path class="edge" d="M231 91c42 69 62 132 66 190"/>
    </g>`
  },
  "generic/shiv": {
    label: "Shiv",
    shape: `<g transform="rotate(-31 256 256)">
      <path class="blade" d="M250 55l57 47 14 219-77 1-18-191z"/>
      <path class="detail" d="M226 308h111v31H226z"/>
      <path class="body" d="M239 336h82l-9 129h-65z"/>
      <path class="line" d="M248 356l62 31-65 24 61 28M255 105l37 173"/>
    </g>`
  },
  "generic/wrench": {
    label: "Wrench",
    shape: `<g transform="rotate(-42 256 256)">
      <path class="body" d="M215 54l42 65 42-65 31 24-17 92-34 27 20 211-43 54-43-54 20-211-34-27-17-92z"/>
      <path class="detail" d="M229 205h54l-13 183h-28z"/>
      <circle class="linefill" cx="256" cy="413" r="22"/>
    </g>`
  },
  "generic/crowbar": {
    label: "Crowbar",
    shape: `<g transform="rotate(-37 256 256)">
      <path class="body" d="M223 91c0-48 32-66 73-52l-8 45c-18-5-24 4-24 18v270c0 24 11 31 31 17l26 38c-59 48-103 14-103-49z"/>
      <path class="edge" d="M239 117v257M275 55l48 14"/>
    </g>`
  },
  "generic/metal-pipe": {
    label: "Metal Pipe",
    shape: `<g transform="rotate(-39 256 256)">
      <path class="body" d="M211 72h90l-13 364h-64z"/>
      <ellipse class="linefill" cx="256" cy="76" rx="45" ry="24"/>
      <ellipse class="detail" cx="256" cy="76" rx="23" ry="11"/>
      <path class="line" d="M236 119l-9 275M276 119l9 275M226 346h60"/>
    </g>`
  },
  "generic/pool-cue": {
    label: "Pool Cue",
    shape: `<g transform="rotate(-41 256 256)">
      <path class="wood" d="M244 51h24l18 378-60 1z"/>
      <path class="detail" d="M226 342h60l4 91-68 1z"/>
      <path class="accent" d="M240 50h32v35h-32z"/>
      <path class="line" d="M235 366l45 29m-51-3l54 28"/>
    </g>`
  },
  "generic/sledgehammer": {
    label: "Sledgehammer",
    shape: `<g transform="rotate(-35 256 256)">
      <path class="body" d="M123 78h266l27 83-45 62H141l-45-62z"/>
      <path class="detail" d="M214 216h84l-10 247h-64z"/>
      <path class="line" d="M139 125h234M235 251l43 174m-49-89h56"/>
      <path class="edge" d="M111 158h290"/>
    </g>`
  },
  "ironbark/huntsman-compound-bow": {
    label: "Ironbark Huntsman Compound Bow",
    shape: `<g transform="rotate(-8 256 256)">
      <circle class="body" cx="187" cy="104" r="43"/><circle class="body" cx="187" cy="408" r="43"/>
      <path class="body" d="M191 137c74 36 93 88 74 119 19 31 0 83-74 119l-18-39c48-28 58-55 45-80 13-25 3-52-45-80z"/>
      <path class="detail" d="M187 61l137 195-137 195M187 104v304"/>
      <path class="accent" d="M235 223h69v66h-69z"/>
      <path class="arrow" d="M97 248h314v16H97zM411 232l44 24-44 24zM97 238l-34 18 34 18z"/>
      <path class="line" d="M187 104l-52 152 52 152"/>
    </g>`
  }
});

const render = (key, { label, shape }) => {
  const vendor = key.split("/")[0];
  const palette = palettes[vendor];
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-label="${label}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0d1219"/><stop offset="1" stop-color="#030507"/></linearGradient>
    <linearGradient id="metal" x1="0" y1="0" x2=".8" y2="1"><stop offset="0" stop-color="#77808b"/><stop offset=".38" stop-color="#242b32"/><stop offset=".72" stop-color="${palette.primary}"/><stop offset="1" stop-color="#11151a"/></linearGradient>
    <linearGradient id="blade" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f0f3f5"/><stop offset=".42" stop-color="#7c8792"/><stop offset=".72" stop-color="${palette.primary}"/><stop offset="1" stop-color="#222930"/></linearGradient>
    <linearGradient id="wood" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${palette.wood}"/><stop offset="1" stop-color="#24170f"/></linearGradient>
    <radialGradient id="halo"><stop offset="0" stop-color="${palette.primary}" stop-opacity=".25"/><stop offset="1" stop-color="${palette.primary}" stop-opacity="0"/></radialGradient>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <style>
      .body{fill:url(#metal);stroke:${palette.primary};stroke-width:6;stroke-linejoin:round}.blade{fill:url(#blade);stroke:${palette.accent};stroke-width:6;stroke-linejoin:round}.wood{fill:url(#wood);stroke:${palette.primary};stroke-width:6;stroke-linejoin:round}.glass{fill:#8ed6df;fill-opacity:.32;stroke:${palette.accent};stroke-width:6;stroke-linejoin:round}.detail{fill:#11161c;stroke:${palette.primary};stroke-width:5;stroke-linejoin:round}.accent{fill:#0b1118;stroke:${palette.accent};stroke-width:6;stroke-linejoin:round}.linefill{fill:#090c10;stroke:${palette.accent};stroke-width:5}.line{fill:none;stroke:${palette.accent};stroke-width:4;stroke-linecap:round;stroke-linejoin:round;opacity:.72}.edge{fill:none;stroke:${palette.accent};stroke-width:7;stroke-linecap:round;filter:url(#glow)}.bolt{fill:${palette.accent};stroke:${palette.primary};stroke-width:4}.arrow{fill:${palette.accent};stroke:${palette.primary};stroke-width:4;stroke-linejoin:round}
    </style>
  </defs>
  <rect width="512" height="512" rx="48" fill="url(#bg)"/><circle cx="256" cy="256" r="209" fill="url(#halo)"/><circle cx="256" cy="256" r="179" fill="none" stroke="${palette.primary}" stroke-width="3" opacity=".22"/><circle cx="256" cy="256" r="132" fill="none" stroke="${palette.accent}" stroke-width="2" stroke-dasharray="11 17" opacity=".16"/><path d="M79 65h354l14 14v354l-14 14H79l-14-14V79z" fill="none" stroke="${palette.primary}" stroke-width="9"/><path d="M96 83h320M429 97v318M416 429H96M83 415V97" fill="none" stroke="${palette.accent}" stroke-width="2" opacity=".72"/><path d="M65 151h28m-28 210h28M419 151h28m-28 210h28" stroke="${palette.accent}" stroke-width="5" opacity=".5"/>${shape}
</svg>
`;
};

for (const [key, icon] of Object.entries(icons)) {
  const output = path.join(moduleRoot, "assets", "icons", "weapons", `${key}.svg`);
  await fs.mkdir(path.dirname(output), { recursive: true });
  await fs.writeFile(output, render(key, icon), "utf8");
}

console.log(`Generated ${Object.keys(icons).length} requested weapon SVG icons.`);
