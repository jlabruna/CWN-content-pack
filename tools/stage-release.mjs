import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const { extractPack } = await import("@foundryvtt/foundryvtt-cli");
const moduleRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const releaseRoot = path.join(moduleRoot, "release");
const stagedModule = path.join(releaseRoot, "cwn-content-pack");
const githubUpload = path.join(releaseRoot, "github-upload");
const githubDotfilesUpload = path.join(releaseRoot, "github-dotfiles-upload");
const manifest = JSON.parse(await fs.readFile(path.join(moduleRoot, "module.json"), "utf8"));
const expectedPackCounts = Object.freeze({
  "harbour-city-stories-weapons": { type: "weapon", count: 64 },
  "harbour-city-stories-armor": { type: "armor", count: 14 },
  "cwn-ammunition": { type: "item", count: 14 },
  "cwn-common-operator-gear": { type: "item", count: 27 }
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

console.log(
  `Staged CWN Content Pack ${manifest.version} at ${stagedModule} `
  + `and browser-upload sources at ${githubUpload}. `
  + `Hidden browser-upload paths are also at ${githubDotfilesUpload}.`
);
