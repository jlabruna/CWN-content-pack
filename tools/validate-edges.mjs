import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { CWN_EDGES } from "../scripts/edge-catalogue.mjs";
const stableEdgeId = (key) => `E${crypto.createHash("sha256").update(`cwn-edge:${key}`).digest("hex")}`.slice(0, 16);

const { extractPack } = await import("@foundryvtt/foundryvtt-cli");
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const scratch = path.join(root, ".build", "validate-cwn-operator-edges");
const entries = [];
await fs.rm(scratch, { recursive: true, force: true });
await extractPack(path.join(root, "packs", "cwn-operator-edges"), scratch, { yaml: true, log: false, transformEntry: async (entry) => { entries.push(entry); return entry; } });
await fs.rm(scratch, { recursive: true, force: true });
const edges = entries.filter((entry) => entry.type === "feature" && entry.system?.type === "edge");
if (edges.length !== 15 || edges.filter((entry) => entry.flags?.["cwn-content-pack"]?.selectableEdge).length !== 14) throw new Error("Edge pack must contain 14 selectable Edges and one Underdog reference.");
const keys = new Set();
for (const item of edges) {
  const meta = item.flags?.["cwn-content-pack"];
  const source = CWN_EDGES.find((entry) => entry.edgeKey === meta?.edgeKey);
  if (!source || item.name !== source.name || item._id !== stableEdgeId(source.edgeKey) || keys.has(source.edgeKey)) throw new Error(`Edge identity mismatch: ${item.name}`);
  keys.add(source.edgeKey);
  if (meta.selectableEdge !== source.selectable || !Array.isArray(meta.skillAwards) || !Array.isArray(meta.automation) || item.system.level !== 0 || item.effects?.length) throw new Error(`Edge metadata mismatch: ${item.name}`);
  await fs.access(path.join(root, "assets", "icons", "edges", `${source.edgeKey}.svg`));
}
console.log("Validated 14 native Operator Edges, Underdog reference, metadata, deterministic IDs, and icons.");
