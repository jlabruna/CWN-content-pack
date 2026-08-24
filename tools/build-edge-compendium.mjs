import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { CWN_EDGES } from "../scripts/edge-catalogue.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(path.join(root, "package.json"));
const YAML = require("yaml");
const { compilePack, extractPack } = await import("@foundryvtt/foundryvtt-cli");
export const EDGE_PACK_NAME = "cwn-operator-edges";
export const EXPECTED_EDGE_COUNT = 14;
export const EXPECTED_DOCUMENT_COUNT = 15;
export const stableEdgeId = (key) => `E${crypto.createHash("sha256").update(`cwn-edge:${key}`).digest("hex")}`.slice(0, 16);
const source = path.join(root, "src", "packs", EDGE_PACK_NAME);
const output = path.join(root, "packs", EDGE_PACK_NAME);
const verify = path.join(root, ".build", `verify-${EDGE_PACK_NAME}`);
const stats = Object.freeze({ compendiumSource: null, duplicateSource: null, exportSource: null, coreVersion: "13.351", systemId: "swnr", systemVersion: "2.3.1" });
const escape = (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

if (CWN_EDGES.length !== EXPECTED_DOCUMENT_COUNT || CWN_EDGES.filter((e) => e.selectable).length !== EXPECTED_EDGE_COUNT) throw new Error("Edge catalogue count mismatch.");
const keys = new Set(); const names = new Set(); const ids = new Set();
for (const edge of CWN_EDGES) {
  const id = stableEdgeId(edge.edgeKey);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(edge.edgeKey) || keys.has(edge.edgeKey) || names.has(edge.name) || ids.has(id)) throw new Error(`Invalid or duplicate Edge identity: ${edge.name}`);
  keys.add(edge.edgeKey); names.add(edge.name); ids.add(id);
  await fs.access(path.join(root, "assets", "icons", "edges", `${edge.edgeKey}.svg`));
}
await fs.rm(source, { recursive: true, force: true }); await fs.rm(output, { recursive: true, force: true }); await fs.mkdir(source, { recursive: true });
for (const [index, edge] of CWN_EDGES.entries()) {
  const id = stableEdgeId(edge.edgeKey);
  const document = {
    name: edge.name, type: "feature", img: `modules/cwn-content-pack/assets/icons/edges/${edge.edgeKey}.svg`, folder: null,
    flags: { "cwn-content-pack": { edgeKey: edge.edgeKey, selectableEdge: edge.selectable, skillAwards: edge.skillAwards ?? [], configuration: edge.configuration ?? [], automation: edge.automation ?? [], sourceName: edge.selectable ? "Cities Without Number Operator Edges" : "Cities Without Number character creation", provenance: "Original rules summary derived from the standard CWN Operator Edge and Underdog sections (pp. 16-17 and 24)." } },
    system: { description: `<h3>${edge.selectable ? "Operator Edge" : "Character-Creation Reference"}</h3><p>${escape(edge.description)}</p>`, favorite: false, level: 0, type: "edge", poolsGranted: [], modDesc: null, condition: "perfect", gmNotes: null, showGMNotes: false },
    effects: [], ownership: { default: 0 }, _id: id, sort: (index + 1) * 1000, _stats: stats, _key: `!items!${id}`
  };
  await fs.writeFile(path.join(source, `${edge.edgeKey}.yml`), YAML.stringify(document), "utf8");
}
await compilePack(source, output, { yaml: true, log: true });
let total = 0; let selectable = 0;
await fs.rm(verify, { recursive: true, force: true });
await extractPack(output, verify, { yaml: true, log: false, transformEntry: async (entry) => { if (entry.type === "feature" && entry.system?.type === "edge") { total += 1; if (entry.flags?.["cwn-content-pack"]?.selectableEdge) selectable += 1; } return entry; } });
await fs.rm(verify, { recursive: true, force: true });
if (total !== EXPECTED_DOCUMENT_COUNT || selectable !== EXPECTED_EDGE_COUNT) throw new Error(`Compiled Edge verification found ${selectable}/${total}.`);
console.log(`Built and verified ${selectable} Operator Edges plus the Underdog reference.`);
