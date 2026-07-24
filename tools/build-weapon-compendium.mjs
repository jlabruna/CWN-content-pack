import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { installWeaponCatalogue } from "../scripts/weapon-catalogue.mjs";

const moduleRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const defaultSystemRoot = path.resolve(moduleRoot, "..", "..", "work", "swnr-v2.3.0");
const systemRoot = path.resolve(process.argv[2] ?? defaultSystemRoot);
const moduleRequire = createRequire(path.join(moduleRoot, "package.json"));
const YAML = moduleRequire("yaml");
const { compilePack } = moduleRequire("@foundryvtt/foundryvtt-cli");

const sourcePack = path.join(moduleRoot, "src", "packs", "harbour-city-stories-weapons");
const outputPack = path.join(moduleRoot, "packs", "harbour-city-stories-weapons");
const systemItems = path.join(systemRoot, "src", "packs", "cwn-items");

const stableId = (prefix, value) => {
  // Foundry document IDs must be exactly 16 alphanumeric characters.
  // Hex avoids the "-" and "_" characters emitted by base64url digests.
  const digest = crypto.createHash("sha256").update(value).digest("hex");
  return `${prefix}${digest}`.slice(0, 16);
};

const assertFoundryId = (id, label) => {
  if (!/^[A-Za-z0-9]{16}$/.test(id)) {
    throw new Error(`${label} has invalid Foundry ID "${id}".`);
  }
};

const getProperty = (object, property) =>
  property.split(".").reduce((value, key) => value?.[key], object);

const mergeObject = (target, source) => {
  for (const [key, value] of Object.entries(source)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      target[key] = mergeObject(target[key] ?? {}, value);
    } else {
      target[key] = value;
    }
  }
  return target;
};

await fs.rm(sourcePack, { recursive: true, force: true });
await fs.rm(outputPack, { recursive: true, force: true });
await fs.mkdir(sourcePack, { recursive: true });

const baseItems = [];
for (const filename of await fs.readdir(systemItems)) {
  if (!filename.endsWith(".yml")) continue;
  const document = YAML.parse(await fs.readFile(path.join(systemItems, filename), "utf8"));
  if (document?.type !== "weapon") continue;
  baseItems.push({
    ...document,
    toObject: () => structuredClone(document)
  });
}

const folders = [];
const createdItems = [];
let folderSequence = 0;

globalThis.foundry = {
  utils: {
    deepClone: structuredClone,
    getProperty,
    mergeObject
  }
};
globalThis.ui = {
  notifications: {
    info: () => {},
    warn: console.warn,
    error: (message) => {
      throw new Error(message);
    }
  }
};
globalThis.game = {
  user: { isGM: true },
  system: { id: "swnr", version: "2.3.0" },
  modules: new Map([["cwn-content-pack", { active: true }]]),
  items: baseItems,
  packs: [],
  folders
};
globalThis.Folder = class {
  static async create(source) {
    folderSequence += 1;
    const folder = {
      ...source,
      id: stableId("F", `${folderSequence}:${source.name}:${source.folder ?? ""}`),
      async update(change) {
        Object.assign(this, change);
      }
    };
    folders.push(folder);
    return folder;
  }
};
globalThis.Item = class {
  static async create(source) {
    const item = structuredClone(source);
    createdItems.push(item);
    return item;
  }
};

await installWeaponCatalogue();

const cleanStats = {
  compendiumSource: null,
  duplicateSource: null,
  exportSource: null,
  coreVersion: "13.351",
  systemId: "swnr",
  systemVersion: "2.3.0"
};

for (const [index, folder] of folders.entries()) {
  assertFoundryId(folder.id, `Folder "${folder.name}"`);
  const document = {
    type: "Item",
    folder: folder.folder ?? null,
    name: folder.name,
    color: null,
    sorting: "a",
    _id: folder.id,
    description: "",
    sort: (index + 1) * 100000,
    flags: {},
    _stats: cleanStats,
    _key: `!folders!${folder.id}`
  };
  await fs.writeFile(
    path.join(sourcePack, `folder-${folder.id}.yml`),
    YAML.stringify(document),
    "utf8"
  );
}

for (const [index, item] of createdItems.entries()) {
  const key = getProperty(item, "flags.harbour-city-stories.catalogueKey");
  const id = stableId("W", key);
  assertFoundryId(id, `Weapon "${item.name}"`);

  // Correct legacy installer property names to the SWNR 2.3 data schema.
  if (item.system?.shock?.damage !== undefined) {
    item.system.shock.dmg = item.system.shock.damage;
    delete item.system.shock.damage;
  }
  if (item.system?.nonLethal !== undefined) {
    item.system.isNonLethal = item.system.nonLethal;
    delete item.system.nonLethal;
  }

  item._id = id;
  item.sort = (index + 1) * 1000;
  item.ownership = { default: 0 };
  item._stats = cleanStats;
  item._key = `!items!${id}`;

  await fs.writeFile(
    path.join(sourcePack, `${key}.yml`),
    YAML.stringify(item),
    "utf8"
  );
}

if (createdItems.length !== 64) {
  throw new Error(`Expected 64 weapons but generated ${createdItems.length}.`);
}

await compilePack(sourcePack, outputPack, { yaml: true, log: true });
console.log(`Built ${createdItems.length} weapons and ${folders.length} folders.`);
