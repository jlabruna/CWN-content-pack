import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const moduleRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const moduleRequire = createRequire(path.join(moduleRoot, "package.json"));
const YAML = moduleRequire("yaml");
const { compilePack, extractPack } = await import("@foundryvtt/foundryvtt-cli");

export const DRONE_PACK_NAME = "cwn-drones";
export const EXPECTED_DRONE_COUNT = 9;

const dataRoot = path.join(moduleRoot, "data", "drones");
const sourcePack = path.join(moduleRoot, "src", "packs", DRONE_PACK_NAME);
const outputPack = path.join(moduleRoot, "packs", DRONE_PACK_NAME);
const verifyPack = path.join(moduleRoot, ".build", `verify-${DRONE_PACK_NAME}`);
const stats = {
  compendiumSource: null,
  duplicateSource: null,
  exportSource: null,
  coreVersion: "13.351",
  systemId: "swnr",
  systemVersion: "2.3.1"
};
const escapeHtml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;");

const sources = [];
for (const filename of (await fs.readdir(dataRoot)).filter((name) => name.endsWith(".json")).sort()) {
  const source = JSON.parse(await fs.readFile(path.join(dataRoot, filename), "utf8"));
  if (filename !== `${source.sourceKey}.json`) throw new Error(`Source filename mismatch: ${filename}.`);
  sources.push(source);
}
if (sources.length !== EXPECTED_DRONE_COUNT) {
  throw new Error(`Expected ${EXPECTED_DRONE_COUNT} drone sources, found ${sources.length}.`);
}
const actorIds = new Set();
for (const source of sources) {
  if (!/^[A-Za-z0-9]{16}$/.test(source.actorId ?? "")) {
    throw new Error(`Drone "${source.name}" has invalid preserved Actor ID "${source.actorId ?? ""}".`);
  }
  if (actorIds.has(source.actorId)) {
    throw new Error(`Duplicate preserved drone Actor ID "${source.actorId}".`);
  }
  actorIds.add(source.actorId);
}

await fs.rm(sourcePack, { recursive: true, force: true });
await fs.rm(outputPack, { recursive: true, force: true });
await fs.mkdir(sourcePack, { recursive: true });

for (const [index, source] of sources.entries()) {
  const id = source.actorId;
  const tokenPath = `modules/cwn-content-pack/assets/tokens/drones/${source.sourceKey}.webp`;
  const actor = {
    name: source.name,
    type: "drone",
    img: tokenPath,
    folder: null,
    flags: {
      "cwn-content-pack": {
        catalogueKey: source.sourceKey,
        manufacturer: source.manufacturer,
        model: source.model,
        portable: source.encumbrance < 99,
        provenance: "Original CWN Content Pack catalogue entry and token artwork."
      }
    },
    system: {
      ac: source.ac,
      cost: source.cost,
      description: `<p>${escapeHtml(source.description)}</p>`,
      enc: source.encumbrance,
      fittings: { max: source.fittings, value: source.fittings },
      health: { max: source.hp, value: source.hp },
      moveType: source.moveType,
      speed: source.speed,
      traumaTarget: source.traumaTarget,
      armor: { value: 1, max: 1 },
      crew: { min: 1, current: 1, max: 1 },
      crewMembers: [],
      tl: 5,
      mods: "",
      power: { value: 1, max: 1 },
      mass: { value: 1, max: 1 },
      hardpoints: { value: source.hardpoints, max: source.hardpoints },
      range: "",
      model: "custom",
      customModel: source.model
    },
    effects: [],
    items: [],
    prototypeToken: {
      name: source.model,
      displayName: 30,
      actorLink: false,
      appendNumber: false,
      prependAdjective: false,
      width: 1,
      height: 1,
      texture: {
        src: tokenPath,
        anchorX: 0.5,
        anchorY: 0.5,
        offsetX: 0,
        offsetY: 0,
        fit: "contain",
        scaleX: source.tokenScale,
        scaleY: source.tokenScale,
        rotation: 0,
        tint: "#ffffff",
        alphaThreshold: 0.75
      },
      lockRotation: false,
      rotation: 0,
      alpha: 1,
      disposition: 1,
      displayBars: 0,
      bar1: { attribute: "health" },
      bar2: { attribute: "power" },
      light: {
        negative: false,
        priority: 0,
        alpha: 0.5,
        angle: 360,
        bright: 0,
        color: null,
        coloration: 1,
        dim: 0,
        attenuation: 0.5,
        luminosity: 0.5,
        saturation: 0,
        contrast: 0,
        shadows: 0,
        animation: { type: null, speed: 5, intensity: 5, reverse: false },
        darkness: { min: 0, max: 1 }
      },
      sight: {
        enabled: true,
        range: 0,
        angle: 360,
        visionMode: "basic",
        color: null,
        attenuation: 0.1,
        brightness: 0,
        saturation: 0,
        contrast: 0
      },
      detectionModes: [],
      occludable: { radius: 0 },
      ring: {
        enabled: false,
        colors: { ring: null, background: null },
        effects: 1,
        subject: { scale: 1, texture: null }
      },
      flags: {},
      randomImg: false,
      turnMarker: { mode: 1, animation: null, src: null, disposition: false },
      movementAction: null
    },
    ownership: { default: 0 },
    _id: id,
    sort: (index + 1) * 1000,
    _stats: stats,
    _key: `!actors!${id}`
  };
  await fs.writeFile(path.join(sourcePack, `${source.sourceKey}.yml`), YAML.stringify(actor), "utf8");
}

await compilePack(sourcePack, outputPack, { yaml: true, log: true });
let actorCount = 0;
const compiledActors = [];
await fs.rm(verifyPack, { recursive: true, force: true });
await extractPack(outputPack, verifyPack, {
  yaml: true,
  log: false,
  transformEntry: async (entry) => {
    if (entry.type === "drone") {
      actorCount += 1;
      compiledActors.push(entry);
    }
    return entry;
  }
});
await fs.rm(verifyPack, { recursive: true, force: true });
if (actorCount !== EXPECTED_DRONE_COUNT) {
  throw new Error(`Compiled drone count mismatch: expected ${EXPECTED_DRONE_COUNT}, found ${actorCount}.`);
}
for (const actor of compiledActors) {
  if (actor.items?.length || actor.effects?.length) {
    throw new Error(`Drone "${actor.name}" unexpectedly contains Items or Active Effects.`);
  }
  if (actor.prototypeToken?.sight?.enabled !== true || actor.prototypeToken?.disposition !== 1) {
    throw new Error(`Drone "${actor.name}" has invalid prototype-token defaults.`);
  }
  if (
    actor.prototypeToken?.texture?.scaleX !== actor.prototypeToken?.texture?.scaleY
    || !(actor.prototypeToken.texture.scaleX >= 0.6 && actor.prototypeToken.texture.scaleX <= 1)
  ) {
    throw new Error(`Drone "${actor.name}" has an invalid prototype-token scale.`);
  }
}
console.log(`Built and verified ${actorCount} native SWNR drone Actors.`);
