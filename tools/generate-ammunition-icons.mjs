import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const moduleRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = path.join(moduleRoot, "assets", "icons", "ammunition");

const icons = {
  arrows: {
    label: "Arrows",
    color: "#91bd63",
    shape: `<path class="body" d="M151 143h210l-24 253H175z"/>
      <path class="accent" d="M137 123h238l-14 58H151z"/>
      <path class="detail" d="M183 181l14 207M225 181l8 207M287 181l-8 207M329 181l-14 207"/>
      <path class="round" d="M177 152l-26-66 42 25 18-51 16 78zm66 0l-18-83 35 35 29-47 2 81zm72 0l11-82 26 47 39-31-24 66z"/>`
  },
  "light-pistol-magazine": {
    label: "Light Pistol Magazine",
    color: "#5ee7ff",
    shape: `<path class="body" d="M194 118h124l-8 274-108 18z"/>
      <path class="detail" d="M208 157h94M207 206h93M205 255h93M204 304h92"/>
      <path class="accent" d="M194 118h124v45H194z"/>`
  },
  "heavy-pistol-magazine": {
    label: "Heavy Pistol Magazine",
    color: "#ffb347",
    shape: `<path class="body" d="M174 112h164l-14 282-136 20z"/>
      <path class="detail" d="M194 170h124M191 232h124M188 294h124"/>
      <path class="accent" d="M174 112h164v54H174z"/>`
  },
  "rifle-magazine": {
    label: "Rifle Magazine",
    color: "#92f59b",
    shape: `<path class="body" d="M168 119h151l34 70-23 196-132 33-28-183z"/>
      <path class="detail" d="M187 181l132 8M192 238l134-5M201 296l119-18"/>
      <path class="accent" d="M168 119h151l22 45-161 9z"/>`
  },
  "combat-rifle-magazine": {
    label: "Combat Rifle Magazine",
    color: "#00d6ff",
    shape: `<path class="body" d="M158 111h173l32 72c-6 117-55 192-150 226l-38-168z"/>
      <path class="detail" d="M181 180l151 5M184 237l139 3M196 292l111-2M216 344l67-13"/>
      <path class="accent" d="M158 111h173l22 50-181 5z"/>`
  },
  "submachine-gun-magazine": {
    label: "Submachine Gun Magazine",
    color: "#d479ff",
    shape: `<path class="body" d="M205 98h102l8 303-118 13z"/>
      <path class="detail" d="M213 155h92M211 216h96M209 277h99M207 338h103"/>
      <path class="accent" d="M205 98h102v55H205z"/>`
  },
  "shotgun-reload": {
    label: "Shotgun Reload",
    color: "#ff5f6d",
    shape: `<g transform="rotate(-13 205 260)"><path class="body" d="M155 111h92v276l-46 31-46-31z"/>
      <path class="accent" d="M155 111h92v77h-92z"/><path class="detail" d="M171 231h60M171 282h60"/></g>
      <g transform="rotate(13 307 260)"><path class="body" d="M265 111h92v276l-46 31-46-31z"/>
      <path class="accent" d="M265 111h92v77h-92z"/><path class="detail" d="M281 231h60M281 282h60"/></g>`
  },
  "semi-auto-shotgun-magazine": {
    label: "Semi-Auto Shotgun Magazine",
    color: "#ff7d8a",
    shape: `<path class="body" d="M166 122h180v258l-90 38-90-38z"/>
      <path class="detail" d="M186 190h140M186 246h140M186 302h140"/>
      <path class="accent" d="M166 122h180v52H166z"/>`
  },
  "combat-shotgun-magazine": {
    label: "Combat Shotgun Magazine",
    color: "#ff3fa4",
    shape: `<circle class="body" cx="256" cy="267" r="143"/>
      <circle class="detail" cx="256" cy="267" r="77"/>
      <path class="detail" d="M256 124v66M256 344v66M113 267h66M333 267h66M155 166l47 47M310 321l47 47M357 166l-47 47M202 321l-47 47"/>
      <path class="accent" d="M205 91h102l22 64-73 35-73-35z"/>`
  },
  "sniper-rifle-round": {
    label: "Sniper Rifle Round",
    color: "#b9ff66",
    shape: `<path class="body" d="M223 100h66l23 72v168l-56 87-56-87V172z"/>
      <path class="accent" d="M223 100h66l23 72H200z"/>
      <path class="detail" d="M200 213h112M200 275h112M212 340h88"/>`
  },
  "automatic-rifle-ammunition-box": {
    label: "Automatic Rifle Ammunition Box",
    color: "#ffd166",
    shape: `<path class="body" d="M123 184h266v209H123z"/>
      <path class="accent" d="M105 145h302v65H105z"/>
      <path class="detail" d="M163 245h186v87H163zM193 145v-34h126v34"/>
      <path class="round" d="M127 116l30-35 33 24-30 35zm58-18l30-35 33 24-30 35zm58-18l30-35 33 24-30 35zm58 18l30-35 33 24-30 35"/>`
  },
  "heavy-machine-gun-ammunition-box": {
    label: "Heavy Machine Gun Ammunition Box",
    color: "#ff9f1c",
    shape: `<path class="body" d="M92 178h328v230H92z"/>
      <path class="accent" d="M75 130h362v82H75z"/>
      <path class="detail" d="M137 245h238v106H137zM173 130V91h166v39M256 245v106"/>
      <path class="round" d="M92 99l34-48 39 24-34 48zm72-18l34-48 39 24-34 48zm72-18l34-48 39 24-34 48zm72 18l34-48 39 24-34 48"/>`
  },
  "mortar-round": {
    label: "Mortar Round",
    color: "#79f2c0",
    shape: `<path class="body" d="M217 92h78l30 70-19 142-50 54-50-54-19-142z"/>
      <path class="accent" d="M206 304h100l43 102-93-39-93 39z"/>
      <path class="detail" d="M205 160h102M211 215h90M256 92v266"/>`
  },
  "anti-materiel-rifle-magazine": {
    label: "Anti-Materiel Rifle Magazine",
    color: "#ff6b35",
    shape: `<path class="body" d="M148 135h216l-29 253-158 31z"/>
      <path class="detail" d="M178 204h154M172 273h152M165 342h151"/>
      <path class="accent" d="M148 135h216v57H148z"/>
      <path class="round" d="M180 124V70l19-36 19 36v54zm57 0V70l19-36 19 36v54zm57 0V70l19-36 19 36v54z"/>`
  },
  "taser-pistol-charge-pack": {
    label: "Taser Pistol Charge Pack",
    color: "#b96cff",
    shape: `<path class="body" d="M157 126h198l35 61v201H122V187z"/>
      <path class="accent" d="M201 91h110v70H201z"/>
      <path class="detail" d="M188 232h65l-31 61h62l-84 105 23-77h-58zM282 211h50v44h-50z"/>`
  }
};

