import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const moduleRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const moduleRequire = createRequire(path.join(moduleRoot, "package.json"));
const YAML = moduleRequire("yaml");
const { compilePack, extractPack } = await import("@foundryvtt/foundryvtt-cli");
export const CYBERWARE_PACK_NAME = "cwn-cyberware";
export const EXPECTED_CYBERWARE_COUNT = 88;

const dataRoot = path.join(moduleRoot, "data", "cyberware");
const iconRoot = path.join(moduleRoot, "assets", "icons", "cyberware");
const sourcePack = path.join(moduleRoot, "src", "packs", CYBERWARE_PACK_NAME);
const outputPack = path.join(moduleRoot, "packs", CYBERWARE_PACK_NAME);
const verifyPack = path.join(moduleRoot, ".build", `verify-${CYBERWARE_PACK_NAME}`);
const categories = ["Body", "Head", "Skin", "Limb", "Nerve", "Sensory", "Medical", "None"];
const automationLevels = new Set([
  "native",
  "safe-active-effect",
  "combat-enhancements-handler",
  "contextual",
  "manual",
  "description-only-for-now"
]);
const concealmentTypes = new Set(["Sight", "Touch", "Medical"]);
const stableId = (prefix, value) =>
  `${prefix}${crypto.createHash("sha256").update(value).digest("hex")}`.slice(0, 16);
const stats = {
  compendiumSource: null,
  duplicateSource: null,
  exportSource: null,
  coreVersion: "13.351",
  systemId: "swnr",
  systemVersion: "2.3.0"
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
if (sources.length !== EXPECTED_CYBERWARE_COUNT) {
  throw new Error(`Expected ${EXPECTED_CYBERWARE_COUNT} cyberware sources, found ${sources.length}.`);
}

const keys = new Set();
const names = new Set();
const ids = new Set();
for (const source of sources) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(source.sourceKey) || keys.has(source.sourceKey)) {
    throw new Error(`Invalid or duplicate cyberware key "${source.sourceKey}".`);
  }
  keys.add(source.sourceKey);
  if (!source.name || names.has(source.name)) throw new Error(`Invalid or duplicate cyberware name "${source.name}".`);
  names.add(source.name);
  if (!categories.includes(source.category) || source.system?.type !== source.category) {
    throw new Error(`Cyberware "${source.name}" has invalid native category.`);
  }
  if (!Number.isFinite(source.system?.cost) || source.system.cost < 0) {
    throw new Error(`Cyberware "${source.name}" has invalid cost.`);
  }
  if (!Number.isFinite(source.system?.strain) || source.system.strain < 0) {
    throw new Error(`Cyberware "${source.name}" has invalid strain.`);
  }
  if (!Number.isInteger(source.system?.tl) || source.system.tl < 0) {
    throw new Error(`Cyberware "${source.name}" has invalid tech level.`);
  }
  if (!concealmentTypes.has(source.system?.concealment)) {
    throw new Error(`Cyberware "${source.name}" has invalid concealment.`);
  }
  if (!automationLevels.has(source.automationLevel)) {
    throw new Error(`Cyberware "${source.name}" is not classified.`);
  }
  if (source.maintenanceRequired !== true) {
    throw new Error(`Cyberware "${source.name}" is missing maintenance metadata.`);
  }
  await fs.access(path.join(iconRoot, `${source.sourceKey}.svg`));
  const id = stableId("C", `cwn-cyberware:${source.sourceKey}`);
  if (ids.has(id)) throw new Error(`Duplicate deterministic cyberware ID "${id}".`);
  ids.add(id);
}

await fs.rm(sourcePack, { recursive: true, force: true });
await fs.rm(outputPack, { recursive: true, force: true });
await fs.mkdir(sourcePack, { recursive: true });
const folderIds = new Map();
for (const [index, category] of categories.entries()) {
  const key = category.toLowerCase();
  const id = stableId("D", `cwn-cyberware-folder:${key}`);
  folderIds.set(category, id);
  await fs.writeFile(path.join(sourcePack, `folder-${id}.yml`), YAML.stringify({
    type: "Item",
    folder: null,
    name: category === "None" ? "General" : category,
    color: null,
    sorting: "a",
    _id: id,
    description: "",
    sort: (index + 1) * 100000,
    flags: {},
    _stats: stats,
    _key: `!folders!${id}`
  }), "utf8");
}

for (const [index, source] of sources.entries()) {
  const id = stableId("C", `cwn-cyberware:${source.sourceKey}`);
  const item = {
    name: source.name,
    type: "cyberware",
    img: `modules/cwn-content-pack/assets/icons/cyberware/${source.sourceKey}.svg`,
    folder: folderIds.get(source.category),
    flags: {
      "cwn-content-pack": {
        catalogueKey: source.sourceKey,
        provenance: source.provenance,
        cyberware: {
          key: source.sourceKey,
          sourceType: "official-catalogue",
          category: source.category.toLowerCase(),
          automationLevel: source.automationLevel
        },
        cyberwareMaintenance: {
          required: true,
          baseCostOverride: null
        }
      }
    },
    system: {
      description: `<p>${escapeHtml(source.description)}</p>`,
      favorite: false,
      modDesc: null,
      condition: "perfect",
      gmNotes: null,
      showGMNotes: false,
      tl: source.system.tl,
      cost: source.system.cost,
      strain: source.system.strain,
      disabled: false,
      effect: source.system.effect,
      type: source.system.type,
      concealment: source.system.concealment,
      complication: source.system.complication
    },
    effects: [],
    ownership: { default: 0 },
    _id: id,
    sort: (index + 1) * 1000,
    _stats: stats,
    _key: `!items!${id}`
  };
  await fs.writeFile(path.join(sourcePack, `${source.sourceKey}.yml`), YAML.stringify(item), "utf8");
}

await compilePack(sourcePack, outputPack, { yaml: true, log: true });
let itemCount = 0;
let folderCount = 0;
const compiledFolders = new Set();
const compiledItems = [];
await fs.rm(verifyPack, { recursive: true, force: true });
await extractPack(outputPack, verifyPack, {
  yaml: true,
  log: false,
  transformEntry: async (entry) => {
    if (entry.type === "cyberware") {
      itemCount += 1;
      compiledItems.push(entry);
    } else if (entry.type === "Item") {
      folderCount += 1;
      compiledFolders.add(entry._id);
    }
    return entry;
  }
});
await fs.rm(verifyPack, { recursive: true, force: true });
if (itemCount !== EXPECTED_CYBERWARE_COUNT || folderCount !== categories.length) {
  throw new Error(`Compiled cyberware count mismatch: ${itemCount} items, ${folderCount} folders.`);
}
for (const item of compiledItems) {
  if (!compiledFolders.has(item.folder)) throw new Error(`Unresolved folder for "${item.name}".`);
}
console.log(`Built and verified ${itemCount} cyberware items in ${folderCount} folders.`);
