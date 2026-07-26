# CWN Content & Icon Pack

An independent Foundry VTT v13 content and icon pack for **Cities Without
Number** games running on the **Systems Without Number Redux (SWNR)** system.

## Version 0.4.1

The content pack includes:

- The complete 64-item Harbour City Stories weapon catalogue in a native
  Foundry Item compendium.
- Explicit Weapon Family metadata on every reloadable catalogue weapon.
- 46 colour-coded SVG weapon icons.
- A 14-item Harbour City Stories armor catalogue in its own native Foundry
  Item compendium.
- 14 original armor icons.
- A 14-item **CWN Ammunition & Reloads** compendium containing preconfigured
  physical magazines, shells, ammunition boxes, rounds, and charge packs.
- 14 original transparent-background ammunition SVG icons.
- Licensing, provenance, validation, and manual test documentation.

The module does not automatically create or overwrite World Items, actor Items,
or NPC Items. Content dragged or imported from a compendium becomes an
independent copy, so later module updates do not silently alter an active
campaign.

## Using the compendia

1. Enable **CWN Content & Icon Pack** in the world.
2. Open the **Compendium Packs** sidebar.
3. Open one of:
   - **Harbour City Stories Weapons**
   - **Harbour City Stories Armor**
   - **CWN Ammunition & Reloads**
4. Drag selected Items onto an actor or import them into World Items.

No World Items are created automatically.

## Weapon Families and physical reloads

Each reloadable generated weapon carries optional semantic metadata:

```text
flags["cwn-content-pack"].weaponFamily
```

Each ammunition Item carries the corresponding:

```text
flags["cwn-content-pack"].magazineFamily
```

These flags are ignored when **CWN Combat Enhancements** is absent. The Content
Pack therefore remains independently usable and does not declare Combat
Enhancements as a dependency.

With CWN Combat Enhancements v0.10.3 enabled, matching actor-owned ammunition
Items appear in the weapon's **Compatible Magazine** selector. Every imported
physical reload remains a distinct Item with its own remaining Uses.

The ammunition Items use native SWNR 2.3.x fields:

- Item type `item`
- Quantity `1`
- Bundle Count disabled
- Consumable mode `count` (displayed as **Individual**)
- Uses value equal to full starting capacity
- Zero Encumbrance
- `No Encumbrance Readied` disabled
- `Is Container` disabled
- Empty tracking disabled

Uses represent individual rounds or ammunition expenditures, not the number of
complete reloads.

## Ammunition abstraction

This catalogue intentionally charges for ammunition only. It omits the
rulebook's ordinary empty-magazine shell cost, empty-magazine objects, refill
bookkeeping, and ammunition Encumbrance.

CWN Combat Enhancements handles partial transfer, retention of partially used
reload Items, and deletion of depleted Items. The Content Pack does not provide
reload automation, refilling, merging, or empty-magazine mechanics.

Ordinary ammunition uses the $1-per-round baseline where no special price is
stated. Automatic Rifle, Heavy Machine Gun, and Mortar ammunition use their
explicit special prices. Rocket Launchers are disposable and deliberately have
no reload Item or Weapon Family flag.

See [AMMUNITION-CATALOGUE.md](AMMUNITION-CATALOGUE.md) for the exact manifest,
family mapping, costs, capacities, and exclusions.

## Icon workflow

Icons live in `assets/icons/`. Weapon mappings are recorded in
`data/icon-mappings.json`. Ammunition and armor compendium Items use direct,
module-relative icon paths.

All ammunition artwork is original SVG line art with a transparent background.

## Compatibility

- Foundry Virtual Tabletop v13
- Systems Without Number Redux 2.3.x
- Optional integration with CWN Combat Enhancements v0.10.3

## Independence notice

CWN Content & Icon Pack is an independent module compatible with Cities Without
Number. It is not affiliated with, endorsed by, or approved by Sine Nomine
Publishing.

Cities Without Number is © Sine Nomine Publishing, Inc. Game material used by
this module is derived only from the Cities Without Number System Reference
Document, released under CC0 1.0. All module artwork and additional content are
original or separately licensed.

See `LICENSE`, `ASSET-LICENSE.md`, and `THIRD-PARTY-LICENSES.md`.
