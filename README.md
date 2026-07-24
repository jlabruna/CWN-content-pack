# CWN Content & Icon Pack

An independent Foundry VTT v13 content and icon pack for **Cities Without
Number** games running on the **Systems Without Number Redux (SWNR)** system.

## Version 0.2.0

The content pack now includes:

- Organized asset folders for weapons, armor, cyberware, cyberdecks, programs,
  drones, and general gear.
- A versioned JSON icon-mapping file.
- A non-destructive icon resolver that supports source UUID and name fallbacks.
- The complete 64-item Harbour City Stories weapon catalogue.
- 46 colour-coded SVG icons covering the catalogue's weapon platforms and
  manufacturers.
- A GM-only Foundry settings menu that safely installs or updates the catalogue.
- Licensing and third-party attribution files.

The catalogue installer changes World Items only when the GM explicitly runs
it. Stable flags are retained from the earlier standalone installer, so existing
Harbour City Stories weapons are updated rather than duplicated.

## Installing the weapon catalogue

1. Enable **CWN Content & Icon Pack** in the world.
2. Open **Game Settings → Configure Settings**.
3. Select **CWN Content & Icon Pack**.
4. Click **Open Weapon Catalogue Installer**.
5. Click **Install or Update 64 Weapons** and confirm.

After the migration has completed successfully, the earlier standalone
**Harbour City Stories Weapon Icons** module can be disabled.

## Planned workflow

Icons will live in `assets/icons/`. Their mappings will be recorded in
`data/icon-mappings.json`. A future opt-in tool will apply mapped icons to
existing world items without modifying the installed SWNR system files.

Mappings should prefer a stable SWNR compendium source UUID. Item type and item
name are supported as a fallback for custom or imported items.

Example:

```json
{
  "id": "weapon-heavy-pistol",
  "sourceUuid": "Compendium.swnr.example.Item.example",
  "itemType": "weapon",
  "name": "Heavy Pistol",
  "img": "modules/cwn-content-pack/assets/icons/weapons/heavy-pistol.webp"
}
```

## Compatibility

- Foundry Virtual Tabletop v13
- Systems Without Number Redux (SWNR) 2.3.0

## Independence notice

CWN Content & Icon Pack is an independent module compatible with Cities Without
Number. It is not affiliated with, endorsed by, or approved by Sine Nomine
Publishing.

Cities Without Number is © Sine Nomine Publishing, Inc. Game material used by
this module is derived only from the Cities Without Number System Reference
Document, released under CC0 1.0. All module artwork and additional content are
original or separately licensed.

See `LICENSE`, `ASSET-LICENSE.md`, and `THIRD-PARTY-LICENSES.md`.
