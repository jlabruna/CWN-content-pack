import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const moduleRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const moduleRequire = createRequire(path.join(moduleRoot, "package.json"));
const YAML = moduleRequire("yaml");
const systemRoot = process.argv[2] ? path.resolve(process.argv[2]) : null;

if (!systemRoot) {
  throw new Error("Pass the SWNR 2.3.x repository path.");
}

const sourcePack = path.join(systemRoot, "src", "packs", "cwn-items");
const outputRoot = path.join(moduleRoot, "data", "cyberware");
const slugify = (value) =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const HANDLER_ITEMS = new Set([
  "Banshee Module",
  "Body Blades I",
  "Body Blades II",
  "Coordination Augment I",
  "Coordination Augment II",
  "Dermal Armor I",
  "Dermal Armor II",
  "Dermal Armor III",
  "Dermal Armor/Trauma Shielding",
  "Emergency Stabilization Factor",
  "Enhanced Reflexes I",
  "Enhanced Reflexes II",
  "Enhanced Reflexes III",
  "Eye Mod/Dazzler",
  "Eye Mod/Flechette Launcher",
  "Gunlink",
  "Iron Hand Aegis",
  "Limbgun",
  "Muscle Fiber Replacement I",
  "Muscle Fiber Replacement II",
  "Neural Buffer",
  "Reaction Booster I",
  "Reaction Booster II",
  "Recovery Support Unit",
  "Redundant Systems",
  "Retribution Shield",
  "Sealed Systems Implant",
  "Sharkskin Electrodes",
  "Shock Fists",
  "Skillplug Jack I",
  "Skillplug Jack II",
  "Skillplug Wiring",
  "Skull Citadel",
  "Titan Gun System",
  "Trajectory Optimization Node",
  "Viper Sting",
  "Zombie Wires"
]);

const CONTEXTUAL_ITEMS = new Set([
  "Active Sense Processor",
  "Aesthetic Augmentation Suite",
  "Ear Mod/Filter",
  "Ear Mod/Positional Detection",
  "Ear Mod/Sonar",
  "Ear Mod/Tracer",
  "Eye Mod/Impostor",
  "Eye Mod/Infrared Vision",
  "Eye Mod/Low Light Vision",
  "Eye Mod/Tactical View",
  "Eye Mod/Zoom",
  "Hemosynthetic Filter System",
  "Medical Support Readout",
  "Omnihand",
  "Poseidon Implants",
  "Remote Control Unit",
  "Skyborn Shielding",
  "Stick Pads"
]);

const DESCRIPTION_ONLY_ITEMS = new Set([
  "Cybernetic Infrastructure Baseline",
  "Full Body Conversion",
  "Therapeutic Control Dampers"
]);

const classificationFor = (name) => {
  if (HANDLER_ITEMS.has(name)) return "combat-enhancements-handler";
  if (CONTEXTUAL_ITEMS.has(name)) return "contextual";
  if (DESCRIPTION_ONLY_ITEMS.has(name)) return "description-only-for-now";
  return "manual";
};

const conciseDescription = (effect) => {
  const summary = String(effect ?? "See the catalogue rules").trim().replace(/\.$/, "");
  return `${summary}. Consult the permitted CWN rules reference for activation, limits, and special interactions.`;
};

const files = (await fs.readdir(sourcePack)).filter((name) => name.endsWith(".yml")).sort();
const records = [];
for (const filename of files) {
  const document = YAML.parse(await fs.readFile(path.join(sourcePack, filename), "utf8"));
  if (document.type !== "cyberware") continue;
  const key = slugify(document.name);
  records.push({
    sourceKey: key,
    sourceName: document.name,
    name: document.name,
    category: document.system.type,
    description: conciseDescription(document.system.effect),
    provenance: `CWN SRD via SWNR 2.3.0 cwn-items/${filename}`,
    automationLevel: classificationFor(document.name),
    maintenanceRequired: true,
    system: {
      cost: Number(document.system.cost),
      strain: Number(document.system.strain),
      tl: Number.isInteger(document.system.tl) ? document.system.tl : 4,
      type: document.system.type,
      concealment: document.system.concealment === "Obvious"
        ? "Sight"
        : document.system.concealment,
      effect: document.system.effect,
      complication: document.system.complication ?? "",
      disabled: false
    }
  });
}

const keys = new Set(records.map((record) => record.sourceKey));
if (records.length !== 88 || keys.size !== records.length) {
  throw new Error(`Expected 88 unique cyberware sources, found ${records.length}/${keys.size}.`);
}

await fs.rm(outputRoot, { recursive: true, force: true });
await fs.mkdir(outputRoot, { recursive: true });
for (const record of records) {
  await fs.writeFile(
    path.join(outputRoot, `${record.sourceKey}.json`),
    `${JSON.stringify(record, null, 2)}\n`,
    "utf8"
  );
}

console.log(`Imported ${records.length} audited cyberware source records.`);
