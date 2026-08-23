import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { CWN_FOCI } from "../scripts/focus-catalogue.mjs";

const moduleRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const moduleRequire = createRequire(path.join(moduleRoot, "package.json"));
const YAML = moduleRequire("yaml");
const { compilePack, extractPack } = await import("@foundryvtt/foundryvtt-cli");

export const FOCUS_PACK_NAME = "cwn-foci";
export const EXPECTED_FOCUS_COUNT = 26;
const sourcePack = path.join(moduleRoot, "src", "packs", FOCUS_PACK_NAME);
const outputPack = path.join(moduleRoot, "packs", FOCUS_PACK_NAME);
const verifyPack = path.join(moduleRoot, ".build", `verify-${FOCUS_PACK_NAME}`);

export const stableFocusId = (focusKey) => {
  const digest = crypto.createHash("sha256").update(`cwn-focus:${focusKey}`).digest("hex");
  return `F${digest}`.slice(0, 16);
};

const stats = Object.freeze({
  compendiumSource: null,
  duplicateSource: null,
  exportSource: null,
  coreVersion: "13.351",
  systemId: "swnr",
  systemVersion: "2.3.1"
});

const escapeHtml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;");

if (CWN_FOCI.length !== EXPECTED_FOCUS_COUNT) {
  throw new Error(`Expected ${EXPECTED_FOCUS_COUNT} Focus definitions, found ${CWN_FOCI.length}.`);
}
const keys = new Set();
const names = new Set();
const ids = new Set();
for (const focus of CWN_FOCI) {
  const id = stableFocusId(focus.focusKey);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(focus.focusKey)) throw new Error(`Invalid focusKey "${focus.focusKey}".`);
  if (![1, 2].includes(focus.maxLevel)) throw new Error(`${focus.name} has invalid maxLevel.`);
  if (!focus.level1 || (focus.maxLevel === 2 && !focus.level2)) throw new Error(`${focus.name} is missing level text.`);
  if (keys.has(focus.focusKey) || names.has(focus.name) || ids.has(id)) throw new Error(`Duplicate Focus identity for ${focus.name}.`);
  keys.add(focus.focusKey); names.add(focus.name); ids.add(id);
  await fs.access(path.join(moduleRoot, "assets", "icons", "foci", `${focus.focusKey}.svg`));
}

await fs.rm(sourcePack, { recursive: true, force: true });
await fs.rm(outputPack, { recursive: true, force: true });
await fs.mkdir(sourcePack, { recursive: true });

for (const [index, focus] of CWN_FOCI.entries()) {
  const id = stableFocusId(focus.focusKey);
  const level2 = focus.maxLevel === 2
    ? `<h3>Level 2</h3><p>${escapeHtml(focus.level2)}</p>`
    : "";
  const document = {
    name: focus.name,
    type: "feature",
    img: `modules/cwn-content-pack/assets/icons/foci/${focus.focusKey}.svg`,
    folder: null,
    flags: {
      "cwn-content-pack": {
        focusKey: focus.focusKey,
        maxLevel: focus.maxLevel,
        skillAwards: focus.skillAwards ?? [],
        configuration: focus.configuration ?? [],
        automation: focus.automation ?? [],
        sourceName: "Cities Without Number core Foci",
        provenance: "Original rules summary derived from the standard CWN Focus section (pp. 18-23)."
      }
    },
    system: {
      description: `<h3>Level 1</h3><p>${escapeHtml(focus.level1)}</p>${level2}`,
      favorite: false,
      level: 1,
      type: "focus",
      poolsGranted: [],
      modDesc: null,
      condition: "perfect",
      gmNotes: focus.focusKey === "unique-gift" ? "Record the GM-approved Unique Gift here." : null,
      showGMNotes: false
    },
    effects: [],
    ownership: { default: 0 },
    _id: id,
    sort: (index + 1) * 1000,
    _stats: stats,
    _key: `!items!${id}`
  };
  await fs.writeFile(path.join(sourcePack, `${focus.focusKey}.yml`), YAML.stringify(document), "utf8");
}

await compilePack(sourcePack, outputPack, { yaml: true, log: true });
let count = 0;
const foundKeys = new Set();
await fs.rm(verifyPack, { recursive: true, force: true });
await extractPack(outputPack, verifyPack, {
  yaml: true,
  log: false,
  transformEntry: async (entry) => {
    if (entry.type === "feature" && entry.system?.type === "focus") {
      count += 1;
      const key = entry.flags?.["cwn-content-pack"]?.focusKey;
      if (foundKeys.has(key)) throw new Error(`Duplicate compiled Focus key "${key}".`);
      foundKeys.add(key);
    }
    return entry;
  }
});
await fs.rm(verifyPack, { recursive: true, force: true });
if (count !== EXPECTED_FOCUS_COUNT || foundKeys.size !== EXPECTED_FOCUS_COUNT) {
  throw new Error(`Compiled Focus verification expected ${EXPECTED_FOCUS_COUNT}, found ${count}.`);
}
console.log(`Built and verified ${count} deterministic CWN Focus Items.`);

