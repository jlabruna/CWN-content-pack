import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const { extractPack } = await import("@foundryvtt/foundryvtt-cli");
const moduleRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const releaseRoot = path.join(moduleRoot, "release");
const stagedModule = path.join(releaseRoot, "cwn-content-pack");
const githubUpload = path.join(releaseRoot, "github-upload");
const githubPatchUpload = path.join(releaseRoot, "github-upload-v0.7.4-patch");
const githubDotfilesUpload = path.join(releaseRoot, "github-dotfiles-upload");
const manifest = JSON.parse(await fs.readFile(path.join(moduleRoot, "module.json"), "utf8"));
const expectedPackCounts = Object.freeze({
  "harbour-city-stories-weapons": { type: "weapon", count: 64 },
  "harbour-city-stories-armor": { type: "armor", count: 14 },
  "cwn-ammunition": { type: "item", count: 14 },
  "cwn-common-operator-gear": { type: "item", count: 27 },
  "cwn-cyberware": { type: "cyberware", count: 88 },
  "cwn-drones": { type: "drone", count: 9 }
});

const expectedDownload =
  `/v${manifest.version}/cwn-content-pack-v${manifest.version}.zip`;
if (!manifest.download.endsWith(expectedDownload)) {
  throw new Error(`module.json has unexpected download URL "${manifest.download}".`);
}

await fs.rm(stagedModule, { recursive: true, force: true });
await fs.mkdir(stagedModule, { recursive: true });

for (const directory of ["assets", "data", "lang", "packs", "scripts", "styles"]) {
  await fs.cp(
    path.join(moduleRoot, directory),
    path.join(stagedModule, directory),
    { recursive: true }
  );
}
for (const filename of [
  "module.json",
  "README.md",
  "CHANGELOG.md",
  "LICENSE",
  "ASSET-LICENSE.md",
  "THIRD-PARTY-LICENSES.md",
  "AMMUNITION-CATALOGUE.md",
  "COMMON-OPERATOR-GEAR-CATALOGUE.md",
  "CYBERWARE-CATALOGUE.md",
  "CYBERWARE-AUDIT.md",
  "DRONE-CATALOGUE.md",
  "WEAPON-ROLL-MAPPING.md",
  "MANUAL-TESTS.md"
]) {
  await fs.copyFile(path.join(moduleRoot, filename), path.join(stagedModule, filename));
}

// Catalogue generation sources are intentionally not part of the runtime module.
await fs.rm(path.join(stagedModule, "scripts", "weapon-catalogue.mjs"), { force: true });
await fs.rm(path.join(stagedModule, "scripts", "weapon-catalogue-app.mjs"), { force: true });
await fs.rm(path.join(stagedModule, "scripts", "weapon-family-contract.mjs"), { force: true });

for (const pack of manifest.packs ?? []) {
  const packPath = path.join(stagedModule, ...pack.path.split("/"));
  const files = await fs.readdir(packPath);
  if (files.length === 0) {
    throw new Error(`Staged declared pack "${pack.name}" is empty.`);
  }
  const expected = expectedPackCounts[pack.name];
  if (!expected) {
    throw new Error(`No release count assertion exists for declared pack "${pack.name}".`);
  }
  const extractPath = path.join(moduleRoot, ".build", `stage-${pack.name}`);
  let itemCount = 0;
  await fs.rm(extractPath, { recursive: true, force: true });
  await extractPack(packPath, extractPath, {
    yaml: true,
    log: false,
    transformEntry: async (entry) => {
      if (entry?.type === expected.type) itemCount += 1;
      return entry;
    }
  });
  await fs.rm(extractPath, { recursive: true, force: true });
  if (itemCount !== expected.count) {
    throw new Error(
      `Staged pack "${pack.name}" expected ${expected.count} ${expected.type} Items `
      + `but found ${itemCount}.`
    );
  }
}

const stagedAmmunitionIcons = await fs.readdir(
  path.join(stagedModule, "assets", "icons", "ammunition")
);
if (stagedAmmunitionIcons.filter((name) => name.endsWith(".svg")).length !== 14) {
  throw new Error("Staged release must contain exactly 14 ammunition SVG icons.");
}
const stagedGearIcons = await fs.readdir(
  path.join(stagedModule, "assets", "icons", "gear", "common-operator-gear")
);
if (stagedGearIcons.filter((name) => name.endsWith(".svg")).length !== 27) {
  throw new Error("Staged release must contain exactly 27 Common Operator Gear SVG icons.");
}
const stagedCyberwareIcons = await fs.readdir(
  path.join(stagedModule, "assets", "icons", "cyberware")
);
if (stagedCyberwareIcons.filter((name) => name.endsWith(".svg")).length !== 88) {
  throw new Error("Staged release must contain exactly 88 cyberware SVG icons.");
}
const stagedDroneTokens = await fs.readdir(
  path.join(stagedModule, "assets", "tokens", "drones")
);
const expectedDroneTokens = [
  "blackhound-bh-10-roach.webp",
  "helix-hx-35-pitbull.webp",
  "helix-hx-40-javelin.webp",
  "ironbark-mouse.webp",
  "ironbark-sunfish.webp",
  "shintech-st-14-hummingbird.webp",
  "shintech-st-90-shrike.webp",
  "titan-td-66-kraken.webp",
  "titan-td-70-kerberos.webp"
].sort();
const sortedDroneTokens = stagedDroneTokens.filter((name) => name.endsWith(".webp")).sort();
if (
  sortedDroneTokens.length !== expectedDroneTokens.length
  || expectedDroneTokens.some((name, index) => sortedDroneTokens[index] !== name)
) {
  throw new Error("Staged release must contain the exact nine branded drone WebP tokens.");
}

