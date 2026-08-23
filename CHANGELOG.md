# Changelog

## 0.10.0

- Added the dedicated `CWN Foci` compendium with all 26 standard core CWN Foci.
- Added faithful original Level 1/Level 2 summaries, including the four single-level Foci.
- Added deterministic Item IDs, 26 original SVG icons, provenance, and a stable declarative Focus metadata contract.
- Added strict Focus schema, count, key, level, description, icon, and deterministic-build validation.
- Extended release staging and GitHub Actions to build and verify the seventh compendium.

## 0.9.2

- Reduced the Helix HX-47 Vector prototype-token artwork scale from 0.8 to 0.6
  after Foundry scene testing.
- Recorded the current SWNR sheet display mismatch that can show `-1`
  hardpoints when the zero-hardpoint Vector contains its inseparable integral
  attack. The validated source capacity remains zero and does not permit a
  conventional hardpoint weapon; a display compatibility fix is deferred.

## 0.9.1

- Added the HX-47 Vector as a 5,000-credit Helix Advanced Sword and as an
  alternate native drone Actor representation of the same physical object.
- Added the drone's closed-chassis statistics, directly controlled integral
  Advanced Sword attack without Shock, manual five-discharge No Touch Web,
  capture failsafe, and permanent fallback to an unmodifiable normal Advanced
  Sword.
- Added a dedicated generated Helix SVG inventory icon and a distinct original
  transparent 512px WebP drone token.
- Expanded deterministic build, validation, staging, documentation, and manual
  tests to 74 weapons and ten drone Actors while preserving every established
  Item ID, Actor ID, and folder ID.

## 0.9.0

- Added eight generic NPC weapons: Broken Bottle, Kitchen Knife, Shiv, Wrench,
  Crowbar, Metal Pipe, Pool Cue, and Sledgehammer.
- Added the Ironbark Huntsman compound bow using the canonical CWN Advanced Bow
  profile and a reusable `bow` weapon family.
- Added Arrows as a 20-projectile, $20 physical ammunition Item compatible with
  the bow family.
- Added ten dedicated SVG icons: one for every new weapon and one for Arrows.
- Preserved all 64 legacy weapon Item IDs and all 28 legacy weapon folder IDs;
  new Items and folders use deterministic IDs.
- Expanded build, validation, documentation, and manual tests for 73 weapons,
  15 ammunition Items, the new weapon profiles, resale values, and icons.

## 0.8.0

- Renamed ShinTech to Valcour across the current manufacturer, weapon, drone,
  perk, description, documentation, and asset-path data.
- Renamed the two drones to Valcour VC-14 Hummingbird and Valcour VC-90 Shrike.
- Renamed all eleven current ShinTech weapons with the VC model prefix; the six
  Japanese-inspired model names are now Merlin, Sparrow, Swallow, Chevalier,
  Regent, and Tempest.
- Added Valcour's canonical boutique-manufacturer biography and updated product
  descriptions to reflect its bespoke, registered, private-client identity.
- Preserved the Premium Engineering perk's 80% authorised resale and licensed
  armourer +1 mechanics while changing its visible manufacturer name.
- Preserved all established weapon Item IDs, drone Actor IDs, folders,
  mechanics, weapon families, ammunition data, token settings, scales, and
  artwork bytes.
- Added validation that rejects old current-product branding and confirms the
  exact Valcour names, paths, identities, and unchanged mechanics.

## 0.7.6

- Added explicit semantic native-Stat metadata alongside Shoot/Stab metadata,
  allowing Combat Enhancements to restore Dexterity, Strength, or Wisdom when
  SWNR imports a portable character weapon with its Stat set to `Ask`.
- Added build and content validation for the new metadata on all 64 weapons.

## 0.7.5

- Preserved the v0.7.4 native weapon-field mapping and added the release
  metadata required for CWN Combat Enhancements to resolve a freshly imported
  character weapon's portable Shoot or Stab prompt to that actor's own Skill
  Item.

## 0.7.4

- Audited every one of the 64 Harbour City Stories weapons against the SWNR
  2.3.1 weapon schema.
- Explicitly generate `system.stat`, `system.secondStat`, `system.skill`, and
  `system.isMelee` for all catalogue weapons without changing mechanics,
  descriptions, icons, flags, folders, deterministic IDs, or ammunition-family
  metadata.
- Added a documented base-weapon roll contract and strict source/build
  validation for the mapping.
- Preserved SWNR's portable `system.skill: ask` setting because skill Item IDs
  are actor-owned; documented the intended Shoot and Stab selection for every
  native base group.
- Added semantic native-skill metadata so Combat Enhancements can safely bind
  an imported character weapon to that character's Shoot or Stab Skill Item.

## 0.7.3

- Verified the content pack against Foundry VTT 14.365 and SWNR 2.3.1.
- Removed the obsolete Foundry V13 maximum compatibility cap.
- Updated every compendium build to stamp SWNR 2.3.1 metadata while preserving
  all content, deterministic IDs, folder relationships, icons, and token art.
- Updated the release workflow to build against the SWNR 2.3.1 tag and reject
  release tags that do not match `module.json`.
- Added manifest compatibility assertions to content validation.

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
