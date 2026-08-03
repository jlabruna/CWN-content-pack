import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  CONTENT_PACK_FLAG_SCOPE,
  FAMILY_SLUG_PATTERN,
  contractForBaseWeapon
} from "../scripts/weapon-family-contract.mjs";
import { weaponRollContractForBaseWeapon } from "../scripts/weapon-roll-contract.mjs";

const { extractPack } = await import("@foundryvtt/foundryvtt-cli");
const moduleRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(await fs.readFile(path.join(moduleRoot, "module.json"), "utf8"));

if (manifest.version !== "0.7.4") {
  throw new Error(`Expected module version 0.7.4 but found ${manifest.version}.`);
}
if (manifest.compatibility?.verified !== "14.365") {
  throw new Error("module.json must be verified for Foundry VTT 14.365.");
}
if (manifest.compatibility?.maximum !== undefined) {
  throw new Error("module.json must not cap installation at Foundry VTT 13.");
}
const swnrRelationship = manifest.relationships?.systems?.find(({ id }) => id === "swnr");
if (
  swnrRelationship?.compatibility?.minimum !== "2.3.1"
  || swnrRelationship?.compatibility?.verified !== "2.3.1"
) {
  throw new Error("module.json must require and verify SWNR 2.3.1.");
}

const expectedPacks = Object.freeze({
  "harbour-city-stories-weapons": { documentType: "Item", itemType: "weapon", count: 64 },
  "harbour-city-stories-armor": { documentType: "Item", itemType: "armor", count: 14, folderCount: 3 },
  "cwn-ammunition": { documentType: "Item", itemType: "item", count: 14, folderCount: 4 },
  "cwn-common-operator-gear": { documentType: "Item", itemType: "item", count: 27, folderCount: 5 },
  "cwn-cyberware": { documentType: "Item", itemType: "cyberware", count: 88, folderCount: 8 },
  "cwn-drones": { documentType: "Actor", itemType: "drone", count: 9, folderCount: 0 }
});
const expectedWeaponIdentityDigest =
  "ea6b624ee9c9a8fa10fdca13971315ecb7cfd332643b952c7421a08f947b936b";
const expectedReloadableWeaponCount = 52;

const getProperty = (object, property) =>
  property.split(".").reduce((value, key) => value?.[key], object);

const assertFoundryId = (id, label) => {
  if (!/^[A-Za-z0-9]{16}$/.test(id ?? "")) {
    throw new Error(`${label} has invalid Foundry ID "${id ?? ""}".`);
  }
};

const moduleAssetPath = (foundryPath) => {
  const prefix = "modules/cwn-content-pack/";
  if (typeof foundryPath !== "string" || !foundryPath.startsWith(prefix)) {
    throw new Error(`Invalid Content Pack asset path "${foundryPath ?? ""}".`);
  }
  return path.join(moduleRoot, ...foundryPath.slice(prefix.length).split("/"));
};

const loadPack = async (packName) => {
  const packPath = path.join(moduleRoot, "packs", packName);
  const extractPath = path.join(moduleRoot, ".build", `validate-${packName}`);
  const entries = [];
  await fs.rm(extractPath, { recursive: true, force: true });
  await extractPack(packPath, extractPath, {
    yaml: true,
    log: false,
    transformEntry: async (entry) => {
      entries.push(structuredClone(entry));
      return entry;
    }
  });
  await fs.rm(extractPath, { recursive: true, force: true });
  return entries;
};

const declaredPacks = new Map((manifest.packs ?? []).map((pack) => [pack.name, pack]));
if (declaredPacks.size !== Object.keys(expectedPacks).length) {
  throw new Error(
    `module.json must declare exactly ${Object.keys(expectedPacks).length} packs.`
  );
}

