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

if (manifest.version !== "0.10.1") {
  throw new Error(`Expected module version 0.10.1 but found ${manifest.version}.`);
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
  "harbour-city-stories-weapons": { documentType: "Item", itemType: "weapon", count: 75 },
  "harbour-city-stories-armor": { documentType: "Item", itemType: "armor", count: 14, folderCount: 3 },
  "cwn-ammunition": { documentType: "Item", itemType: "item", count: 15, folderCount: 4 },
  "cwn-common-operator-gear": { documentType: "Item", itemType: "item", count: 27, folderCount: 5 },
  "cwn-cyberware": { documentType: "Item", itemType: "cyberware", count: 88, folderCount: 8 },
  "cwn-drones": { documentType: "Actor", itemType: "drone", count: 10, folderCount: 0 },
  "cwn-foci": { documentType: "Item", itemType: "feature", count: 26, folderCount: 0 }
});
const expectedLegacyWeaponIdentityDigest =
  "ea6b624ee9c9a8fa10fdca13971315ecb7cfd332643b952c7421a08f947b936b";
const expectedReloadableWeaponCount = 53;
const expectedWeaponFolderIds = Object.freeze({
  "Advanced Big Swords": "F8f33a086f3d59f9",
  "Advanced Clubs": "Fe7db1a4cd4b8dd2",
  "Advanced Knives": "F99620609dc97727",
  "Advanced Swords": "F8e07c19b8e2e6f3",
  "Anti-Materiel Rifles": "Fd12698dddd9aa30",
  "Automatic Rifles": "F4888e4981e905cf",
  "Big Clubs": "F5071c17ce5e5759",
  "Big Swords": "Fe45b63da30a0a9c",
  "Bows": "Fc269b63c39c3ae3",
  "Clubs": "Fa790530948dd658",
  "Combat Rifles": "F4c3512e583e380b",
  "Combat Shotguns": "F05f133ab1b7e5d1",
  "Firearms": "F599b61097d459ff",
  "Harbour City Stories Weapons": "Fddf51ee48f589f6",
  "Heavy Machine Guns": "F8abb64edf07fe74",
  "Heavy Pistols": "F9e2ca596d67b4e0",
  "Heavy Weapons": "Fe50d39a6e304819",
  "Knives": "F9ad9130ddb49a42",
  "Light Pistols": "F34bb03ac3451f11",
  "Melee and Thrown Weapons": "F753a3237c32cd71",
  "Mortars": "Ff57222804d938c1",
  "Ranged Weapons": "F25fa6216971061b",
  "Rifles": "F0d1c68f217de3b1",
  "Rocket Launchers": "Fcc36dbbc8014027",
  "Semi-Auto Shotguns": "F6f172ec64fd3ba0",
  "Shotguns": "Fd070ec32c0d4587",
  "Sniper Rifles": "F485feaf01e418c5",
  "Spears": "Fa2e6e46110612d0",
  "Submachine Guns": "Fe6c9023b0147bef",
  "Swords": "Fd9c0d95198a6e86",
  "Taser Pistols": "Fe07696532b3def7",
  Unarmed: "Fc55efdc44650b52"
});
const expectedNewWeapons = Object.freeze({
  "advanced-bow-ironbark-huntsman": Object.freeze({
    name: "Ironbark Huntsman",
    base: "Advanced Bow",
    manufacturer: "Ironbark Outdoor Industries",
    cost: 500,
    id: "W46cae20c5757681",
    img: "modules/cwn-content-pack/assets/icons/weapons/ironbark/huntsman-compound-bow.svg"
  }),
  "knife-generic-broken-bottle": Object.freeze({
    name: "Broken Bottle", base: "Knife", manufacturer: "Various Manufacturers", cost: 20,
    id: "Wc8e876791c1af4b",
    img: "modules/cwn-content-pack/assets/icons/weapons/generic/broken-bottle.svg"
  }),
  "knife-generic-kitchen-knife": Object.freeze({
    name: "Kitchen Knife", base: "Knife", manufacturer: "Various Manufacturers", cost: 20,
    id: "W1c2bf1541baa254",
    img: "modules/cwn-content-pack/assets/icons/weapons/generic/kitchen-knife.svg"
  }),
  "knife-generic-shiv": Object.freeze({
    name: "Shiv", base: "Knife", manufacturer: "Various Manufacturers", cost: 20,
    id: "Wa91b567701f0b7b",
    img: "modules/cwn-content-pack/assets/icons/weapons/generic/shiv.svg"
  }),
  "club-generic-wrench": Object.freeze({
    name: "Wrench", base: "Club", manufacturer: "Various Manufacturers", cost: 50,
    id: "W7d4762e4dd0abf2",
    img: "modules/cwn-content-pack/assets/icons/weapons/generic/wrench.svg"
  }),
  "club-generic-crowbar": Object.freeze({
    name: "Crowbar", base: "Club", manufacturer: "Various Manufacturers", cost: 50,
    id: "W5d8da2aa7a0af82",
    img: "modules/cwn-content-pack/assets/icons/weapons/generic/crowbar.svg"
  }),
  "club-generic-metal-pipe": Object.freeze({
    name: "Metal Pipe", base: "Club", manufacturer: "Various Manufacturers", cost: 50,
    id: "Wda403bf7fe5e455",
    img: "modules/cwn-content-pack/assets/icons/weapons/generic/metal-pipe.svg"
  }),
  "club-generic-pool-cue": Object.freeze({
    name: "Pool Cue", base: "Club", manufacturer: "Various Manufacturers", cost: 50,
    id: "W3720edf3d024fb2",
    img: "modules/cwn-content-pack/assets/icons/weapons/generic/pool-cue.svg"
  }),
  "big-club-generic-sledgehammer": Object.freeze({
    name: "Sledgehammer", base: "Big Club", manufacturer: "Various Manufacturers", cost: 100,
    id: "W85bd585c0bae7da",
    img: "modules/cwn-content-pack/assets/icons/weapons/generic/sledgehammer.svg"
  }),
  "unarmed-generic-unarmed-attack": Object.freeze({
    name: "Unarmed Attack", base: "Unarmed Attack", manufacturer: "Various Manufacturers", cost: 0,
    id: "Wa684f6660ba6491",
    img: "modules/cwn-content-pack/assets/icons/weapons/generic/unarmed-attack.svg"
  }),
  "advanced-sword-helix-hx-47-vector": Object.freeze({
    name: "HX-47 Vector", base: "Advanced Sword", manufacturer: "Helix Dynamics", cost: 5000,
    id: "Wc7a4596d885a199",
    img: "modules/cwn-content-pack/assets/icons/weapons/helix/hx-47-vector.svg"
  })
});
const expectedProfileFields = Object.freeze({
  Knife: Object.freeze({
    "system.damage": "1d4", "system.encumbrance": 1, "system.shock.dmg": 1,
    "system.shock.ac": 15, "system.trauma.die": "1d6", "system.trauma.rating": 3,
    "system.range.normal": 10, "system.range.max": 20, "system.isNonLethal": false,
    "system.isTwoHanded": false, "system.ammo.type": "none", "system.ammo.max": 0
  }),
  Club: Object.freeze({
    "system.damage": "1d4", "system.encumbrance": 1, "system.shock.dmg": 1,
    "system.shock.ac": 18, "system.trauma.die": "1d6", "system.trauma.rating": 2,
    "system.range.normal": 10, "system.range.max": 20, "system.isNonLethal": true,
    "system.isTwoHanded": false, "system.ammo.type": "none", "system.ammo.max": 0
  }),
  "Big Club": Object.freeze({
    "system.damage": "1d10", "system.encumbrance": 2, "system.shock.dmg": 2,
    "system.shock.ac": 18, "system.trauma.die": "1d8", "system.trauma.rating": 3,
    "system.range.normal": 0, "system.range.max": 0, "system.isNonLethal": true,
    "system.isTwoHanded": true, "system.ammo.type": "none", "system.ammo.max": 0
  }),
  "Unarmed Attack": Object.freeze({
    "system.damage": "1d2", "system.encumbrance": 0, "system.shock.dmg": 0,
    "system.shock.ac": 0, "system.trauma.die": "1d6", "system.trauma.rating": 1,
    "system.range.normal": 0, "system.range.max": 0, "system.isNonLethal": true,
    "system.isTwoHanded": false, "system.ammo.type": "none", "system.ammo.max": 0
  }),
  "Advanced Bow": Object.freeze({
    "system.damage": "1d8", "system.encumbrance": 2, "system.shock.dmg": 0,
    "system.shock.ac": 0, "system.trauma.die": "1d8+1", "system.trauma.rating": 3,
    "system.range.normal": 30, "system.range.max": 200, "system.isNonLethal": false,
    "system.isTwoHanded": false, "system.ammo.type": "special", "system.ammo.max": 1,
    "system.ammo.value": 1, "system.ammo.burst": false, "system.ammo.suppress": false
  }),
  "Advanced Sword": Object.freeze({
    "system.damage": "1d10", "system.encumbrance": 1, "system.shock.dmg": 3,
    "system.shock.ac": 15, "system.trauma.die": "1d8", "system.trauma.rating": 3,
    "system.range.normal": 0, "system.range.max": 0, "system.isNonLethal": false,
    "system.isTwoHanded": false, "system.ammo.type": "none", "system.ammo.max": 0
  })
});
const expectedValcourWeapons = Object.freeze({
  "combat-rifle-shintech-kestrel": "VC-22 Kestrel",
  "combat-rifle-shintech-falcon": "VC-37 Falcon",
  "combat-rifle-shintech-peregrine": "VC-80 Peregrine",
  "submachine-gun-shintech-kitsune": "VC-14 Merlin",
  "light-pistol-shintech-suzume": "VC-5 Sparrow",
  "light-pistol-shintech-tsubame": "VC-18 Swallow",
  "heavy-pistol-shintech-ronin": "VC-6 Chevalier",
  "heavy-pistol-shintech-daimyo": "VC-9 Regent",
  "sniper-rifle-shintech-osprey": "VC-70 Osprey",
  "sniper-rifle-shintech-gyrfalcon": "VC-99 Gyrfalcon",
  "advanced-sword-shintech-raijin": "VC-55 Tempest"
});
const expectedValcourBiographySnippets = Object.freeze([
  "Valcour does not manufacture equipment for ordinary customers",
  "Valcour is a boutique luxury manufacturer",
  "Production is concentrated in a small number of highly secure ateliers",
  "catalogue is deliberately narrow",
  "Valcour maintains a tightly controlled network",
  "In Harbour City, Valcour has no ordinary retail stores",
  "Commissioned for one owner. Built beyond compromise."
]);

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
const weaponFolders = loadedPacks.get("harbour-city-stories-weapons").folders;
if (
  weaponFolders.length !== Object.keys(expectedWeaponFolderIds).length
  || weaponFolders.some((folder) => expectedWeaponFolderIds[folder.name] !== folder._id)
) {
  throw new Error("Weapon compendium folder names or deterministic IDs changed unexpectedly.");
}
const generatedWeaponFamilies = new Set();
const legacyWeaponIdentityLines = [];
const foundNewWeaponKeys = new Set();
let reloadableWeaponCount = 0;
const foundValcourKeys = new Set();
for (const weapon of weapons) {
  const sourceKey = getProperty(weapon, "flags.harbour-city-stories.catalogueKey");
  const baseWeapon = getProperty(weapon, "flags.harbour-city-stories.baseWeapon");
  const contract = contractForBaseWeapon(baseWeapon);
  const rollContract = weaponRollContractForBaseWeapon(baseWeapon);
  const family = getProperty(
    weapon,
    `flags.${CONTENT_PACK_FLAG_SCOPE}.weaponFamily`
  );
  const nativeSkill = getProperty(weapon, "flags.harbour-city-stories.nativeSkill");
  const nativeStat = getProperty(weapon, "flags.harbour-city-stories.nativeStat");
  if (!sourceKey) {
    throw new Error(`Weapon "${weapon.name}" is missing its legacy catalogueKey.`);
  }
  const expectedValcourName = expectedValcourWeapons[sourceKey];
  if (expectedValcourName) {
    foundValcourKeys.add(sourceKey);
    const expectedIconPrefix = "modules/cwn-content-pack/assets/icons/weapons/valcour/";
    if (
      weapon.name !== expectedValcourName
      || !weapon.img?.startsWith(expectedIconPrefix)
      || !weapon.system?.description?.includes("<strong>Manufacturer:</strong> Valcour")
      || !weapon.system.description.includes("<strong>Premium Engineering</strong>")
      || !weapon.system.description.includes("retain <strong>80%</strong>")
      || !weapon.system.description.includes("registered lawful owner")
      || !weapon.system.description.includes("authorised dealer")
      || !weapon.system.description.includes("Licensed armourers")
      || !weapon.system.description.includes("<strong>+1 bonus</strong>")
      || !weapon.system.description.includes("<h3>About Valcour</h3>")
      || expectedValcourBiographySnippets.some(
        (snippet) => !weapon.system.description.includes(snippet)
      )
      || /Shin\s*Tech|\bST-\d+\b|Kitsune|Suzume|Tsubame|Ronin|Daimyo|Raijin/i
        .test(`${weapon.name}\n${weapon.img}\n${weapon.system.description}`)
    ) {
      throw new Error(`Valcour weapon "${weapon.name}" has invalid current branding or perk text.`);
    }
  }
  const expectedNewWeapon = expectedNewWeapons[sourceKey];
  if (expectedNewWeapon) {
    foundNewWeaponKeys.add(sourceKey);
    if (
      weapon.name !== expectedNewWeapon.name
      || baseWeapon !== expectedNewWeapon.base
      || weapon.system?.cost !== expectedNewWeapon.cost
      || weapon._id !== expectedNewWeapon.id
      || weapon.img !== expectedNewWeapon.img
      || getProperty(weapon, "flags.harbour-city-stories.manufacturer")
        !== expectedNewWeapon.manufacturer
      || typeof weapon.system?.description !== "string"
      || weapon.system.description.trim() === ""
      || !weapon.system.description.includes("<h3>Sale Price</h3>")
    ) {
      throw new Error(`New weapon "${weapon.name}" has invalid identity or catalogue metadata.`);
    }
    for (const [field, expectedValue] of Object.entries(expectedProfileFields[baseWeapon])) {
      if (getProperty(weapon, field) !== expectedValue) {
        throw new Error(
          `New weapon "${weapon.name}" must use ${baseWeapon} ${field} "${expectedValue}".`
        );
      }
    }
    if (sourceKey === "advanced-sword-helix-hx-47-vector") {
      if (
        getProperty(weapon, `flags.${CONTENT_PACK_FLAG_SCOPE}.modificationPolicy`) !== "none"
        || getProperty(weapon, `flags.${CONTENT_PACK_FLAG_SCOPE}.samePhysicalObjectKey`)
          !== "helix-hx-47-vector"
        || !weapon.system.description.includes("one physical object")
        || !weapon.system.description.includes("cannot accept weapon modifications")
        || !weapon.system.description.includes("ordinary Advanced Sword value of 1,000 credits")
        || !weapon.system.description.includes("100&cent;&ndash;250&cent;")
        || !weapon.system.description.includes("500&cent;")
      ) {
        throw new Error("HX-47 Vector weapon has invalid closed-chassis, shared-object, or resale rules.");
      }
    }
    const icon = await fs.readFile(moduleAssetPath(weapon.img), "utf8");
    if (!/<svg\b/.test(icon) || !/viewBox="0 0 512 512"/.test(icon)) {
      throw new Error(`New weapon "${weapon.name}" has an invalid square SVG icon.`);
    }
  } else {
    legacyWeaponIdentityLines.push(`${sourceKey}:${weapon._id}`);
  }
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
  if (nativeSkill !== rollContract.skill) {
    throw new Error(
      `Weapon "${weapon.name}" must declare native skill "${rollContract.skill}".`,
    );
  }
  if (nativeStat !== rollContract.stat) {
    throw new Error(
      `Weapon "${weapon.name}" must declare native stat "${rollContract.stat}".`,
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
if (
  foundValcourKeys.size !== Object.keys(expectedValcourWeapons).length
  || Object.keys(expectedValcourWeapons).some((key) => !foundValcourKeys.has(key))
) {
  throw new Error("Weapon compendium does not contain the exact eleven Valcour products.");
}
if (
  foundNewWeaponKeys.size !== Object.keys(expectedNewWeapons).length
  || Object.keys(expectedNewWeapons).some((key) => !foundNewWeaponKeys.has(key))
) {
  throw new Error("Weapon compendium does not contain the exact ten requested new weapons.");
}
if (reloadableWeaponCount !== expectedReloadableWeaponCount) {
  throw new Error(
    `Expected ${expectedReloadableWeaponCount} reloadable weapons but found `
    + `${reloadableWeaponCount}.`
  );
}
const legacyWeaponIdentityDigest = crypto
  .createHash("sha256")
  .update(legacyWeaponIdentityLines.sort().join("\n"))
  .digest("hex");
if (legacyWeaponIdentityDigest !== expectedLegacyWeaponIdentityDigest) {
  throw new Error("Existing deterministic weapon IDs changed unexpectedly.");
}

const ammunition = loadedPacks.get("cwn-ammunition").items;
const ammunitionIconPaths = new Set();
const ammunitionIds = new Set();
let arrowsItem;
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
  if (item.name === "Arrows") arrowsItem = item;

  const iconPath = moduleAssetPath(item.img);
  const icon = await fs.readFile(iconPath, "utf8");
  if (!/<svg\b/.test(icon) || !/viewBox="0 0 512 512"/.test(icon)) {
    throw new Error(`Ammunition "${item.name}" has an invalid square SVG icon.`);
  }
  if (/<rect\b[^>]*\bfill=(?!["']none["'])/i.test(icon)) {
    throw new Error(`Ammunition "${item.name}" icon has a non-transparent background.`);
  }
}
if (
  !arrowsItem
  || arrowsItem._id !== "Ueb717a02f4bf354"
  || arrowsItem.system?.cost !== 20
  || arrowsItem.system?.uses?.value !== 20
  || arrowsItem.system?.uses?.max !== 20
  || arrowsItem.system?.uses?.ammo !== "special"
  || getProperty(arrowsItem, `flags.${CONTENT_PACK_FLAG_SCOPE}.magazineFamily`) !== "bow"
  || !arrowsItem.system?.description?.includes("<strong>Fence:</strong> 2&cent;&ndash;5&cent;")
  || !arrowsItem.system.description.includes("<strong>Legally Owned:</strong> 10&cent;")
) {
  throw new Error("Arrows ammunition has invalid quantity, pricing, family, or sale metadata.");
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
  "valcour-vc-90-shrike": [25000, 18, 8, 20, 6, 30, "fly", 2, 99],
  "ironbark-mouse": [500, 13, 6, 1, 0, 5, "ground", 0, 1],
  "valcour-vc-14-hummingbird": [2000, 15, 6, 5, 2, 10, "fly", 0, 3],
  "titan-td-66-kraken": [10000, 16, 8, 20, 5, 15, "swim", 2, 99],
  "helix-hx-47-vector": [5000, 15, 6, 5, 0, 20, "fly", 0, 0]
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
  "helix-hx-47-vector": [
    "Helix HX-47 Vector", "Helix", "HX-47 Vector", "Re973991e9ac9cde"
  ],
  "valcour-vc-90-shrike": [
    "Valcour VC-90 Shrike", "Valcour", "VC-90 Shrike", "Rc33b716df8ce944"
  ],
  "ironbark-mouse": [
    "Ironbark Mouse", "Ironbark", "Mouse", "R78ef1dfc7782e88"
  ],
  "valcour-vc-14-hummingbird": [
    "Valcour VC-14 Hummingbird", "Valcour", "VC-14 Hummingbird", "R2cfbbf8f5bbbdbd"
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
  "helix-hx-47-vector": 0.6,
  "valcour-vc-90-shrike": 1,
  "ironbark-mouse": 0.6,
  "valcour-vc-14-hummingbird": 0.6,
  "titan-td-66-kraken": 0.9
});
const droneSourceRoot = path.join(moduleRoot, "data", "drones");
const droneSourceFiles = (await fs.readdir(droneSourceRoot))
  .filter((name) => name.endsWith(".json"))
  .sort();
if (droneSourceFiles.length !== Object.keys(expectedDrones).length) {
  throw new Error(`Drone source directory contains ${droneSourceFiles.length} entries, expected ten.`);
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
  if (/Shin\s*Tech|\bST-(?:14|90)\b/i.test(JSON.stringify(source))) {
    throw new Error(`Drone source "${filename}" retains superseded ShinTech branding.`);
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
    || /Shin\s*Tech|\bST-(?:14|90)\b/i.test(
      `${actor.name}\n${actor.img}\n${actor.system.description}`
    )
  ) {
    throw new Error(`Drone "${actor.name}" has invalid native SWNR fields.`);
  }
  const isVector = sourceKey === "helix-hx-47-vector";
  if (
    !Array.isArray(actor.items)
    || (!isVector && actor.items.length !== 0)
    || (isVector && actor.items.length !== 1)
    || !Array.isArray(actor.effects)
    || actor.effects.length !== 0
  ) {
    throw new Error(`Drone "${actor.name}" has invalid embedded equipment or Active Effects.`);
  }
  if (isVector) {
    const attack = actor.items[0];
    if (
      flags?.modificationPolicy !== "none"
      || flags?.samePhysicalObjectKey !== "helix-hx-47-vector"
      || flags?.controlMode !== "direct-only"
      || flags?.noTouchWeb?.damage !== "2d6"
      || flags?.noTouchWeb?.nonLethal !== true
      || flags?.noTouchWeb?.discharges !== 5
      || attack._id !== "I3572cf3dccfa386"
      || attack.name !== "Integral Advanced Sword"
      || attack.system?.damage !== "1d10"
      || attack.system?.trauma?.die !== "1d8"
      || attack.system?.trauma?.rating !== 3
      || attack.system?.shock?.dmg !== 0
      || attack.system?.shock?.ac !== 0
      || attack.system?.encumbrance !== 0
      || getProperty(attack, `flags.${CONTENT_PACK_FLAG_SCOPE}.modificationPolicy`) !== "none"
      || !actor.system.description.includes("five discharges")
      || !actor.system.description.includes("permanently fry")
      || !actor.system.description.includes("one physical object")
    ) {
      throw new Error("HX-47 Vector drone rules, integral attack, or closed-chassis metadata are invalid.");
    }
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
if (droneKeys.size !== 10 || Object.keys(expectedDrones).some((key) => !droneKeys.has(key))) {
  throw new Error("Drone compendium does not contain the exact approved ten-Actor manifest.");
}
const shippedDroneAssets = (await fs.readdir(path.join(moduleRoot, "assets", "tokens", "drones")))
  .sort();
const expectedDroneAssets = Object.keys(expectedDrones).map((key) => `${key}.webp`).sort();
if (
  shippedDroneAssets.length !== expectedDroneAssets.length
  || expectedDroneAssets.some((name, index) => shippedDroneAssets[index] !== name)
) {
  throw new Error(
    "Drone token directory must contain only the ten production WebPs; "
    + "captions, concept sheets, and other working files must not be shipped."
  );
}

console.log(
  "Validated 75 weapons (53 reloadable), 14 armor items, 15 ammunition items, "
  + "27 Common Operator Gear items, 88 cyberware items, and ten drone Actors; all deterministic IDs, "
  + "folder relationships, icons, metadata, and SWNR fields are valid."
);
