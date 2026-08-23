import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const { extractPack } = await import("@foundryvtt/foundryvtt-cli");
const moduleRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const systemRoot = process.argv[2] ? path.resolve(process.argv[2]) : null;
if (!systemRoot) {
  throw new Error("Pass the SWNR 2.3.1 repository path to verify-deterministic-build.mjs.");
}

const packNames = [
  "harbour-city-stories-weapons",
  "harbour-city-stories-armor",
  "cwn-ammunition",
  "cwn-common-operator-gear",
  "cwn-cyberware",
  "cwn-drones",
  "cwn-foci"
];

const sortObject = (value) => {
  if (Array.isArray(value)) return value.map(sortObject);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, sortObject(value[key])])
    );
  }
  return value;
};

const snapshotGeneratedContent = async (label) => {
  const content = {};
  for (const packName of packNames) {
    const extractPath = path.join(moduleRoot, ".build", `determinism-${label}-${packName}`);
    const entries = [];
    await fs.rm(extractPath, { recursive: true, force: true });
    await extractPack(path.join(moduleRoot, "packs", packName), extractPath, {
      yaml: true,
      log: false,
      transformEntry: async (entry) => {
        entries.push(sortObject(structuredClone(entry)));
        return entry;
      }
    });
    await fs.rm(extractPath, { recursive: true, force: true });
    content[packName] = entries.sort((a, b) =>
      String(a._key ?? a._id).localeCompare(String(b._key ?? b._id))
    );
  }

  const iconRoot = path.join(moduleRoot, "assets", "icons", "ammunition");
  content.ammunitionIcons = {};
  for (const filename of (await fs.readdir(iconRoot)).sort()) {
    const bytes = await fs.readFile(path.join(iconRoot, filename));
    content.ammunitionIcons[filename] = crypto
      .createHash("sha256")
      .update(bytes)
      .digest("hex");
  }

  const gearIconRoot = path.join(
    moduleRoot,
    "assets",
    "icons",
    "gear",
    "common-operator-gear"
  );
  content.commonOperatorGearIcons = {};
  for (const filename of (await fs.readdir(gearIconRoot)).sort()) {
    const bytes = await fs.readFile(path.join(gearIconRoot, filename));
    content.commonOperatorGearIcons[filename] = crypto
      .createHash("sha256")
      .update(bytes)
      .digest("hex");
  }

  const cyberwareIconRoot = path.join(moduleRoot, "assets", "icons", "cyberware");
  content.cyberwareIcons = {};
  for (const filename of (await fs.readdir(cyberwareIconRoot)).sort()) {
    const bytes = await fs.readFile(path.join(cyberwareIconRoot, filename));
    content.cyberwareIcons[filename] = crypto
      .createHash("sha256")
      .update(bytes)
      .digest("hex");
  }

  const droneTokenRoot = path.join(moduleRoot, "assets", "tokens", "drones");
  content.droneTokens = {};
  for (const filename of (await fs.readdir(droneTokenRoot)).sort()) {
    const bytes = await fs.readFile(path.join(droneTokenRoot, filename));
    content.droneTokens[filename] = crypto
      .createHash("sha256")
      .update(bytes)
      .digest("hex");
  }

  const focusIconRoot = path.join(moduleRoot, "assets", "icons", "foci");
  content.focusIcons = {};
  for (const filename of (await fs.readdir(focusIconRoot)).sort()) {
    const bytes = await fs.readFile(path.join(focusIconRoot, filename));
    content.focusIcons[filename] = crypto.createHash("sha256").update(bytes).digest("hex");
  }

  return crypto
    .createHash("sha256")
    .update(JSON.stringify(sortObject(content)))
    .digest("hex");
};

const before = await snapshotGeneratedContent("before");
const commands = [
  ["tools/build-weapon-compendium.mjs", systemRoot],
  ["tools/generate-armor-icons.mjs"],
  ["tools/build-armor-compendium.mjs", systemRoot],
  ["tools/generate-ammunition-icons.mjs"],
  ["tools/build-ammunition-compendium.mjs"],
  ["tools/generate-common-operator-gear-icons.mjs"],
  ["tools/build-common-operator-gear-compendium.mjs"],
  ["tools/generate-cyberware-icons.mjs"],
  ["tools/build-cyberware-compendium.mjs"],
  ["tools/build-drone-compendium.mjs"],
  ["tools/generate-focus-icons.mjs"],
  ["tools/build-focus-compendium.mjs"]
];

for (const args of commands) {
  const result = spawnSync(process.execPath, args, {
    cwd: moduleRoot,
    encoding: "utf8",
    stdio: "pipe"
  });
  if (result.status !== 0) {
    process.stdout.write(result.stdout ?? "");
    process.stderr.write(result.stderr ?? "");
    throw new Error(`Deterministic rebuild command failed: node ${args.join(" ")}`);
  }
}

const after = await snapshotGeneratedContent("after");
if (before !== after) {
  throw new Error(
    `Deterministic rebuild mismatch: initial ${before}, rebuilt ${after}.`
  );
}

console.log(`Deterministic rebuild verified: ${after}.`);
