# Changelog

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