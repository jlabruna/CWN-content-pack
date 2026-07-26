import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const moduleRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const releaseRoot = path.join(moduleRoot, "release");
const stagedModule = path.join(releaseRoot, "cwn-content-pack");
const githubUpload = path.join(releaseRoot, "github-upload");
const githubPackagingFix = path.join(releaseRoot, "github-fix-v0.4.1");
const manifest = JSON.parse(await fs.readFile(path.join(moduleRoot, "module.json"), "utf8"));

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
}

const stagedAmmunitionIcons = await fs.readdir(
  path.join(stagedModule, "assets", "icons", "ammunition")
);
if (stagedAmmunitionIcons.filter((name) => name.endsWith(".svg")).length !== 14) {
  throw new Error("Staged release must contain exactly 14 ammunition SVG icons.");
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
  "MANUAL-TESTS.md"
]) {
  await fs.copyFile(path.join(moduleRoot, filename), path.join(githubUpload, filename));
}

// Small browser-upload bundle for repairing the incomplete v0.4.0 tag without
// requiring the full source tree to be uploaded again.
await fs.rm(githubPackagingFix, { recursive: true, force: true });
await fs.mkdir(path.join(githubPackagingFix, ".github", "workflows"), {
  recursive: true
});
await fs.mkdir(path.join(githubPackagingFix, "tools"), { recursive: true });

await fs.copyFile(
  path.join(moduleRoot, ".github", "workflows", "build-release.yml"),
  path.join(githubPackagingFix, ".github", "workflows", "build-release.yml")
);
for (const filename of [
  "generate-ammunition-icons.mjs",
  "validate-content.mjs",
  "verify-deterministic-build.mjs",
  "stage-release.mjs"
]) {
  await fs.copyFile(
    path.join(moduleRoot, "tools", filename),
    path.join(githubPackagingFix, "tools", filename)
  );
}
for (const filename of [
  ".gitignore",
  "module.json",
  "package.json",
  "README.md",
  "CHANGELOG.md",
  "MANUAL-TESTS.md"
]) {
  await fs.copyFile(
    path.join(moduleRoot, filename),
    path.join(githubPackagingFix, filename)
  );
}

console.log(
  `Staged CWN Content Pack ${manifest.version} at ${stagedModule} `
  + `and browser-upload sources at ${githubUpload}. `
  + `Packaging repair files are at ${githubPackagingFix}.`
);
