import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const moduleRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = path.join(moduleRoot, "assets", "icons", "armor");

const icons = {
  "absorption-plates": {
    label: "Absorption Plates",
    color: "#ffc857",
    shape: `<path class="plate" d="M132 142l78-34 46 35 46-35 78 34-21 226-103 50-103-50z"/>
      <path class="line" d="M210 108l18 95-50 50 34 95M302 108l-18 95 50 50-34 95"/>
      <path class="accent" d="M181 172h48l15 39-38 34-38-26zm150 0h-48l-15 39 38 34 38-26z"/>`
  },
  "armored-clothing": {
    label: "Armored Clothing",
    color: "#25d9ff",
    shape: `<path class="plate" d="M151 123l65-28 40 31 40-31 65 28 54 84-58 35-22-37v198H177V205l-22 37-58-35z"/>
      <path class="line" d="M216 95l-9 103 49 35 49-35-9-103M207 198l-18 148m116-148l18 148"/>
      <path class="accent" d="M224 137h64l17 61-49 35-49-35z"/>`
  },
  "heavy-armored-suit": {
    label: "Heavy Armored Suit",
    color: "#ff4fc8",
    shape: `<path class="plate" d="M125 147l77-56 54 35 54-35 77 56 24 112-55 15-19-63-17 194-64 28-64-28-17-194-19 63-55-15z"/>
      <path class="accent" d="M202 91l54 35 54-35 24 99-78 43-78-43z"/>
      <path class="line" d="M153 158l48 51 55 24 55-24 48-51M192 290h128M214 231l-14 169m98-169l14 169"/>`
  },
  "impact-jacket": {
    label: "Impact Jacket",
    color: "#25d9ff",
    shape: `<path class="plate" d="M155 123l63-30 38 36 38-36 63 30 43 91-57 29-22-45v199H191V198l-22 45-57-29z"/>
      <path class="line" d="M218 93l38 90 38-90M256 183v214M191 257h130"/>
      <path class="accent" d="M201 136l38 18-30 72-38-23zm110 0l-38 18 30 72 38-23z"/>`
  },
  "joint-reinforcement": {
    label: "Joint Reinforcement",
    color: "#ffc857",
    shape: `<g class="plate"><circle cx="171" cy="167" r="54"/><circle cx="341" cy="167" r="54"/>
      <circle cx="171" cy="345" r="54"/><circle cx="341" cy="345" r="54"/></g>
      <path class="line" d="M171 221v70m170-70v70M225 167h62M225 345h62"/>
      <path class="accent" d="M171 132l30 18v34l-30 18-30-18v-34zm170 0l30 18v34l-30 18-30-18v-34zm-170 178l30 18v34l-30 18-30-18v-34zm170 0l30 18v34l-30 18-30-18v-34z"/>`
  },
  "light-armored-suit": {
    label: "Light Armored Suit",
    color: "#b96cff",
    shape: `<path class="plate" d="M151 141l64-47 41 31 41-31 64 47 36 102-58 19-18-54-13 196-52 29-52-29-13-196-18 54-58-19z"/>
      <path class="line" d="M215 94l41 31 41-31 18 104-59 35-59-35zM204 276h104M226 232l-17 167m77-167l17 167"/>
      <path class="accent" d="M225 132h62l12 61-43 29-43-29z"/>`
  },
  "medium-armored-suit": {
    label: "Medium Armored Suit",
    color: "#b96cff",
    shape: `<path class="plate" d="M139 143l72-50 45 33 45-33 72 50 32 108-61 19-20-62-15 197-53 28-53-28-15-197-20 62-61-19z"/>
      <path class="accent" d="M211 93l45 33 45-33 22 105-67 38-67-38z"/>
      <path class="line" d="M167 162l45 50 44 24 44-24 45-50M198 281h116M222 235l-15 166m83-166l15 166"/>`
  },
  "ordinary-clothing": {
    label: "Ordinary Clothing",
    color: "#56e39f",
    shape: `<path class="plate" d="M155 128l66-34 35 34 35-34 66 34 51 88-55 34-28-45v194H187V205l-28 45-55-34z"/>
      <path class="line" d="M221 94l35 88 35-88M256 182v217M187 274h138"/>
      <path class="accent" d="M214 132l42 50 42-50-12 102h-60z"/>`
  },
  "plated-longcoat": {
    label: "Plated Longcoat",
    color: "#ff4fc8",
    shape: `<path class="plate" d="M158 118l64-30 34 38 34-38 64 30 37 93-55 26-21-47 32 238-91-38-91 38 32-238-21 47-55-26z"/>
      <path class="accent" d="M200 123l39 19-22 79-42-21zm112 0l-39 19 22 79 42-21z"/>
      <path class="line" d="M222 88l34 94 34-94M256 182v208M180 278h152"/>`
  },
  "reinforced-clothing": {
    label: "Reinforced Clothing",
    color: "#25d9ff",
    shape: `<path class="plate" d="M154 127l66-33 36 34 36-34 66 33 49 90-56 31-26-44v195H187V204l-26 44-56-31z"/>
      <path class="line" d="M220 94l36 88 36-88M256 182v217M187 273h138"/>
      <path class="accent" d="M205 145l51 37 51-37-13 101-38 24-38-24z"/>`
  },
  "reinforced-longcoat": {
    label: "Reinforced Longcoat",
    color: "#25d9ff",
    shape: `<path class="plate" d="M158 118l64-30 34 38 34-38 64 30 37 93-55 26-21-47 32 238-91-38-91 38 32-238-21 47-55-26z"/>
      <path class="line" d="M222 88l34 94 34-94M256 182v208M178 277h156"/>
      <path class="accent" d="M203 128l36 16-20 72-39-18zm106 0l-36 16 20 72 39-18z"/>`
  },
  "riot-shield": {
    label: "Riot Shield",
    color: "#ffc857",
    shape: `<path class="plate" d="M146 94h220l31 38-23 214-118 84-118-84-23-214z"/>
      <path class="line" d="M159 131h194l-17 188-80 58-80-58z"/>
      <path class="accent" d="M188 171h136v96H188z"/><path class="line" d="M209 219h94M256 172v95"/>`
  },
  "street-leathers": {
    label: "Street Leathers",
    color: "#56e39f",
    shape: `<path class="plate" d="M157 124l65-32 34 36 34-36 65 32 48 91-57 30-24-45v199H190V200l-24 45-57-30z"/>
      <path class="line" d="M222 92l34 90 34-90M256 182v217M190 273h132"/>
      <path class="accent" d="M194 139l45 22-20 67-42-19zm124 0l-45 22 20 67 42-19z"/>`
  },
  "war-harness": {
    label: "War Harness",
    color: "#ff4fc8",
    shape: `<path class="plate" d="M147 119l70-31 39 38 39-38 70 31 44 98-57 30-27-54-13 211-56 29-56-29-13-211-27 54-57-30z"/>
      <path class="line" d="M217 88l39 38 39-38 31 117-70 39-70-39zM198 278h116M221 242l-14 158m84-158l14 158"/>
      <path class="accent" d="M208 133h96l13 68-61 34-61-34z"/>`
  }
};

