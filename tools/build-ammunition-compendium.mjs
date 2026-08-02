import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import {
  CONTENT_PACK_FLAG_SCOPE,
  FAMILY_SLUG_PATTERN,
  WEAPON_BASE_CONTRACT
} from "../scripts/weapon-family-contract.mjs";

const moduleRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const moduleRequire = createRequire(path.join(moduleRoot, "package.json"));
const YAML = moduleRequire("yaml");
const { compilePack, extractPack } = await import("@foundryvtt/foundryvtt-cli");

const sourceRoot = path.join(moduleRoot, "data", "ammunition");
const iconRoot = path.join(moduleRoot, "assets", "icons", "ammunition");
const sourcePack = path.join(moduleRoot, "src", "packs", "cwn-ammunition");
const outputPack = path.join(moduleRoot, "packs", "cwn-ammunition");
const verificationPack = path.join(moduleRoot, ".build", "verify-cwn-ammunition");
const expectedItemCount = 14;

const folderDefinitions = Object.freeze({
  magazines: Object.freeze({ name: "Magazines", sort: 100000 }),
  "shells-and-rounds": Object.freeze({ name: "Shells & Rounds", sort: 200000 }),
  "belts-and-boxes": Object.freeze({ name: "Belts & Ammunition Boxes", sort: 300000 }),
  "specialised-reloads": Object.freeze({ name: "Specialised Reloads", sort: 400000 })
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

const assertFiniteNumber = (value, label) => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`${label} must be a finite number.`);
  }
};

const cleanStats = {
  compendiumSource: null,
  duplicateSource: null,
  exportSource: null,
  coreVersion: "13.351",
  systemId: "swnr",
  systemVersion: "2.3.1"
};

const reloadableFamilies = new Set(
  Object.values(WEAPON_BASE_CONTRACT)
    .filter((contract) => contract.reloadable)
    .map((contract) => contract.weaponFamily)
);

const readSourceDocuments = async () => {
  const filenames = (await fs.readdir(sourceRoot))
    .filter((filename) => filename.endsWith(".json"))
    .sort();
  const documents = [];

  for (const filename of filenames) {
    const sourcePath = path.join(sourceRoot, filename);
    let document;
    try {
      document = JSON.parse(await fs.readFile(sourcePath, "utf8"));
    } catch (error) {
      throw new Error(`Malformed ammunition source JSON "${filename}": ${error.message}`);
    }
    if (filename !== `${document.sourceKey}.json`) {
      throw new Error(
        `Ammunition source "${filename}" must match sourceKey "${document.sourceKey}".`
      );
    }
    documents.push(document);
  }

  return documents;
};

const validateSources = async (sources) => {
  if (sources.length !== expectedItemCount) {
    throw new Error(
      `Expected ${expectedItemCount} ammunition sources but found ${sources.length}.`
    );
  }

  const sourceKeys = new Set();
  const names = new Set();
  const iconPaths = new Set();
  const generatedIds = new Set();

  for (const source of sources) {
    if (
      typeof source.sourceKey !== "string"
      || !FAMILY_SLUG_PATTERN.test(source.sourceKey)
    ) {
      throw new Error(`Invalid ammunition sourceKey "${source.sourceKey ?? ""}".`);
    }
    if (sourceKeys.has(source.sourceKey)) {
      throw new Error(`Duplicate ammunition sourceKey "${source.sourceKey}".`);
    }
    sourceKeys.add(source.sourceKey);

    if (typeof source.name !== "string" || source.name.trim() === "") {
      throw new Error(`Ammunition source "${source.sourceKey}" is missing a name.`);
    }
    if (names.has(source.name)) {
      throw new Error(`Duplicate ammunition display name "${source.name}".`);
    }
    names.add(source.name);

    if (!folderDefinitions[source.folderKey]) {
      throw new Error(
        `Ammunition source "${source.sourceKey}" has unresolved folder "${source.folderKey}".`
      );
    }
    if (
      typeof source.magazineFamily !== "string"
      || !FAMILY_SLUG_PATTERN.test(source.magazineFamily)
    ) {
      throw new Error(
        `Ammunition source "${source.sourceKey}" has malformed magazineFamily.`
      );
    }
    if (!reloadableFamilies.has(source.magazineFamily)) {
      throw new Error(
        `Ammunition source "${source.sourceKey}" references unknown family `
        + `"${source.magazineFamily}".`
      );
    }

    if (typeof source.img !== "string" || source.img.trim() === "") {
      throw new Error(`Ammunition source "${source.sourceKey}" is missing an icon path.`);
    }
    if (iconPaths.has(source.img)) {
      throw new Error(`Duplicate ammunition icon path "${source.img}".`);
    }
    iconPaths.add(source.img);
    const expectedIcon =
      `modules/cwn-content-pack/assets/icons/ammunition/${source.sourceKey}.svg`;
    if (source.img !== expectedIcon) {
      throw new Error(
        `Ammunition source "${source.sourceKey}" must use icon "${expectedIcon}".`
      );
    }
    try {
      await fs.access(path.join(iconRoot, `${source.sourceKey}.svg`));
    } catch {
      throw new Error(`Missing ammunition icon for "${source.sourceKey}".`);
    }

    if (!source.system || typeof source.system !== "object") {
      throw new Error(`Ammunition source "${source.sourceKey}" is missing system data.`);
    }
    assertFiniteNumber(source.system.cost, `${source.sourceKey} cost`);
    if (source.system.cost < 0) {
      throw new Error(`Ammunition source "${source.sourceKey}" has a negative cost.`);
    }
    const uses = source.system.uses;
    if (!uses || typeof uses !== "object") {
      throw new Error(`Ammunition source "${source.sourceKey}" is missing Uses data.`);
    }
    assertFiniteNumber(uses.value, `${source.sourceKey} Uses value`);
    assertFiniteNumber(uses.max, `${source.sourceKey} Uses max`);
    if (!Number.isInteger(uses.value) || !Number.isInteger(uses.max)) {
      throw new Error(`Ammunition source "${source.sourceKey}" Uses must be integers.`);
    }
    if (uses.max < 1 || uses.value < 0 || uses.value !== uses.max) {
      throw new Error(
        `Ammunition source "${source.sourceKey}" must start full with max at least 1.`
      );
    }
    if (!["ammo", "special"].includes(uses.ammo)) {
      throw new Error(
        `Ammunition source "${source.sourceKey}" has invalid native ammo type `
        + `"${uses.ammo ?? ""}".`
      );
    }
    if (typeof source.provenance !== "string" || source.provenance.trim() === "") {
      throw new Error(`Ammunition source "${source.sourceKey}" lacks provenance.`);
    }

    const id = stableId("U", `ammunition:${source.sourceKey}`);
    assertFoundryId(id, `Ammunition "${source.name}"`);
    if (generatedIds.has(id)) {
      throw new Error(`Duplicate generated ammunition ID "${id}".`);
    }
    generatedIds.add(id);
  }
};

