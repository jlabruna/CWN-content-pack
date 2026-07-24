# CWN Content & Icon Pack

An independent Foundry VTT v13 content and icon pack for **Cities Without
Number** games running on the **Systems Without Number Redux (SWNR)** system.

## Version 0.3.1

The content pack includes:

- The complete 64-item Harbour City Stories weapon catalogue in a native
  Foundry Item compendium.
- 46 colour-coded SVG icons covering the catalogue's weapon platforms and
  manufacturers.
- A 14-item Harbour City Stories armor catalogue in its own native Foundry
  Item compendium.
- 14 original armor icons covering clothing, armored suits, longcoats,
  accessories, and shields.
- Organized asset folders for weapons, armor, cyberware, cyberdecks, programs,
  drones, and general gear.
- A versioned JSON icon-mapping file.
- A non-destructive icon resolver that supports source UUID and name fallbacks.
- Licensing and third-party attribution files.

The module does not automatically create or overwrite World Items, actor items,
or NPC items. Weapons and armor dragged or imported from a compendium become
independent copies, so later module updates do not silently alter an active
campaign.

## Using the weapon compendium

1. Enable **CWN Content & Icon Pack** in the world.
2. Open the **Compendium Packs** sidebar.
3. Open **Harbour City Stories Weapons**.
4. Drag a weapon directly onto an actor, or import selected weapons into World
   Items.

After replacing older weapons, the earlier standalone **Harbour City Stories
Weapon Icons** module can be disabled.

## Using the armor compendium

1. Enable **CWN Content & Icon Pack** in the world.
2. Open the **Compendium Packs** sidebar.
3. Open **Harbour City Stories Armor**.
4. Drag armor directly onto an actor, or import selected armor into World Items.

The compendium is organized into Armor, Armor Accessories, and Shields.

## Icon workflow

Icons live in `assets/icons/`. Their mappings are recorded in
`data/icon-mappings.json`. Mappings prefer a stable SWNR compendium source UUID;
item type and item name are supported as fallbacks for custom or imported items.

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
