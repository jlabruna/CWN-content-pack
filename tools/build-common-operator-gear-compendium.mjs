import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const moduleRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const moduleRequire = createRequire(path.join(moduleRoot, "package.json"));
const YAML = moduleRequire("yaml");
const { compilePack, extractPack } = await import("@foundryvtt/foundryvtt-cli");

export const GEAR_PACK_NAME = "cwn-common-operator-gear";
export const EXPECTED_GEAR_ITEM_COUNT = 27;

const sourceRoot = path.join(moduleRoot, "data", "gear", "common-operator-gear");
const iconRoot = path.join(moduleRoot, "assets", "icons", "gear", "common-operator-gear");
const sourcePack = path.join(moduleRoot, "src", "packs", GEAR_PACK_NAME);
const outputPack = path.join(moduleRoot, "packs", GEAR_PACK_NAME);
const verificationPack = path.join(moduleRoot, ".build", `verify-${GEAR_PACK_NAME}`);

export const GEAR_FOLDER_DEFINITIONS = Object.freeze({
  "protective-gear": Object.freeze({ name: "Protective Gear", sort: 100000 }),
  "carry-gear-and-clothing": Object.freeze({
    name: "Carry and Clothing",
    sort: 200000
  }),
  "tools-and-field-kits": Object.freeze({
    name: "Tools and Field Gear",
    sort: 300000
  }),
  "personal-electronics": Object.freeze({
    name: "Electronics",
    sort: 400000
  }),
  "services-and-consumables": Object.freeze({
    name: "Services and Supplies",
    sort: 500000
  })
});

const manifest = Object.freeze({
  "active-hearing-protection": ["Active Hearing Protection", "protective-gear", 250, 1, false, 0],
  "gas-mask": ["Gas Mask", "protective-gear", 1000, 1, false, 0],
  "anti-flash-goggles": ["Anti-Flash Goggles", "protective-gear", 100, 1, false, 0],
  "ir-goggles": ["IR Goggles", "protective-gear", 1000, 1, false, 0],
  backpack: ["Backpack", "carry-gear-and-clothing", 25, 1, true, 6],
  "gear-harness": ["Gear Harness", "carry-gear-and-clothing", 25, 1, true, 4],
  "ordinary-clothing": ["Ordinary Clothing", "carry-gear-and-clothing", 25, 1, true, 0],
  "fashionable-clothing": ["Fashionable Clothing", "carry-gear-and-clothing", 500, 1, true, 0],
  "haute-couture-clothing": ["Haute Couture Clothing", "carry-gear-and-clothing", 10000, 1, true, 0],
  binoculars: ["Binoculars", "tools-and-field-kits", 100, 1, false, 0],
  "climbing-kit": ["Climbing Kit", "tools-and-field-kits", 150, 2, false, 0],
  "basic-tools-kit": ["Basic Tools Kit", "tools-and-field-kits", 100, 2, false, 0],
  "cyberdoc-kit": ["Cyberdoc Kit", "tools-and-field-kits", 500, 2, false, 0],
  medkit: ["Medkit", "tools-and-field-kits", 100, 1, false, 0],
  "survival-kit": ["Survival Kit", "tools-and-field-kits", 100, 2, false, 0],
  lockpicks: ["Lockpicks", "tools-and-field-kits", 100, 1, false, 0],
  "wearable-light": ["Wearable Light", "tools-and-field-kits", 25, 1, true, 0],
  "portable-video-camera": ["Portable Video Camera", "personal-electronics", 300, 1, false, 0],
  "handheld-radio": ["Handheld Radio", "personal-electronics", 50, 1, false, 0],
  "ultralight-radio-tab": ["Ultralight Radio Tab", "personal-electronics", 500, 0, false, 0],
  "basic-smartphone": ["Basic Smartphone", "personal-electronics", 50, 0, false, 0],
  "fashionable-smartphone": ["Fashionable Smartphone", "personal-electronics", 2000, 0, false, 0],
  "cheap-vr-crown": ["Cheap VR Crown", "personal-electronics", 50, 1, false, 0],
  "monthly-bus-pass": ["Monthly Bus Pass", "services-and-consumables", 50, 0, false, 0],
  "smartphone-service-plan-one-month": [
    "Smartphone Service Plan — One Month",
    "services-and-consumables",
    10,
    0,
    false,
    0
  ],
  "military-ration": ["Military Ration", "services-and-consumables", 20, 1, false, 0],
  "military-ration-with-water": [
    "Military Ration with Water",
    "services-and-consumables",
    20,
    2,
    false,
    0
  ]
});

const stableId = (prefix, value) => {
  const digest = crypto.createHash("sha256").update(value).digest("hex");
  return `${prefix}${digest}`.slice(0, 16);
};

