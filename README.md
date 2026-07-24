# CWN Content & Icon Pack

An independent Foundry VTT v13 content and icon pack for **Cities Without
Number** games running on the **Systems Without Number Redux (SWNR)** system.

## Version 0.1.0

This first release provides the installable module scaffold:

- Organized asset folders for weapons, armor, cyberware, cyberdecks, programs,
  drones, and general gear.
- A versioned JSON icon-mapping file.
- A non-destructive icon resolver that supports source UUID and name fallbacks.
- Licensing and third-party attribution files.

Version 0.1.0 does **not** change existing actors, items, compendiums, or icons.
The first tested icon collection will be added in a later release.

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
