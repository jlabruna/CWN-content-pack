import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const moduleRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = path.join(moduleRoot, "data", "cyberware");
const sources = await Promise.all(
  (await fs.readdir(sourceRoot))
    .filter((name) => name.endsWith(".json"))
    .sort()
    .map(async (name) => JSON.parse(await fs.readFile(path.join(sourceRoot, name), "utf8")))
);

const escapeCell = (value) => String(value ?? "").replaceAll("|", "\\|").replaceAll("\n", " ");
const catalogueRows = sources
  .sort((left, right) => left.name.localeCompare(right.name))
  .map((item) => [
    item.name,
    item.category === "None" ? "General" : item.category,
    `$${item.system.cost.toLocaleString("en-US")}`,
    item.system.strain,
    item.system.tl,
    item.system.concealment,
    item.automationLevel
  ].map(escapeCell).join(" | "))
  .map((row) => `| ${row} |`)
  .join("\n");

const catalogue = `# CWN Cyberware Catalogue

This is the generated manifest for the **CWN Cyberware** compendium in CWN
Content & Icon Pack v0.6.0. It contains exactly 88 native SWNR 2.3.x Cyberware
Items, copied from the permitted CWN catalogue source and normalized only where
required by the current SWNR schema.

Every Item has a deterministic Item ID, a deterministic category-folder
relationship, an original transparent SVG icon, provenance metadata, an
explicit automation classification, and recurring-maintenance metadata.

| Item | Category | Cost | Strain | TL | Concealment | Automation classification |
|---|---:|---:|---:|---:|---|---|
${catalogueRows}

Cyberware copied from the compendium becomes an independent actor or World Item.
Later content-pack updates do not silently alter those copies.
`;

const groups = Map.groupBy(sources, (item) => item.automationLevel);
const groupSection = (key, title, explanation) => {
  const names = (groups.get(key) ?? []).map((item) => `- ${item.name}`).join("\n") || "- None";
  return `## ${title}\n\n${explanation}\n\n${names}\n`;
};
const audit = `# CWN Cyberware Automation Audit

All 88 catalogue entries were audited against the SWNR 2.3.x Cyberware schema
and the current Foundry VTT v13 runtime. Native Cyberware fields are preserved,
but no speculative Active Effects are embedded. SWNR itself presently automates
installed Strain; most catalogue effects require context, activation decisions,
targeting, duration, stacking, or rules adjudication that the native schema does
not safely encode.

The Content Pack stores the classification at:

\`flags["cwn-content-pack"].cyberware.automationLevel\`

It also stores the neutral maintenance contract at:

\`flags["cwn-content-pack"].cyberwareMaintenance\`

${groupSection(
  "combat-enhancements-handler",
  "Combat Enhancements handler candidate",
  "These effects are suitable candidates for an explicit companion-module handler. The Content Pack does not itself automate them."
)}
${groupSection(
  "contextual",
  "Contextual",
  "These effects depend on circumstances or a specific check and remain descriptive."
)}
${groupSection(
  "manual",
  "Manual",
  "These effects require direct GM/player adjudication or have no safe native representation."
)}
${groupSection(
  "description-only-for-now",
  "Description only for now",
  "These entries are intentionally conservative because their systemic interactions are too broad for safe automation."
)}
## Safe Active Effects

No catalogue entry is currently classified as \`safe-active-effect\`. This is
intentional: neither the source catalogue nor SWNR 2.3.x proves correct target,
transfer, stacking, activation, and disabled-cyberware semantics for a generated
Active Effect. Adding an apparently convenient effect without those guarantees
could silently corrupt actor statistics.

## Native behaviour and disabled cyberware

SWNR calculates installed Cyberware Strain from actor-owned Cyberware Items.
The native Cyberware \`disabled\` field does not automatically remove that
Strain and does not automatically disable embedded Active Effects. CWN Combat
Enhancements therefore treats disabled cyberware as installed for maintenance
unless the GM explicitly disables maintenance with the companion-module
override.
`;

await fs.writeFile(path.join(moduleRoot, "CYBERWARE-CATALOGUE.md"), catalogue, "utf8");
await fs.writeFile(path.join(moduleRoot, "CYBERWARE-AUDIT.md"), audit, "utf8");
console.log(`Generated cyberware catalogue and audit documentation for ${sources.length} Items.`);
