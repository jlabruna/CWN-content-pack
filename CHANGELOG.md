# Changelog

## 0.7.2

- Standardized the nine drone catalogue names under the established Harbour
  City manufacturers and model codes: Ironbark Mouse, Blackhound BH-10 Roach,
  ShinTech ST-14 Hummingbird, Ironbark Sunfish, Helix HX-35 Pitbull, Helix
  HX-40 Javelin, Titan TD-66 Kraken, Titan TD-70 Kerberos, and ShinTech ST-90
  Shrike.
- Renamed the matching catalogue source and token asset paths for consistent
  branding while preserving the original WebP artwork bytes.
- Preserved all nine established Actor IDs, mechanics, prices, prototype-token
  scales, pack structure, and folder relationships.
- Expanded validation to assert every approved display name, manufacturer,
  model code, Actor ID, token path, scale, and mechanical value.

## 0.7.1

- Added model-specific visible token scales while retaining a consistent 1 x 1
  grid footprint: Mouse and Hummingbird 0.6; Roach and Sunfish 0.7; Pitbull and
  Javelin 0.8; Kerberos and Kraken 0.9; Shrike 1.0.
- Added deterministic build and content validation for every drone's exact
  horizontal and vertical texture scale.

## 0.7.0

- Added a new **CWN Drones** Actor compendium containing nine native SWNR drone
  Actors.
- Added nine catalogue drones with their approved cost, defensive, capacity,
  movement, hardpoint, and portability values.
- Added nine distinct original 512px WebP drone tokens with transparent
  corners, a shared segmented gunmetal frame, and manufacturer accent colors.
- Configured model-only prototype-token names, Hovered by Anyone name display,
  Friendly disposition, and enabled token vision.
- Added deterministic Actor IDs, strict nine-Actor source and compiled-pack
  validation, artwork validation, deterministic rebuild coverage, release
  staging checks, and ZIP assertions.
- Kept all drone Actors free of optional equipment and Active Effects.

## 0.6.0

- Added the complete 88-item **CWN Cyberware** catalogue as a native SWNR Item
  compendium.
- Organized cyberware into eight deterministic folders: Body, Head, Skin, Limb,
  Nerve, Sensory, Medical, and General.
- Added 88 distinct original transparent-background SVG cyberware icons.
- Preserved native SWNR cost, Strain, tech level, category, concealment, effect,
  complication, and disabled fields.
- Added provenance, deterministic catalogue keys, audited automation
  classifications, and neutral monthly-maintenance metadata to every cyberware
  Item.
- Deliberately omitted unverified Active Effects; the audit documents which
  effects are native, contextual, manual, description-only, or candidates for
  an explicit Combat Enhancements handler.
- Added neutral recurring-service metadata to Monthly Bus Pass ($50/month) and
  Smartphone Service Plan ($10/month).
- Added strict 88-item, eight-folder, field, metadata, icon, deterministic-build,
  staging, and release-package validation.

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
