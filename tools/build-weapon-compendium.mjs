import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { installWeaponCatalogue } from "../scripts/weapon-catalogue.mjs";
import {
  CONTENT_PACK_FLAG_SCOPE,
  contractForBaseWeapon
} from "../scripts/weapon-family-contract.mjs";

const moduleRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const defaultSystemRoot = path.resolve(moduleRoot, "vendor", "swnr");
const systemRoot = path.resolve(
  process.argv[2] ?? process.env.SWNR_ROOT ?? defaultSystemRoot
);
const moduleRequire = createRequire(path.join(moduleRoot, "package.json"));
const YAML = moduleRequire("yaml");
const { compilePack, extractPack } = await import("@foundryvtt/foundryvtt-cli");

const sourcePack = path.join(moduleRoot, "src", "packs", "harbour-city-stories-weapons");
const outputPack = path.join(moduleRoot, "packs", "harbour-city-stories-weapons");
const verificationPack = path.join(moduleRoot, ".build", "verify-harbour-city-stories-weapons");
const systemItems = path.join(systemRoot, "src", "packs", "cwn-items");
const expectedWeaponIdentityDigest =
  "ea6b624ee9c9a8fa10fdca13971315ecb7cfd332643b952c7421a08f947b936b";

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

const weaponIdentityLines = [];
for (const [index, item] of createdItems.entries()) {
  const key = getProperty(item, "flags.harbour-city-stories.catalogueKey");
  const baseWeapon = getProperty(item, "flags.harbour-city-stories.baseWeapon");
  const baseContract = contractForBaseWeapon(baseWeapon);
  const id = stableId("W", key);
  assertFoundryId(id, `Weapon "${item.name}"`);
  weaponIdentityLines.push(`${key}:${id}`);

  const generatedFamily = getProperty(
    item,
    `flags.${CONTENT_PACK_FLAG_SCOPE}.weaponFamily`
  );
  if (baseContract.reloadable && generatedFamily !== baseContract.weaponFamily) {
    throw new Error(
      `Reloadable weapon "${item.name}" must have family `
      + `"${baseContract.weaponFamily}", found "${generatedFamily ?? ""}".`
    );
  }
  if (!baseContract.reloadable && generatedFamily !== undefined) {
    throw new Error(
      `Excluded weapon "${item.name}" unexpectedly has family "${generatedFamily}".`
    );
  }

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

const weaponIdentityDigest = crypto
  .createHash("sha256")
  .update(weaponIdentityLines.sort().join("\n"))
  .digest("hex");
if (weaponIdentityDigest !== expectedWeaponIdentityDigest) {
  throw new Error(
    "Deterministic weapon IDs changed unexpectedly. "
    + `Expected ${expectedWeaponIdentityDigest}, found ${weaponIdentityDigest}.`
  );
}

await compilePack(sourcePack, outputPack, { yaml: true, log: true });

let compiledWeaponCount = 0;
await fs.rm(verificationPack, { recursive: true, force: true });
await extractPack(outputPack, verificationPack, {
  yaml: true,
  log: false,
  transformEntry: async (entry) => {
    if (entry?.type === "weapon") compiledWeaponCount += 1;
  }
});
await fs.rm(verificationPack, { recursive: true, force: true });
if (compiledWeaponCount !== 64) {
  throw new Error(
    `Weapon compendium verification failed: expected 64 items but found ${compiledWeaponCount}.`
  );
}

console.log(
  `Built and verified ${compiledWeaponCount} weapons and ${folders.length} folders.`
);