const render = ({ label, color, shape }) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-labelledby="title">
  <title id="title">${label}</title>
  <defs>
    <linearGradient id="metal" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#566574"/><stop offset=".45" stop-color="#202b35"/>
      <stop offset="1" stop-color="#090d12"/>
    </linearGradient>
    <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="4" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <style>
      .body{fill:url(#metal);stroke:${color};stroke-width:8;stroke-linejoin:round}
      .accent{fill:#0b1118;stroke:${color};stroke-width:7;stroke-linejoin:round}
      .detail{fill:none;stroke:${color};stroke-width:6;stroke-linecap:round;stroke-linejoin:round;opacity:.82}
      .round{fill:#1c2630;stroke:${color};stroke-width:6;stroke-linejoin:round}
    </style>
  </defs>
  <path d="M72 56h368l16 16v368l-16 16H72l-16-16V72z" fill="none" stroke="${color}" stroke-width="7" opacity=".75"/>
  <path d="M94 76h324M436 96v320M418 436H94M76 416V96" fill="none" stroke="${color}" stroke-width="2" opacity=".45"/>
  <g filter="url(#glow)">${shape}</g>
</svg>
`;

await fs.mkdir(outputRoot, { recursive: true });
for (const [sourceKey, icon] of Object.entries(icons)) {
  await fs.writeFile(path.join(outputRoot, `${sourceKey}.svg`), render(icon), "utf8");
}

console.log(`Generated ${Object.keys(icons).length} original ammunition SVG icons.`);
