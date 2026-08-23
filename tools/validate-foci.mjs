import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { CWN_FOCI } from "../scripts/focus-catalogue.mjs";

const stableFocusId = (focusKey) => {
  const digest = crypto.createHash("sha256").update(`cwn-focus:${focusKey}`).digest("hex");
  return `F${digest}`.slice(0, 16);
};

const { extractPack } = await import("@foundryvtt/foundryvtt-cli");
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const entries = [];
const scratch = path.join(root, ".build", "validate-cwn-foci");
await fs.rm(scratch, { recursive: true, force: true });
await extractPack(path.join(root, "packs", "cwn-foci"), scratch, {
  yaml: true, log: false,
  transformEntry: async (entry) => { entries.push(entry); return entry; }
});
await fs.rm(scratch, { recursive: true, force: true });

const foci = entries.filter((entry) => entry.type === "feature" && entry.system?.type === "focus");
if (foci.length !== 26) throw new Error(`CWN Foci pack must contain exactly 26 Focus Items; found ${foci.length}.`);
const keys = new Set(); const names = new Set(); const ids = new Set();
for (const focus of foci) {
  const metadata = focus.flags?.["cwn-content-pack"];
  const source = CWN_FOCI.find((entry) => entry.focusKey === metadata?.focusKey);
  if (!source) throw new Error(`Unexpected or missing focusKey on "${focus.name}".`);
  if (focus.name !== source.name || focus._id !== stableFocusId(source.focusKey)) throw new Error(`Deterministic identity mismatch for ${source.name}.`);
  if (keys.has(source.focusKey) || names.has(focus.name) || ids.has(focus._id)) throw new Error(`Duplicate Focus identity for ${focus.name}.`);
  keys.add(source.focusKey); names.add(focus.name); ids.add(focus._id);
  if (metadata.maxLevel !== source.maxLevel || focus.system.level !== 1) throw new Error(`Level metadata mismatch for ${focus.name}.`);
  if (!focus.system.description?.includes("<h3>Level 1</h3>") || (source.maxLevel === 2) !== focus.system.description.includes("<h3>Level 2</h3>")) throw new Error(`Level description mismatch for ${focus.name}.`);
  if (!Array.isArray(metadata.skillAwards) || !Array.isArray(metadata.automation)) throw new Error(`Automation metadata malformed for ${focus.name}.`);
  if (focus.folder !== null || focus.effects?.length) throw new Error(`${focus.name} must be folderless and effect-free.`);
  const expectedIcon = `modules/cwn-content-pack/assets/icons/foci/${source.focusKey}.svg`;
  if (focus.img !== expectedIcon) throw new Error(`Icon path mismatch for ${focus.name}.`);
  await fs.access(path.join(root, "assets", "icons", "foci", `${source.focusKey}.svg`));
}
console.log("Validated 26 CWN Foci, native feature schema, metadata, descriptions, deterministic IDs, and icons.");
