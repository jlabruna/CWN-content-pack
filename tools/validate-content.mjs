import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  CONTENT_PACK_FLAG_SCOPE,
  FAMILY_SLUG_PATTERN,
  contractForBaseWeapon
} from "../scripts/weapon-family-contract.mjs";

const { extractPack } = await import("@foundryvtt/foundryvtt-cli");
const moduleRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(await fs.readFile(path.join(moduleRoot, "module.json"), "utf8"));

const expectedPacks = Object.freeze({
  "harbour-city-stories-weapons": { itemType: "weapon", count: 64 },
  "harbour-city-stories-armor": { itemType: "armor", count: 14 },
  "cwn-ammunition": { itemType: "item", count: 14 }
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
  if (declaration.type !== "Item" || declaration.system !== "swnr") {
    throw new Error(`Pack "${packName}" must be an SWNR Item compendium.`);
  }
  if (declaration.path !== `packs/${packName}`) {
    throw new Error(`Pack "${packName}" has unexpected path "${declaration.path}".`);
  }

  const entries = await loadPack(packName);
  if (entries.length === 0) {
    throw new Error(`Declared pack "${packName}" is empty.`);
  }
  const items = entries.filter((entry) => entry.type === expected.itemType);
  const folders = entries.filter((entry) => entry.type === "Item");
  if (items.length !== expected.count) {
    throw new Error(
      `Pack "${packName}" expected ${expected.count} items but found ${items.length}.`
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
    if (typeof item.folder !== "string" || !folderIds.has(item.folder)) {
      throw new Error(
        `Item "${item.name}" in "${packName}" has unresolved folder "${item.folder}".`
      );
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

console.log(
  "Validated 64 weapons (52 reloadable), 14 armor items, 14 ammunition items, "
  + "all deterministic IDs, folder relationships, icons, and SWNR fields."
);
