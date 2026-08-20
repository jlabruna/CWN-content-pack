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
import { weaponRollContractForBaseWeapon } from "../scripts/weapon-roll-contract.mjs";

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
const expectedLegacyWeaponIdentityDigest =
  "ea6b624ee9c9a8fa10fdca13971315ecb7cfd332643b952c7421a08f947b936b";
const addedWeaponKeys = new Set([
  "advanced-bow-ironbark-huntsman",
  "knife-generic-broken-bottle",
  "knife-generic-kitchen-knife",
  "knife-generic-shiv",
  "club-generic-wrench",
  "club-generic-crowbar",
  "club-generic-metal-pipe",
  "club-generic-pool-cue",
  "big-club-generic-sledgehammer",
  "advanced-sword-helix-hx-47-vector"
]);
const expectedWeaponCount = 74;
const legacyWeaponFolderIds = Object.freeze({
  "Advanced Big Swords": "F8f33a086f3d59f9",
  "Advanced Clubs": "Fe7db1a4cd4b8dd2",
  "Advanced Knives": "F99620609dc97727",
  "Advanced Swords": "F8e07c19b8e2e6f3",
  "Anti-Materiel Rifles": "Fd12698dddd9aa30",
  "Automatic Rifles": "F4888e4981e905cf",
  "Big Swords": "Fe45b63da30a0a9c",
  Clubs: "Fa790530948dd658",
  "Combat Rifles": "F4c3512e583e380b",
  "Combat Shotguns": "F05f133ab1b7e5d1",
  Firearms: "F599b61097d459ff",
  "Harbour City Stories Weapons": "Fddf51ee48f589f6",
  "Heavy Machine Guns": "F8abb64edf07fe74",
  "Heavy Pistols": "F9e2ca596d67b4e0",
  "Heavy Weapons": "Fe50d39a6e304819",
  Knives: "F9ad9130ddb49a42",
  "Light Pistols": "F34bb03ac3451f11",
  "Melee and Thrown Weapons": "F753a3237c32cd71",
  Mortars: "Ff57222804d938c1",
  Rifles: "F0d1c68f217de3b1",
  "Rocket Launchers": "Fcc36dbbc8014027",
  "Semi-Auto Shotguns": "F6f172ec64fd3ba0",
  Shotguns: "Fd070ec32c0d4587",
  "Sniper Rifles": "F485feaf01e418c5",
  Spears: "Fa2e6e46110612d0",
  "Submachine Guns": "Fe6c9023b0147bef",
  Swords: "Fd9c0d95198a6e86",
  "Taser Pistols": "Fe07696532b3def7"
});

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
  system: { id: "swnr", version: "2.3.1" },
  modules: new Map([["cwn-content-pack", { active: true }]]),
  items: baseItems,
  packs: [],
  folders
};
globalThis.Folder = class {
  static async create(source) {
    const folder = {
      ...source,
      id: legacyWeaponFolderIds[source.name]
        ?? stableId("F", `weapon-folder:${source.name}`),
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
  systemVersion: "2.3.1"
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

const legacyWeaponIdentityLines = [];
for (const [index, item] of createdItems.entries()) {
  const key = getProperty(item, "flags.harbour-city-stories.catalogueKey");
  const baseWeapon = getProperty(item, "flags.harbour-city-stories.baseWeapon");
  const baseContract = contractForBaseWeapon(baseWeapon);
  const rollContract = weaponRollContractForBaseWeapon(baseWeapon);
  const id = stableId("W", key);
  assertFoundryId(id, `Weapon "${item.name}"`);
  if (!addedWeaponKeys.has(key)) legacyWeaponIdentityLines.push(`${key}:${id}`);

  const generatedFamily = getProperty(
    item,
    `flags.${CONTENT_PACK_FLAG_SCOPE}.weaponFamily`
  );
  const generatedNativeSkill = getProperty(
    item,
    "flags.harbour-city-stories.nativeSkill",
  );
  const generatedNativeStat = getProperty(
    item,
    "flags.harbour-city-stories.nativeStat",
  );
  if (generatedNativeSkill !== rollContract.skill) {
    throw new Error(
      `Weapon "${item.name}" must declare native skill "${rollContract.skill}".`,
    );
  }
  if (generatedNativeStat !== rollContract.stat) {
    throw new Error(
      `Weapon "${item.name}" must declare native stat "${rollContract.stat}".`,
    );
  }
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

  for (const [field, expected] of Object.entries({
    stat: rollContract.stat,
    secondStat: rollContract.secondStat,
    skill: rollContract.systemSkill,
    isMelee: rollContract.isMelee,
  })) {
    if (item.system?.[field] !== expected) {
      throw new Error(
        `Weapon "${item.name}" has invalid system.${field}; expected "${expected}".`,
      );
    }
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

if (createdItems.length !== expectedWeaponCount) {
  throw new Error(
    `Expected ${expectedWeaponCount} weapons but generated ${createdItems.length}.`
  );
}

const legacyWeaponIdentityDigest = crypto
  .createHash("sha256")
  .update(legacyWeaponIdentityLines.sort().join("\n"))
  .digest("hex");
if (legacyWeaponIdentityDigest !== expectedLegacyWeaponIdentityDigest) {
  throw new Error(
    "Existing deterministic weapon IDs changed unexpectedly. "
    + `Expected ${expectedLegacyWeaponIdentityDigest}, found ${legacyWeaponIdentityDigest}.`
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
if (compiledWeaponCount !== expectedWeaponCount) {
  throw new Error(
    `Weapon compendium verification failed: expected ${expectedWeaponCount} items but found `
    + `${compiledWeaponCount}.`
  );
}

console.log(
  `Built and verified ${compiledWeaponCount} weapons and ${folders.length} folders.`
);