const loadedPacks = new Map();
for (const [packName, expected] of Object.entries(expectedPacks)) {
  const declaration = declaredPacks.get(packName);
  if (!declaration) {
    throw new Error(`module.json does not declare required pack "${packName}".`);
  }
  if (declaration.type !== expected.documentType || declaration.system !== "swnr") {
    throw new Error(`Pack "${packName}" must be an SWNR ${expected.documentType} compendium.`);
  }
  if (declaration.path !== `packs/${packName}`) {
    throw new Error(`Pack "${packName}" has unexpected path "${declaration.path}".`);
  }

  const entries = await loadPack(packName);
  if (entries.length === 0) {
    throw new Error(`Declared pack "${packName}" is empty.`);
  }
  const items = entries.filter((entry) => entry.type === expected.itemType);
  const folders = entries.filter((entry) => entry.type === expected.documentType);
  if (items.length !== expected.count) {
    throw new Error(
      `Pack "${packName}" expected ${expected.count} items but found ${items.length}.`
    );
  }
  if (expected.folderCount !== undefined && folders.length !== expected.folderCount) {
    throw new Error(
      `Pack "${packName}" expected ${expected.folderCount} folders but found `
      + `${folders.length}.`
    );
  }

  const ids = new Set();
  for (const entry of entries) {
    assertFoundryId(entry._id, `${packName} entry "${entry.name}"`);
    if (ids.has(entry._id)) {
      throw new Error(`Pack "${packName}" contains duplicate ID "${entry._id}".`);
    }
    ids.add(entry._id);
  }
  const folderIds = new Set(folders.map((folder) => folder._id));
  for (const folder of folders) {
    if (folder.folder !== null && !folderIds.has(folder.folder)) {
      throw new Error(
        `Folder "${folder.name}" in "${packName}" has unresolved parent "${folder.folder}".`
      );
    }
  }
  for (const item of items) {
    if (expected.folderCount > 0 && (typeof item.folder !== "string" || !folderIds.has(item.folder))) {
      throw new Error(
        `Item "${item.name}" in "${packName}" has unresolved folder "${item.folder}".`
      );
    }
    if (expected.folderCount === 0 && item.folder !== null) {
      throw new Error(`Entry "${item.name}" in "${packName}" must be at the compendium root.`);
    }
  }
  loadedPacks.set(packName, { entries, items, folders });
}

const weapons = loadedPacks.get("harbour-city-stories-weapons").items;
const generatedWeaponFamilies = new Set();
const weaponIdentityLines = [];
let reloadableWeaponCount = 0;
for (const weapon of weapons) {
  const sourceKey = getProperty(weapon, "flags.harbour-city-stories.catalogueKey");
  const baseWeapon = getProperty(weapon, "flags.harbour-city-stories.baseWeapon");
  const contract = contractForBaseWeapon(baseWeapon);
  const rollContract = weaponRollContractForBaseWeapon(baseWeapon);
  const family = getProperty(
    weapon,
    `flags.${CONTENT_PACK_FLAG_SCOPE}.weaponFamily`
  );
  if (!sourceKey) {
    throw new Error(`Weapon "${weapon.name}" is missing its legacy catalogueKey.`);
  }
  weaponIdentityLines.push(`${sourceKey}:${weapon._id}`);
  if (contract.reloadable) {
    reloadableWeaponCount += 1;
    if (family !== contract.weaponFamily || !FAMILY_SLUG_PATTERN.test(family)) {
      throw new Error(
        `Reloadable weapon "${weapon.name}" has invalid family "${family ?? ""}".`
      );
    }
    if (
      !weapon.system?.ammo
      || ["none", "infinite"].includes(weapon.system.ammo.type)
      || !(weapon.system.ammo.max > 0)
    ) {
      throw new Error(`Reloadable weapon "${weapon.name}" has invalid SWNR ammo data.`);
    }
    generatedWeaponFamilies.add(family);
  } else if (family !== undefined) {
    throw new Error(
      `Excluded weapon "${weapon.name}" unexpectedly has family "${family}".`
    );
  }
  for (const [field, expected] of Object.entries({
    stat: rollContract.stat,
    secondStat: rollContract.secondStat,
    skill: rollContract.systemSkill,
    isMelee: rollContract.isMelee,
  })) {
    if (weapon.system?.[field] !== expected) {
      throw new Error(
        `Weapon "${weapon.name}" must use system.${field} "${expected}".`,
      );
    }
  }
}
if (reloadableWeaponCount !== expectedReloadableWeaponCount) {
  throw new Error(
    `Expected ${expectedReloadableWeaponCount} reloadable weapons but found `
    + `${reloadableWeaponCount}.`
  );
}
const weaponIdentityDigest = crypto
  .createHash("sha256")
  .update(weaponIdentityLines.sort().join("\n"))
  .digest("hex");