const render = ({ label, color, shape }) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-label="${label}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#101923"/><stop offset="1" stop-color="#030609"/>
    </linearGradient>
    <linearGradient id="armor" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#8594a3"/><stop offset=".38" stop-color="#26323d"/>
      <stop offset=".72" stop-color="#17212a"/><stop offset="1" stop-color="#090d12"/>
    </linearGradient>
    <radialGradient id="halo"><stop offset="0" stop-color="${color}" stop-opacity=".24"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <style>
      .plate{fill:url(#armor);stroke:${color};stroke-width:7;stroke-linejoin:round}
      .accent{fill:#0a1118;stroke:${color};stroke-width:6;stroke-linejoin:round}
      .line{fill:none;stroke:${color};stroke-width:5;stroke-linecap:round;stroke-linejoin:round;opacity:.78}
    </style>
  </defs>
  <rect width="512" height="512" rx="48" fill="url(#bg)"/>
  <circle cx="256" cy="256" r="208" fill="url(#halo)"/>
  <circle cx="256" cy="256" r="177" fill="none" stroke="${color}" stroke-width="3" opacity=".22"/>
  <circle cx="256" cy="256" r="133" fill="none" stroke="${color}" stroke-width="2" stroke-dasharray="12 18" opacity=".16"/>
  <path d="M79 65h354l14 14v354l-14 14H79l-14-14V79z" fill="none" stroke="${color}" stroke-width="9"/>
  <path d="M96 83h320M429 97v318M416 429H96M83 415V97" fill="none" stroke="${color}" stroke-width="2" opacity=".72"/>
  <g filter="url(#glow)">${shape}</g>
</svg>
`;

await fs.mkdir(outputRoot, { recursive: true });
for (const [slug, icon] of Object.entries(icons)) {
  await fs.writeFile(path.join(outputRoot, `${slug}.svg`), render(icon), "utf8");
}

console.log(`Generated ${Object.keys(icons).length} armor icons.`);