await fs.rm(sourcePack, { recursive: true, force: true });
await fs.rm(outputPack, { recursive: true, force: true });
await fs.mkdir(sourcePack, { recursive: true });

const sources = await readSourceDocuments();
await validateSources(sources);

const folderIds = new Map();
for (const [folderKey, folder] of Object.entries(folderDefinitions)) {
  const id = stableId("F", `ammunition-folder:${folderKey}`);
  assertFoundryId(id, `Ammunition folder "${folder.name}"`);
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
  const id = stableId("U", `ammunition:${source.sourceKey}`);
  const item = {
    name: source.name,
    type: "item",
    img: source.img,
    folder: folderIds.get(source.folderKey),
    flags: {
      [CONTENT_PACK_FLAG_SCOPE]: {
        catalogueKey: source.sourceKey,
        magazineFamily: source.magazineFamily,
        provenance: source.provenance
      }
    },
    system: {
      cost: source.system.cost,
      description:
        `<p>${source.description}</p>`
        + "<p><em>Gameplay abstraction: cost covers ammunition only; "
        + "empty magazines, refill bookkeeping, and ammunition Encumbrance are omitted.</em></p>",
      encumbrance: 0,
      noEncReadied: false,
      favorite: false,
      quantity: 1,
      bundle: {
        bundled: false,
        amount: null
      },
      tl: null,
      location: "stowed",
      quality: "stock",
      container: {
        isContainer: false,
        isOpen: true,
        capacity: {
          max: 0,
          value: 0
        }
      },
      containerId: "",
      roll: {
        diceNum: null,
        diceSize: null,
        diceBonus: null
      },
      formula: "",
      uses: {
        max: source.system.uses.max,
        value: source.system.uses.value,
        emptyQuantity: 0,
        consumable: "count",
        ammo: source.system.uses.ammo,
        keepEmpty: false
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
await fs.rm(verificationPack, { recursive: true, force: true });
await extractPack(outputPack, verificationPack, {
  yaml: true,
  log: false,
  transformEntry: async (entry) => {
    if (entry?.type === "item") compiledItemCount += 1;
    if (entry?.type === "Item") compiledFolderCount += 1;
  }
});
await fs.rm(verificationPack, { recursive: true, force: true });

if (compiledItemCount !== expectedItemCount) {
  throw new Error(
    `Ammunition compendium verification failed: expected ${expectedItemCount} items `
    + `but found ${compiledItemCount}.`
  );
}
if (compiledFolderCount !== Object.keys(folderDefinitions).length) {
  throw new Error(
    `Ammunition compendium verification failed: expected `
    + `${Object.keys(folderDefinitions).length} folders but found ${compiledFolderCount}.`
  );
}

console.log(
  `Built and verified ${compiledItemCount} ammunition items and `
  + `${compiledFolderCount} folders.`
);