if (weaponIdentityDigest !== expectedWeaponIdentityDigest) {
  throw new Error("Generated deterministic weapon IDs changed unexpectedly.");
}

const ammunition = loadedPacks.get("cwn-ammunition").items;
const ammunitionIconPaths = new Set();
const ammunitionIds = new Set();
for (const item of ammunition) {
  if (item.type !== "item") {
    throw new Error(`Ammunition "${item.name}" must have type "item".`);
  }
  if (item.system?.quantity !== 1) {
    throw new Error(`Ammunition "${item.name}" must have quantity 1.`);
  }
  if (item.system?.bundle?.bundled !== false) {
    throw new Error(`Ammunition "${item.name}" must have Bundle Count disabled.`);
  }
  if (item.system?.uses?.consumable !== "count") {
    throw new Error(`Ammunition "${item.name}" must use count consumable mode.`);
  }
  if (
    !Number.isInteger(item.system?.uses?.value)
    || !Number.isInteger(item.system?.uses?.max)
    || item.system.uses.max < 1
    || item.system.uses.value < 0
    || item.system.uses.value !== item.system.uses.max
  ) {
    throw new Error(`Ammunition "${item.name}" must start full with a valid capacity.`);
  }
  if (item.system?.encumbrance !== 0) {
    throw new Error(`Ammunition "${item.name}" must have zero Encumbrance.`);
  }
  if (item.system?.noEncReadied !== false) {
    throw new Error(`Ammunition "${item.name}" must not waive readied Encumbrance.`);
  }
  if (item.system?.container?.isContainer !== false) {
    throw new Error(`Ammunition "${item.name}" must not be a container.`);
  }
  if (item.system?.uses?.emptyQuantity !== 0 || item.system?.uses?.keepEmpty !== false) {
    throw new Error(`Ammunition "${item.name}" must not create or track empties.`);
  }

  const family = getProperty(
    item,
    `flags.${CONTENT_PACK_FLAG_SCOPE}.magazineFamily`
  );
  if (
    typeof family !== "string"
    || !FAMILY_SLUG_PATTERN.test(family)
    || !generatedWeaponFamilies.has(family)
  ) {
    throw new Error(
      `Ammunition "${item.name}" has unmatched family "${family ?? ""}".`
    );
  }

  if (ammunitionIds.has(item._id)) {
    throw new Error(`Duplicate ammunition ID "${item._id}".`);
  }
  ammunitionIds.add(item._id);
  if (ammunitionIconPaths.has(item.img)) {
    throw new Error(`Duplicate ammunition icon path "${item.img}".`);
  }
  ammunitionIconPaths.add(item.img);

  const iconPath = moduleAssetPath(item.img);
  const icon = await fs.readFile(iconPath, "utf8");
  if (!/<svg\b/.test(icon) || !/viewBox="0 0 512 512"/.test(icon)) {
    throw new Error(`Ammunition "${item.name}" has an invalid square SVG icon.`);
  }
  if (/<rect\b[^>]*\bfill=(?!["']none["'])/i.test(icon)) {
    throw new Error(`Ammunition "${item.name}" icon has a non-transparent background.`);
  }
}

const expectedGear = Object.freeze({
  "active-hearing-protection": ["Active Hearing Protection", 250, 1, false, 0],
  "gas-mask": ["Gas Mask", 1000, 1, false, 0],
  "anti-flash-goggles": ["Anti-Flash Goggles", 100, 1, false, 0],
  "ir-goggles": ["IR Goggles", 1000, 1, false, 0],
  backpack: ["Backpack", 25, 1, true, 6],
  "gear-harness": ["Gear Harness", 25, 1, true, 4],
  "ordinary-clothing": ["Ordinary Clothing", 25, 1, true, 0],
  "fashionable-clothing": ["Fashionable Clothing", 500, 1, true, 0],
  "haute-couture-clothing": ["Haute Couture Clothing", 10000, 1, true, 0],
  binoculars: ["Binoculars", 100, 1, false, 0],
  "climbing-kit": ["Climbing Kit", 150, 2, false, 0],
  "basic-tools-kit": ["Basic Tools Kit", 100, 2, false, 0],
  "cyberdoc-kit": ["Cyberdoc Kit", 500, 2, false, 0],
  medkit: ["Medkit", 100, 1, false, 0],
  "survival-kit": ["Survival Kit", 100, 2, false, 0],
  lockpicks: ["Lockpicks", 100, 1, false, 0],
  "wearable-light": ["Wearable Light", 25, 1, true, 0],
  "portable-video-camera": ["Portable Video Camera", 300, 1, false, 0],
  "handheld-radio": ["Handheld Radio", 50, 1, false, 0],
  "ultralight-radio-tab": ["Ultralight Radio Tab", 500, 0, false, 0],
  "basic-smartphone": ["Basic Smartphone", 50, 0, false, 0],
  "fashionable-smartphone": ["Fashionable Smartphone", 2000, 0, false, 0],
  "cheap-vr-crown": ["Cheap VR Crown", 50, 1, false, 0],
  "monthly-bus-pass": ["Monthly Bus Pass", 50, 0, false, 0],
  "smartphone-service-plan-one-month": [
    "Smartphone Service Plan — One Month",
    10,
    0,
    false,
    0
  ],
  "military-ration": ["Military Ration", 20, 1, false, 0],
  "military-ration-with-water": ["Military Ration with Water", 20, 2, false, 0]
});
const expectedGearFolders = new Set([
  "Protective Gear",
  "Carry and Clothing",
  "Tools and Field Gear",
  "Electronics",
  "Services and Supplies"
]);
const gearPack = loadedPacks.get("cwn-common-operator-gear");
const actualGearFolders = new Set(gearPack.folders.map((folder) => folder.name));
if (
  actualGearFolders.size !== expectedGearFolders.size
  || [...expectedGearFolders].some((name) => !actualGearFolders.has(name))
) {
  throw new Error("Common Operator Gear folder names do not match the approved manifest.");
}

const gearKeys = new Set();
const gearNames = new Set();
const gearIconPaths = new Set();
const gearIconHashes = new Set();
for (const item of gearPack.items) {
  const sourceKey = getProperty(item, `flags.${CONTENT_PACK_FLAG_SCOPE}.catalogueKey`);
  const provenance = getProperty(item, `flags.${CONTENT_PACK_FLAG_SCOPE}.provenance`);
  const expected = expectedGear[sourceKey];
  if (!expected) {
    throw new Error(`Common Operator Gear "${item.name}" has unknown sourceKey "${sourceKey}".`);
  }
  if (gearKeys.has(sourceKey)) {
    throw new Error(`Duplicate Common Operator Gear sourceKey "${sourceKey}".`);
  }
  gearKeys.add(sourceKey);
  if (gearNames.has(item.name)) {
    throw new Error(`Duplicate Common Operator Gear name "${item.name}".`);
  }
  gearNames.add(item.name);

  const [name, cost, encumbrance, noEncReadied, capacity] = expected;
  if (
    item.name !== name
    || item.type !== "item"
    || item.system?.cost !== cost
    || item.system?.encumbrance !== encumbrance
    || item.system?.noEncReadied !== noEncReadied
  ) {
    throw new Error(`Common Operator Gear "${item.name}" has invalid SWNR fields.`);
  }
  if (
    item.system?.quantity !== 1
    || item.system?.bundle?.bundled !== false
    || item.system?.containerId !== ""
    || item.system?.uses?.consumable !== "none"
  ) {
    throw new Error(`Common Operator Gear "${item.name}" has invalid base gear fields.`);
  }
  if (typeof item.system?.description !== "string" || item.system.description.trim() === "") {
    throw new Error(`Common Operator Gear "${item.name}" has an empty description.`);
  }
  if (typeof provenance !== "string" || !provenance.includes("CWN SRD via SWNR 2.3.0")) {
    throw new Error(`Common Operator Gear "${item.name}" has invalid provenance.`);
  }

  const recurringExpense = getProperty(
    item,
    `flags.${CONTENT_PACK_FLAG_SCOPE}.recurringExpense`
  );
  const expectedRecurring = sourceKey === "monthly-bus-pass"
    ? { key: "monthly-bus-pass", type: "service", monthlyCost: 50 }
    : sourceKey === "smartphone-service-plan-one-month"
      ? { key: "smartphone-service-plan", type: "service", monthlyCost: 10 }
      : null;
  if (JSON.stringify(recurringExpense ?? null) !== JSON.stringify(expectedRecurring)) {
    throw new Error(`Common Operator Gear "${item.name}" has invalid recurring-expense metadata.`);
  }

  if (capacity > 0) {
    if (
      item.system?.container?.isContainer !== true
      || item.system?.container?.isOpen !== true
      || item.system?.container?.capacity?.max !== capacity
      || item.system?.container?.capacity?.value !== 0
    ) {
      throw new Error(`Container gear "${item.name}" has invalid native SWNR capacity.`);
    }
  } else if (
    item.system?.container?.isContainer !== false
    || item.system?.container?.capacity?.max !== 0
    || item.system?.container?.capacity?.value !== 0
  ) {
    throw new Error(`Non-container gear "${item.name}" has invalid container fields.`);
  }

  const deterministicId = `G${crypto
    .createHash("sha256")
    .update(`common-operator-gear:${sourceKey}`)
    .digest("hex")}`.slice(0, 16);
  if (item._id !== deterministicId) {
    throw new Error(`Common Operator Gear "${item.name}" has a non-deterministic ID.`);
  }
  if (gearIconPaths.has(item.img)) {
    throw new Error(`Duplicate Common Operator Gear icon path "${item.img}".`);
  }
  gearIconPaths.add(item.img);
  const icon = await fs.readFile(moduleAssetPath(item.img), "utf8");
  if (!/<svg\b/.test(icon) || !/viewBox="0 0 512 512"/.test(icon)) {
    throw new Error(`Common Operator Gear "${item.name}" has an invalid square SVG icon.`);
  }
  if (/<rect\b[^>]*\bfill=(?!["']none["'])/i.test(icon)) {
    throw new Error(`Common Operator Gear "${item.name}" icon has a background fill.`);
  }
  const iconHash = crypto.createHash("sha256").update(icon).digest("hex");
  if (gearIconHashes.has(iconHash)) {
    throw new Error(`Common Operator Gear "${item.name}" does not have a distinct icon.`);
  }
  gearIconHashes.add(iconHash);
}
if (
  gearKeys.size !== Object.keys(expectedGear).length
  || Object.keys(expectedGear).some((key) => !gearKeys.has(key))
) {
  throw new Error("Common Operator Gear does not contain the exact approved 27-item manifest.");
}

const cyberwarePack = loadedPacks.get("cwn-cyberware");
const expectedCyberwareFolders = new Set([
  "Body",
  "Head",
  "Skin",
  "Limb",
  "Nerve",
  "Sensory",
  "Medical",
  "General"
]);
const actualCyberwareFolders = new Set(cyberwarePack.folders.map((folder) => folder.name));
if (
  actualCyberwareFolders.size !== expectedCyberwareFolders.size
  || [...expectedCyberwareFolders].some((name) => !actualCyberwareFolders.has(name))
) {
  throw new Error("Cyberware folder names do not match the approved eight-category manifest.");
}

const cyberwareKeys = new Set();
const cyberwareNames = new Set();
const cyberwareIconPaths = new Set();
const cyberwareIconHashes = new Set();
const cyberwareAutomationLevels = new Set([
  "native",
  "safe-active-effect",
  "combat-enhancements-handler",
  "contextual",
  "manual",
  "description-only-for-now"
]);
for (const item of cyberwarePack.items) {
  const flags = getProperty(item, `flags.${CONTENT_PACK_FLAG_SCOPE}`);
  const sourceKey = flags?.catalogueKey;
  if (
    typeof sourceKey !== "string"
    || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(sourceKey)
    || cyberwareKeys.has(sourceKey)
  ) {
    throw new Error(`Cyberware "${item.name}" has an invalid or duplicate catalogue key.`);
  }
  cyberwareKeys.add(sourceKey);
  if (!item.name || cyberwareNames.has(item.name)) {
    throw new Error(`Cyberware "${item.name}" has an invalid or duplicate name.`);
  }
  cyberwareNames.add(item.name);
  if (
    item.type !== "cyberware"
    || !Number.isFinite(item.system?.cost)
    || item.system.cost < 0
    || !Number.isFinite(item.system?.strain)
    || item.system.strain < 0
    || !Number.isInteger(item.system?.tl)
    || item.system.tl < 0
    || !["Body", "Head", "Skin", "Limb", "Nerve", "Sensory", "Medical", "None"]
      .includes(item.system?.type)
    || !["Sight", "Touch", "Medical"].includes(item.system?.concealment)
    || typeof item.system?.effect !== "string"
    || item.system.effect.trim() === ""
    || typeof item.system?.description !== "string"
    || item.system.description.trim() === ""
  ) {
    throw new Error(`Cyberware "${item.name}" has invalid native SWNR fields.`);
  }
  if (
    flags?.cyberware?.key !== sourceKey
    || flags?.cyberware?.sourceType !== "official-catalogue"
    || flags?.cyberware?.category !== item.system.type.toLowerCase()
    || !cyberwareAutomationLevels.has(flags?.cyberware?.automationLevel)
    || flags?.cyberwareMaintenance?.required !== true
    || flags?.cyberwareMaintenance?.baseCostOverride !== null
    || typeof flags?.provenance !== "string"
    || !flags.provenance.includes("CWN SRD via SWNR 2.3.0")
  ) {
    throw new Error(`Cyberware "${item.name}" has invalid provenance or automation metadata.`);
  }
  if (!Array.isArray(item.effects) || item.effects.length !== 0) {
    throw new Error(`Cyberware "${item.name}" must not contain unverified Active Effects.`);
  }
  const deterministicId = `C${crypto
    .createHash("sha256")
    .update(`cwn-cyberware:${sourceKey}`)
    .digest("hex")}`.slice(0, 16);
  if (item._id !== deterministicId) {
    throw new Error(`Cyberware "${item.name}" has a non-deterministic ID.`);
  }
  if (cyberwareIconPaths.has(item.img)) {
    throw new Error(`Duplicate cyberware icon path "${item.img}".`);
  }
  cyberwareIconPaths.add(item.img);
  const icon = await fs.readFile(moduleAssetPath(item.img), "utf8");
  if (!/<svg\b/.test(icon) || !/viewBox="0 0 512 512"/.test(icon)) {
    throw new Error(`Cyberware "${item.name}" has an invalid square SVG icon.`);
  }
  if (/<rect\b[^>]*\bfill=(?!["']none["'])/i.test(icon)) {
    throw new Error(`Cyberware "${item.name}" icon has a background fill.`);
  }
  const iconHash = crypto.createHash("sha256").update(icon).digest("hex");
  if (cyberwareIconHashes.has(iconHash)) {
    throw new Error(`Cyberware "${item.name}" does not have a distinct icon.`);
  }
  cyberwareIconHashes.add(iconHash);
}
if (cyberwareKeys.size !== 88) {
  throw new Error(`Cyberware compendium contains ${cyberwareKeys.size} unique entries, expected 88.`);
}

const expectedDrones = Object.freeze({
  "blackhound-bh-10-roach": [1000, 13, 6, 8, 3, 10, "ground", 0, 3],
  "ironbark-sunfish": [1000, 15, 6, 8, 3, 10, "swim", 0, 3],
  "titan-td-70-kerberos": [15000, 18, 8, 25, 6, 20, "ground", 3, 99],
  "helix-hx-35-pitbull": [5000, 15, 8, 15, 5, 20, "ground", 1, 5],
  "helix-hx-40-javelin": [10000, 16, 6, 12, 5, 20, "fly", 1, 6],
  "shintech-st-90-shrike": [25000, 18, 8, 20, 6, 30, "fly", 2, 99],
  "ironbark-mouse": [500, 13, 6, 1, 0, 5, "ground", 0, 1],
  "shintech-st-14-hummingbird": [2000, 15, 6, 5, 2, 10, "fly", 0, 3],
  "titan-td-66-kraken": [10000, 16, 8, 20, 5, 15, "swim", 2, 99]
});
const expectedDroneIdentity = Object.freeze({
  "blackhound-bh-10-roach": [
    "Blackhound BH-10 Roach", "Blackhound", "BH-10 Roach", "R42145e262e8d20d"
  ],
  "ironbark-sunfish": [
    "Ironbark Sunfish", "Ironbark", "Sunfish", "Rea6ae80977efd63"
  ],
  "titan-td-70-kerberos": [
    "Titan TD-70 Kerberos", "Titan", "TD-70 Kerberos", "R79af13e4415614d"
  ],
  "helix-hx-35-pitbull": [
    "Helix HX-35 Pitbull", "Helix", "HX-35 Pitbull", "R5ee1bd110c6ed67"
  ],
  "helix-hx-40-javelin": [
    "Helix HX-40 Javelin", "Helix", "HX-40 Javelin", "R2f54fecacb361cf"
  ],
  "shintech-st-90-shrike": [
    "ShinTech ST-90 Shrike", "ShinTech", "ST-90 Shrike", "Rc33b716df8ce944"
  ],
  "ironbark-mouse": [
    "Ironbark Mouse", "Ironbark", "Mouse", "R78ef1dfc7782e88"
  ],
  "shintech-st-14-hummingbird": [
    "ShinTech ST-14 Hummingbird", "ShinTech", "ST-14 Hummingbird", "R2cfbbf8f5bbbdbd"
  ],
  "titan-td-66-kraken": [
    "Titan TD-66 Kraken", "Titan", "TD-66 Kraken", "Rbbca4ae08806107"
  ]
});
const expectedDroneScales = Object.freeze({
  "blackhound-bh-10-roach": 0.7,
  "ironbark-sunfish": 0.7,
  "titan-td-70-kerberos": 0.9,
  "helix-hx-35-pitbull": 0.8,
  "helix-hx-40-javelin": 0.8,
  "shintech-st-90-shrike": 1,
  "ironbark-mouse": 0.6,
  "shintech-st-14-hummingbird": 0.6,
  "titan-td-66-kraken": 0.9
});
const droneSourceRoot = path.join(moduleRoot, "data", "drones");
const droneSourceFiles = (await fs.readdir(droneSourceRoot))
  .filter((name) => name.endsWith(".json"))
  .sort();
if (droneSourceFiles.length !== Object.keys(expectedDrones).length) {
  throw new Error(`Drone source directory contains ${droneSourceFiles.length} entries, expected nine.`);
}
for (const filename of droneSourceFiles) {
  const source = JSON.parse(await fs.readFile(path.join(droneSourceRoot, filename), "utf8"));
  const identity = expectedDroneIdentity[source.sourceKey];
  if (
    filename !== `${source.sourceKey}.json`
    || !identity
    || source.name !== identity[0]
    || source.manufacturer !== identity[1]
    || source.model !== identity[2]
    || source.actorId !== identity[3]
  ) {
    throw new Error(`Drone source "${filename}" has invalid identity metadata.`);
  }
  if (/\b(?:Shintetsu|BanTech|Sui|Lem Robotics|NAMU|Kessler)\b/i.test(JSON.stringify(source))) {
    throw new Error(`Drone source "${filename}" retains a superseded manufacturer name.`);
  }
}
const dronePack = loadedPacks.get("cwn-drones");
const droneKeys = new Set();
const droneTokenHashes = new Set();
for (const actor of dronePack.items) {
  const flags = getProperty(actor, `flags.${CONTENT_PACK_FLAG_SCOPE}`);
  const sourceKey = flags?.catalogueKey;
  const expected = expectedDrones[sourceKey];
  const identity = expectedDroneIdentity[sourceKey];
  if (!expected || !identity || droneKeys.has(sourceKey) || actor.name !== identity[0]) {
    throw new Error(`Drone "${actor.name}" has an invalid or duplicate catalogue key.`);
  }
  droneKeys.add(sourceKey);
  const [cost, ac, traumaTarget, hp, fittings, speed, moveType, hardpoints, enc] = expected;
  const [, manufacturer, model, actorId] = identity;
  if (
    actor.type !== "drone"
    || actor.system?.cost !== cost
    || actor.system?.ac !== ac
    || actor.system?.traumaTarget !== traumaTarget
    || actor.system?.health?.max !== hp
    || actor.system?.health?.value !== hp
    || actor.system?.fittings?.max !== fittings
    || actor.system?.fittings?.value !== fittings
    || actor.system?.speed !== speed
    || actor.system?.moveType !== moveType
    || actor.system?.hardpoints?.max !== hardpoints
    || actor.system?.hardpoints?.value !== hardpoints
    || actor.system?.enc !== enc
    || actor.system?.model !== "custom"
    || actor.system?.customModel !== model
    || flags?.manufacturer !== manufacturer
    || flags?.model !== model
    || typeof actor.system?.description !== "string"
    || actor.system.description.trim() === ""
  ) {
    throw new Error(`Drone "${actor.name}" has invalid native SWNR fields.`);
  }
  if (
    !Array.isArray(actor.items)
    || actor.items.length !== 0
    || !Array.isArray(actor.effects)
    || actor.effects.length !== 0
  ) {
    throw new Error(`Drone "${actor.name}" must not include optional equipment or Active Effects.`);
  }
  if (actor._id !== actorId) {
    throw new Error(`Drone "${actor.name}" did not preserve its established Actor ID.`);
  }
  const expectedTokenPath = `modules/cwn-content-pack/assets/tokens/drones/${sourceKey}.webp`;
  if (
    actor.img !== expectedTokenPath
    || actor.prototypeToken?.texture?.src !== expectedTokenPath
    || actor.prototypeToken?.name !== model
    || actor.prototypeToken?.displayName !== 30
    || actor.prototypeToken?.disposition !== 1
    || actor.prototypeToken?.sight?.enabled !== true
    || actor.prototypeToken?.width !== 1
    || actor.prototypeToken?.height !== 1
    || actor.prototypeToken?.texture?.scaleX !== expectedDroneScales[sourceKey]
    || actor.prototypeToken?.texture?.scaleY !== expectedDroneScales[sourceKey]
  ) {
    throw new Error(`Drone "${actor.name}" has invalid artwork or prototype-token defaults.`);
  }
  const tokenBytes = await fs.readFile(moduleAssetPath(actor.img));
  if (
    tokenBytes.subarray(0, 4).toString("ascii") !== "RIFF"
    || tokenBytes.subarray(8, 12).toString("ascii") !== "WEBP"
  ) {
    throw new Error(`Drone "${actor.name}" token is not a WebP image.`);
  }
  const vp8xOffset = tokenBytes.indexOf(Buffer.from("VP8X"));
  if (vp8xOffset < 0) throw new Error(`Drone "${actor.name}" token lacks WebP metadata.`);
  const dataOffset = vp8xOffset + 8;
  const width = tokenBytes.readUIntLE(dataOffset + 4, 3) + 1;
  const height = tokenBytes.readUIntLE(dataOffset + 7, 3) + 1;
  if (!(tokenBytes[dataOffset] & 0x10) || width !== 512 || height !== 512) {
    throw new Error(`Drone "${actor.name}" token must be a 512px WebP with transparency.`);
  }
  const tokenHash = crypto.createHash("sha256").update(tokenBytes).digest("hex");
  if (droneTokenHashes.has(tokenHash)) {
    throw new Error(`Drone "${actor.name}" does not have distinct token artwork.`);
  }
  droneTokenHashes.add(tokenHash);
}
if (droneKeys.size !== 9 || Object.keys(expectedDrones).some((key) => !droneKeys.has(key))) {
  throw new Error("Drone compendium does not contain the exact approved nine-Actor manifest.");
}
const shippedDroneAssets = (await fs.readdir(path.join(moduleRoot, "assets", "tokens", "drones")))
  .sort();
const expectedDroneAssets = Object.keys(expectedDrones).map((key) => `${key}.webp`).sort();
if (
  shippedDroneAssets.length !== expectedDroneAssets.length
  || expectedDroneAssets.some((name, index) => shippedDroneAssets[index] !== name)
) {
  throw new Error(
    "Drone token directory must contain only the nine production WebPs; "
    + "captions, concept sheets, and other working files must not be shipped."
  );
}

console.log(
  "Validated 64 weapons (52 reloadable), 14 armor items, 14 ammunition items, "
  + "27 Common Operator Gear items, 88 cyberware items, and nine drone Actors; all deterministic IDs, "
  + "folder relationships, icons, metadata, and SWNR fields are valid."
);
