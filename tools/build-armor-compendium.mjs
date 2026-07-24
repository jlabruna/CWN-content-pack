import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const moduleRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const defaultSystemRoot = path.resolve(moduleRoot, "..", "..", "work", "swnr-v2.3.0");
const systemRoot = path.resolve(process.argv[2] ?? defaultSystemRoot);
const moduleRequire = createRequire(path.join(moduleRoot, "package.json"));
const YAML = moduleRequire("yaml");
const { compilePack, extractPack } = moduleRequire("@foundryvtt/foundryvtt-cli");

const sourcePack = path.join(moduleRoot, "src", "packs", "harbour-city-stories-armor");
const outputPack = path.join(moduleRoot, "packs", "harbour-city-stories-armor");
const verificationPack = path.join(moduleRoot, ".build", "verify-harbour-city-stories-armor");
const systemItems = path.join(systemRoot, "src", "packs", "cwn-items");

const slugify = (value) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const stableId = (prefix, value) => {
  const digest = crypto.createHash("sha256").update(value).digest("hex");
  return `${prefix}${digest}`.slice(0, 16);
};

const assertFoundryId = (id, label) => {
  if (!/^[A-Za-z0-9]{16}$/.test(id)) {
    throw new Error(`${label} has invalid Foundry ID "${id}".`);
  }
};

const categoryFor = (item) => {
  if (item.name === "Riot Shield") return "Shields";
  if (["Absorption Plates", "Joint Reinforcement"].includes(item.name)) return "Armor Accessories";
  return "Armor";
};

const cleanStats = {
  compendiumSource: null,
  duplicateSource: null,
  exportSource: null,
  coreVersion: "13.351",
  systemId: "swnr",
  systemVersion: "2.3.0"
};

await fs.rm(sourcePack, { recursive: true, force: true });
await fs.rm(outputPack, { recursive: true, force: true });
await fs.mkdir(sourcePack, { recursive: true });

const items = [];
for (const filename of await fs.readdir(systemItems)) {
  if (!filename.endsWith(".yml")) continue;
  const item = YAML.parse(await fs.readFile(path.join(systemItems, filename), "utf8"));
  if (item?.type !== "armor") continue;
  items.push(item);
}
items.sort((a, b) => a.name.localeCompare(b.name));

const categoryNames = ["Armor", "Armor Accessories", "Shields"];
const folders = new Map(
  categoryNames.map((name, index) => [
    name,
    {
      id: stableId("A", `armor-folder:${name}`),
      name,
      sort: (index + 1) * 100000
    }
  ])
);

for (const folder of folders.values()) {
  assertFoundryId(folder.id, `Folder "${folder.name}"`);
  const document = {
    type: "Item",
    folder: null,
    name: folder.name,
    color: null,
    sorting: "a",
    _id: folder.id,
    description: "",
    sort: folder.sort,
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

for (const [index, source] of items.entries()) {
  const slug = slugify(source.name);
  const id = stableId("R", `armor:${slug}`);
  assertFoundryId(id, `Armor "${source.name}"`);

  const item = structuredClone(source);
  item._id = id;
  item.img = `modules/cwn-content-pack/assets/icons/armor/${slug}.svg`;
  item.folder = folders.get(categoryFor(item)).id;
  item.sort = (index + 1) * 1000;
  item.flags = {
    ...item.flags,
    "cwn-content-pack": {
      catalogueKey: slug,
      sourceName: source.name
    }
  };
  item.ownership = { default: 0 };
  item._stats = cleanStats;
  item._key = `!items!${id}`;

  await fs.writeFile(path.join(sourcePack, `${slug}.yml`), YAML.stringify(item), "utf8");
}

if (items.length !== 14) {
  throw new Error(`Expected 14 armor items but generated ${items.length}.`);
}

await compilePack(sourcePack, outputPack, { yaml: true, log: true });

let compiledArmorCount = 0;
await fs.rm(verificationPack, { recursive: true, force: true });
await extractPack(outputPack, verificationPack, {
  yaml: true,
  log: false,
  transformEntry: async (entry) => {
    if (entry?.type === "armor") compiledArmorCount += 1;
  }
});
await fs.rm(verificationPack, { recursive: true, force: true });

if (compiledArmorCount !== 14) {
  throw new Error(
    `Armor compendium verification failed: expected 14 compiled armor items but found ${compiledArmorCount}.`
  );
}

console.log(
  `Built and verified ${compiledArmorCount} armor items and ${folders.size} folders.`
);
