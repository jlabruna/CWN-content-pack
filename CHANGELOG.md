# Changelog

## 0.5.0

- Added the native 27-item **CWN Common Operator Gear** compendium.
- Organized gear into five deterministic folders: Protective Gear, Carry and
  Clothing, Tools and Field Gear, Electronics, and Services and Supplies.
- Added 27 distinct original transparent-background SVG gear icons.
- Added native SWNR containers for Backpack (capacity 6) and Gear Harness
  (capacity 4), while preserving `No Encumbrance Readied` on those Items,
  clothing, and Wearable Light.
- Excluded the two generic ammunition rows already superseded by the dedicated
  physical ammunition compendium.
- Added strict source, field, description, provenance, icon, deterministic ID,
  folder, count, staging, and release-package validation for all 27 Items.
- Updated release packaging to require all four compendia and exact counts of
  64 weapons, 14 armor Items, 14 ammunition Items, and 27 gear Items.

## 0.4.1

- Fix release packaging so the compiled CWN Ammunition & Reloads database is
  generated, validated, staged, and included in the downloadable module ZIP.
- Add a release assertion that fails unless the ammunition pack contains exactly
  14 Items and four folders.
- Restore the omitted ammunition icon generator, content validator,
  deterministic-build verifier, and release staging tools to the tagged source.

## 0.4.0

- Added explicit `cwn-content-pack` Weapon Family metadata to all 52 reloadable
  Harbour City Stories catalogue weapons while preserving existing legacy
  metadata and deterministic IDs.
- Added a native 14-item **CWN Ammunition & Reloads** compendium.
- Added 14 original transparent-background ammunition SVG icons.
- Added count-based physical reload Items with matching Magazine Family flags,
  full starting Uses, quantity 1, and zero Encumbrance.
- Documented the ammunition-only table abstraction: no empty magazine objects,
  refill bookkeeping, shell costs, stacking, or ammunition Encumbrance.
- Added strict validation for source data, SWNR fields, icons, family
  relationships, folder relationships, deterministic builds, expected pack
  counts, release staging, and ZIP contents.
- Added optional compatibility with CWN Combat Enhancements v0.10.3 without
  creating a hard dependency.

## 0.3.1

- Fixed the release workflow so the armor compendium database is built and packaged.
- Added a post-build extraction check requiring exactly 14 compiled armor items.
- Added release staging checks for both the weapon and armor database directories.

## 0.3.0

- Added a native 14-item Harbour City Stories Armor compendium.
- Added 14 original cyberpunk armor SVG icons.
- Organized armor into Armor, Armor Accessories, and Shields folders.
- Armor dragged or imported from the compendium remains an independent copy.

## 0.2.2

- Fixed generated compendium folder and item IDs so they meet Foundry VTT's
  16-character alphanumeric document-ID requirement.
- Added build-time ID validation to prevent an invalid compendium from being
  packaged again.

## 0.2.1

- Added the complete 64-item Harbour City Stories native Item compendium.
- Migrated all 46 manufacturer-coded SVG weapon icons.
- Weapons can be dragged onto actors or selectively imported into World Items.
- The module does not automatically create or overwrite world or actor items.
- Changed all managed icon paths to the CWN Content & Icon Pack.

## 0.1.0

- Added the initial Foundry VTT v13 module scaffold.
- Added organized icon asset directories.
- Added a versioned icon mapping format.
- Added a non-destructive icon mapping loader and resolver.
- Added licensing and attribution documentation.