await fs.copyFile(
  path.join(moduleRoot, "module.json"),
  path.join(releaseRoot, "module.json")
);

await fs.rm(githubUpload, { recursive: true, force: true });
await fs.mkdir(githubUpload, { recursive: true });
for (const directory of [
  ".github",
  "assets",
  "data",
  "lang",
  "scripts",
  "styles",
  "templates",
  "tools"
]) {
  await fs.cp(
    path.join(moduleRoot, directory),
    path.join(githubUpload, directory),
    { recursive: true }
  );
}
for (const filename of [
  ".gitignore",
  "module.json",
  "package.json",
  "README.md",
  "CHANGELOG.md",
  "LICENSE",
  "ASSET-LICENSE.md",
  "THIRD-PARTY-LICENSES.md",
  "AMMUNITION-CATALOGUE.md",
  "COMMON-OPERATOR-GEAR-CATALOGUE.md",
  "CYBERWARE-CATALOGUE.md",
  "CYBERWARE-AUDIT.md",
  "DRONE-CATALOGUE.md",
  "MANUAL-TESTS.md"
]) {
  await fs.copyFile(path.join(moduleRoot, filename), path.join(githubUpload, filename));
}

// A separate dotfiles bundle makes hidden browser-upload paths easy to locate
// in Windows Explorer when "Hidden items" is enabled.
await fs.rm(githubDotfilesUpload, { recursive: true, force: true });
await fs.mkdir(githubDotfilesUpload, { recursive: true });
await fs.cp(
  path.join(moduleRoot, ".github"),
  path.join(githubDotfilesUpload, ".github"),
  { recursive: true }
);
await fs.copyFile(
  path.join(moduleRoot, ".gitignore"),
  path.join(githubDotfilesUpload, ".gitignore")
);

// The V0.7.4 weapon-roll patch changes no source art or catalogue JSON. This
// compact browser-upload bundle stays below GitHub's 100-file upload limit;
// the Action rebuilds every generated pack from these updated build sources.
await fs.rm(githubPatchUpload, { recursive: true, force: true });
for (const directory of ["scripts", "tools"]) {
  await fs.mkdir(path.join(githubPatchUpload, directory), { recursive: true });
}
for (const filename of [
  "CHANGELOG.md",
  "CYBERWARE-AUDIT.md",
  "CYBERWARE-CATALOGUE.md",
  "MANUAL-TESTS.md",
  "README.md",
  "WEAPON-ROLL-MAPPING.md",
  "module.json",
  "package.json"
]) {
  await fs.copyFile(path.join(moduleRoot, filename), path.join(githubPatchUpload, filename));
}
await fs.copyFile(
  path.join(moduleRoot, "scripts", "weapon-catalogue.mjs"),
  path.join(githubPatchUpload, "scripts", "weapon-catalogue.mjs")
);
await fs.copyFile(
  path.join(moduleRoot, "scripts", "weapon-roll-contract.mjs"),
  path.join(githubPatchUpload, "scripts", "weapon-roll-contract.mjs")
);
for (const filename of [
  "build-ammunition-compendium.mjs",
  "build-armor-compendium.mjs",
  "build-common-operator-gear-compendium.mjs",
  "build-cyberware-compendium.mjs",
  "build-drone-compendium.mjs",
  "build-weapon-compendium.mjs",
  "generate-cyberware-docs.mjs",
  "stage-release.mjs",
  "validate-content.mjs",
  "verify-deterministic-build.mjs"
]) {
  await fs.copyFile(
    path.join(moduleRoot, "tools", filename),
    path.join(githubPatchUpload, "tools", filename)
  );
}

console.log(
  `Staged CWN Content Pack ${manifest.version} at ${stagedModule} `
  + `and browser-upload sources at ${githubUpload}. `
  + `The compact V0.7.4 patch upload is at ${githubPatchUpload}. `
  + `Hidden browser-upload paths are also at ${githubDotfilesUpload}.`
);