const assertFoundryId = (id, label) => {
  if (!/^[A-Za-z0-9]{16}$/.test(id)) {
    throw new Error(`${label} has invalid Foundry ID "${id}".`);
  }
};

const cleanStats = {
  compendiumSource: null,
  duplicateSource: null,
  exportSource: null,
  coreVersion: "13.351",
  systemId: "swnr",
  systemVersion: "2.3.0"
};

const escapeHtml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

const readSources = async () => {
  const filenames = (await fs.readdir(sourceRoot))
    .filter((filename) => filename.endsWith(".json"))
    .sort();
  const sources = [];
  for (const filename of filenames) {
    let source;
    try {
      source = JSON.parse(await fs.readFile(path.join(sourceRoot, filename), "utf8"));
    } catch (error) {
      throw new Error(`Malformed gear source JSON "${filename}": ${error.message}`);
    }
    if (filename !== `${source.sourceKey}.json`) {
      throw new Error(
        `Gear source "${filename}" must match sourceKey "${source.sourceKey ?? ""}".`
      );
    }
    sources.push(source);
  }
  return sources;
};

const validateSources = async (sources) => {
  if (sources.length !== EXPECTED_GEAR_ITEM_COUNT) {
    throw new Error(
      `Expected ${EXPECTED_GEAR_ITEM_COUNT} gear sources but found ${sources.length}.`
    );
  }

  const expectedKeys = new Set(Object.keys(manifest));
  const sourceKeys = new Set();
  const names = new Set();
  const ids = new Set();
  for (const source of sources) {
    if (typeof source.sourceKey !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(source.sourceKey)) {
      throw new Error(`Invalid gear sourceKey "${source.sourceKey ?? ""}".`);
    }
    if (!expectedKeys.has(source.sourceKey)) {
      throw new Error(`Unexpected Common Operator Gear source "${source.sourceKey}".`);
    }
    if (sourceKeys.has(source.sourceKey)) {
      throw new Error(`Duplicate Common Operator Gear sourceKey "${source.sourceKey}".`);
    }
    sourceKeys.add(source.sourceKey);

    const [name, folderKey, cost, encumbrance, noEncReadied, capacity] =
      manifest[source.sourceKey];
    if (source.name !== name) {
      throw new Error(`Gear "${source.sourceKey}" must be named "${name}".`);
    }
    if (names.has(source.name)) {
      throw new Error(`Duplicate Common Operator Gear name "${source.name}".`);
    }
    names.add(source.name);
    if (source.folderKey !== folderKey || !GEAR_FOLDER_DEFINITIONS[folderKey]) {
      throw new Error(`Gear "${source.name}" has unresolved folder "${source.folderKey}".`);
    }
    if (
      source.system?.cost !== cost
      || source.system?.encumbrance !== encumbrance
      || source.system?.noEncReadied !== noEncReadied
    ) {
      throw new Error(`Gear "${source.name}" does not match the approved manifest fields.`);
    }
    if (
      typeof source.description !== "string"
      || source.description.trim() === ""
      || typeof source.provenance !== "string"
      || source.provenance.trim() === ""
      || typeof source.sourceName !== "string"
      || source.sourceName.trim() === ""
    ) {
      throw new Error(`Gear "${source.name}" is missing description or provenance data.`);
    }
    if (/^Ammunition(?:,|$)/i.test(source.name)) {
      throw new Error(`Generic ammunition row "${source.name}" is excluded from this pack.`);
    }

    const container = source.system.container;
    if (capacity > 0) {
      if (
        container?.isContainer !== true
        || container?.isOpen !== true
        || container?.capacity?.max !== capacity
        || container?.capacity?.value !== 0
      ) {
        throw new Error(`Container gear "${source.name}" has invalid native capacity data.`);
      }
    } else if (container?.isContainer === true) {
      throw new Error(`Non-container gear "${source.name}" cannot enable Is Container.`);
    }

    const iconPath = path.join(iconRoot, `${source.sourceKey}.svg`);
    try {
      await fs.access(iconPath);
    } catch {
      throw new Error(`Missing original gear icon for "${source.name}".`);
    }

    const id = stableId("G", `common-operator-gear:${source.sourceKey}`);
    assertFoundryId(id, `Gear "${source.name}"`);
    if (ids.has(id)) {
      throw new Error(`Duplicate generated Common Operator Gear ID "${id}".`);
    }
    ids.add(id);
  }

  for (const expectedKey of expectedKeys) {
    if (!sourceKeys.has(expectedKey)) {
      throw new Error(`Missing Common Operator Gear source "${expectedKey}".`);
    }
  }
};

await fs.rm(sourcePack, { recursive: true, force: true });
await fs.rm(outputPack, { recursive: true, force: true });
await fs.mkdir(sourcePack, { recursive: true });

const sources = await readSources();
await validateSources(sources);

