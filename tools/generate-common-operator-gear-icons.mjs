import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const moduleRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = path.join(
  moduleRoot,
  "assets",
  "icons",
  "gear",
  "common-operator-gear"
);

const icons = Object.freeze({
  "active-hearing-protection": ["#49d6ff", '<path d="M142 275v-55c0-70 51-120 114-120s114 50 114 120v55"/><rect x="115" y="245" width="62" height="118" rx="25"/><rect x="335" y="245" width="62" height="118" rx="25"/><path d="M177 326c28 45 58 66 96 66h42"/>'],
  "gas-mask": ["#72e0a4", '<path d="M154 175l102-55 102 55-17 142-85 75-85-75z"/><circle cx="211" cy="233" r="29"/><circle cx="301" cy="233" r="29"/><path d="M219 315h74m-60-39h46v77h-46z"/>'],
  "anti-flash-goggles": ["#ffcc4d", '<path d="M104 226h80l34 58H116zM328 226h80l-12 58h-102z"/><path d="M218 253h76m-190-27 30-57m274 57-30-57"/>'],
  "ir-goggles": ["#ff5b9a", '<path d="M104 226h80l34 58H116zM328 226h80l-12 58h-102z"/><path d="M218 253h76"/><circle cx="168" cy="255" r="15"/><circle cx="344" cy="255" r="15"/><path d="M256 120v58m-29-29h58"/>'],
  backpack: ["#59d5e0", '<path d="M159 186c0-45 35-80 97-80s97 35 97 80"/><rect x="126" y="171" width="260" height="236" rx="48"/><path d="M183 171v236m146-236v236M177 264h158v102H177z"/>'],
  "gear-harness": ["#f7a35c", '<path d="M154 119l102 77 102-77 51 72-81 211H184l-81-211z"/><path d="M185 164l71 238 71-238M132 270h248"/>'],
  "ordinary-clothing": ["#9eb7cc", '<path d="M187 120l69 38 69-38 77 65-52 68-30-24v170H192V229l-30 24-52-68z"/>'],
  "fashionable-clothing": ["#b486ff", '<path d="M187 120l69 38 69-38 77 65-52 68-30-24v170H192V229l-30 24-52-68z"/><path d="M256 158v241m-38-151 38 25 38-25"/>'],
  "haute-couture-clothing": ["#ff7ac8", '<path d="M196 111l60 47 60-47 94 93-61 56-28-31 35 171H156l35-171-28 31-61-56z"/><path d="M256 158l-31 88 31 42 31-42z"/>'],
  binoculars: ["#58c4dd", '<path d="M153 178h74v72h58v-72h74l54 176h-107l-50-78-50 78H99z"/><circle cx="163" cy="325" r="42"/><circle cx="349" cy="325" r="42"/>'],
  "climbing-kit": ["#78d68b", '<path d="M150 374l89-232c12-31 48-31 60 0l63 164"/><circle cx="344" cy="342" r="54"/><path d="M344 288v108m-54-54h108M125 374h148"/>'],
  "basic-tools-kit": ["#f1bd55", '<rect x="111" y="201" width="290" height="188" rx="24"/><path d="M191 201v-48h130v48M111 271h290"/><path d="M222 248h68v48h-68z"/>'],
  "cyberdoc-kit": ["#ff5f72", '<rect x="111" y="201" width="290" height="188" rx="24"/><path d="M191 201v-48h130v48M256 242v107m-54-54h108"/><path d="M140 389l-24 42m256-42 24 42"/>'],
  medkit: ["#ff6b6b", '<rect x="118" y="161" width="276" height="236" rx="30"/><path d="M191 161v-51h130v51M256 213v132m-66-66h132"/>'],
  "survival-kit": ["#75c26b", '<rect x="118" y="161" width="276" height="236" rx="30"/><path d="M191 161v-51h130v51M167 337l53-88 42 62 30-42 53 68z"/><circle cx="323" cy="225" r="24"/>'],
  lockpicks: ["#c6a0ff", '<path d="M128 348c64-13 93-51 116-112l35-91"/><path d="M246 348c51-21 73-65 78-133l5-81"/><circle cx="125" cy="350" r="25"/><path d="M279 145l58 25m-8-36 49 33"/>'],
  "wearable-light": ["#ffe066", '<path d="M187 152h138l47 76-47 76H187l-47-76z"/><circle cx="256" cy="228" r="48"/><path d="M256 103V65m0 326v56M393 228h54M65 228h54m234-97 38-38m-232 38-38-38"/>'],
  "portable-video-camera": ["#57d3ff", '<rect x="104" y="177" width="252" height="177" rx="28"/><path d="M356 225l75-42v165l-75-42z"/><circle cx="224" cy="266" r="57"/><path d="M151 177l28-61h120l28 61"/>'],
  "handheld-radio": ["#5fd3a2", '<rect x="158" y="153" width="196" height="255" rx="26"/><path d="M199 153l-13-90m109 90 31-72"/><rect x="193" y="194" width="126" height="72" rx="10"/><circle cx="215" cy="323" r="19"/><path d="M259 311h60m-60 31h60"/>'],
  "ultralight-radio-tab": ["#55e6d0", '<path d="M151 203c0-71 49-123 105-123s105 52 105 123"/><path d="M151 203v72c0 69 45 119 105 119s105-50 105-119v-72"/><path d="M361 282h56v67h-56m-105 45v48"/>'],
  "basic-smartphone": ["#78a8ff", '<rect x="159" y="79" width="194" height="354" rx="30"/><rect x="181" y="127" width="150" height="235" rx="8"/><circle cx="256" cy="397" r="14"/><path d="M228 104h56"/>'],
  "fashionable-smartphone": ["#ff78d1", '<path d="M178 78h156l38 51-38 305H178l-38-305z"/><rect x="181" y="137" width="150" height="221" rx="22"/><path d="M218 107h76M219 398h74"/>'],
  "cheap-vr-crown": ["#a979ff", '<path d="M104 191h304l-27 153H131z"/><path d="M104 213L66 250m342-37 38 37"/><circle cx="193" cy="266" r="41"/><circle cx="319" cy="266" r="41"/><path d="M234 266h44"/>'],
  "monthly-bus-pass": ["#64c7ff", '<rect x="105" y="143" width="302" height="226" rx="26"/><path d="M105 219h302M159 181h92"/><circle cx="168" cy="300" r="36"/><path d="M242 281h112m-112 39h78"/>'],
  "smartphone-service-plan-one-month": ["#50d4c8", '<rect x="160" y="75" width="192" height="362" rx="31"/><path d="M194 325c41-48 83-48 124 0M214 284c28-31 56-31 84 0M238 245c12-13 24-13 36 0"/><circle cx="256" cy="387" r="13"/>'],
  "military-ration": ["#9ec66b", '<path d="M126 163l130-58 130 58-28 237H154z"/><path d="M126 163h260M177 233h158M193 293h126"/><circle cx="256" cy="349" r="25"/>'],
  "military-ration-with-water": ["#55c8e8", '<path d="M102 175l101-45 101 45-22 211H124z"/><path d="M102 175h202M143 244h120"/><path d="M361 134c0 0-62 75-62 132a62 62 0 00124 0c0-57-62-132-62-132z"/>']
});

const svgFor = (sourceKey, accent, glyph) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-labelledby="title">
  <title>${sourceKey}</title>
  <g fill="none" stroke="${accent}" stroke-width="18" stroke-linecap="round" stroke-linejoin="round">
    <path opacity=".45" d="M256 40 435 143v226L256 472 77 369V143z"/>
    ${glyph}
  </g>
</svg>
`;

await fs.rm(outputRoot, { recursive: true, force: true });
await fs.mkdir(outputRoot, { recursive: true });
for (const [sourceKey, [accent, glyph]] of Object.entries(icons)) {
  await fs.writeFile(
    path.join(outputRoot, `${sourceKey}.svg`),
    svgFor(sourceKey, accent, glyph),
    "utf8"
  );
}

if (Object.keys(icons).length !== 27) {
  throw new Error(`Expected 27 Common Operator Gear icon definitions.`);
}
console.log(`Generated ${Object.keys(icons).length} original Common Operator Gear SVG icons.`);