const folderIds = new Map();
for (const [folderKey, folder] of Object.entries(GEAR_FOLDER_DEFINITIONS)) {
  const id = stableId("D", `common-operator-gear-folder:${folderKey}`);
  assertFoundryId(id, `Common Operator Gear folder "${folder.name}"`);
  folderIds.set(folderKey, id);
  const document = {
    type: "Item",
    folder: null,
    name: folder.name,
    color: null,
    sorting: "a",
    _id: id,
    description: "",
    sort: folder.sort,
    flags: {},
    _stats: cleanStats,
    _key: `!folders!${id}`
  };
  await fs.writeFile(
    path.join(sourcePack, `folder-${id}.yml`),
    YAML.stringify(document),
    "utf8"
  );
}

for (const [index, source] of sources.entries()) {
  const id = stableId("G", `common-operator-gear:${source.sourceKey}`);
  const capacity = source.system.container?.capacity?.max ?? 0;
  const recurringExpense = source.sourceKey === "monthly-bus-pass"
    ? { key: "monthly-bus-pass", type: "service", monthlyCost: 50 }
    : source.sourceKey === "smartphone-service-plan-one-month"
      ? { key: "smartphone-service-plan", type: "service", monthlyCost: 10 }
      : null;
  const item = {
    name: source.name,
    type: "item",
    img:
      `modules/cwn-content-pack/assets/icons/gear/common-operator-gear/`
      + `${source.sourceKey}.svg`,
    folder: folderIds.get(source.folderKey),
    flags: {
      "cwn-content-pack": {
        catalogueKey: source.sourceKey,
        sourceName: source.sourceName,
        provenance: source.provenance,
        ...(recurringExpense ? { recurringExpense } : {})
      }
    },
    system: {
      cost: source.system.cost,
      description: `<p>${escapeHtml(source.description)}</p>`,
      encumbrance: source.system.encumbrance,
      noEncReadied: source.system.noEncReadied,
      favorite: false,
      quantity: 1,
      bundle: { bundled: false, amount: null },
      tl: null,
      location: "stowed",
      quality: "stock",
      container: {
        isContainer: capacity > 0,
        isOpen: true,
        capacity: { max: capacity, value: 0 }
      },
      containerId: "",
      roll: { diceNum: null, diceSize: null, diceBonus: null },
      formula: "",
      uses: {
        max: 1,
        value: 1,
        emptyQuantity: 0,
        consumable: "none",
        ammo: "none",
        keepEmpty: true
      }
    },
    effects: [],
    ownership: { default: 0 },
    _id: id,
    sort: (index + 1) * 1000,
    _stats: cleanStats,
    _key: `!items!${id}`
  };
  await fs.writeFile(
    path.join(sourcePack, `${source.sourceKey}.yml`),
    YAML.stringify(item),
    "utf8"
  );
}

await compilePack(sourcePack, outputPack, { yaml: true, log: true });

let compiledItemCount = 0;
let compiledFolderCount = 0;
const compiledIds = new Set();
const compiledFolderIds = new Set();
const compiledItems = [];
await fs.rm(verificationPack, { recursive: true, force: true });
await extractPack(outputPack, verificationPack, {
  yaml: true,
  log: false,
  transformEntry: async (entry) => {
    assertFoundryId(entry._id, `Compiled Common Operator Gear entry "${entry.name}"`);
    if (compiledIds.has(entry._id)) {
      throw new Error(`Duplicate compiled Common Operator Gear ID "${entry._id}".`);
    }
    compiledIds.add(entry._id);
    if (entry?.type === "item") {
      compiledItemCount += 1;
      compiledItems.push(entry);
    }
    if (entry?.type === "Item") {
      compiledFolderCount += 1;
      compiledFolderIds.add(entry._id);
    }
    return entry;
  }
});
await fs.rm(verificationPack, { recursive: true, force: true });

if (compiledItemCount !== EXPECTED_GEAR_ITEM_COUNT) {
  throw new Error(
    `Common Operator Gear verification expected ${EXPECTED_GEAR_ITEM_COUNT} items `
    + `but found ${compiledItemCount}.`
  );
}
if (compiledFolderCount !== Object.keys(GEAR_FOLDER_DEFINITIONS).length) {
  throw new Error(
    `Common Operator Gear verification expected `
    + `${Object.keys(GEAR_FOLDER_DEFINITIONS).length} folders but found `
    + `${compiledFolderCount}.`
  );
}
for (const item of compiledItems) {
  if (!compiledFolderIds.has(item.folder)) {
    throw new Error(`Compiled gear "${item.name}" has unresolved folder "${item.folder}".`);
  }
}

console.log(
  `Built and verified ${compiledItemCount} Common Operator Gear items and `
  + `${compiledFolderCount} folders.`
);
