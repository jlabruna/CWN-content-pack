# CWN Content & Icon Pack

An independent Foundry VTT content and icon pack for **Cities Without Number**
games running on **Systems Without Number Redux (SWNR) 2.3.1**, verified for
Foundry VTT 14.365.

## Version 0.7.4

The content pack includes:

- The complete 64-item Harbour City Stories weapon catalogue in a native
  Foundry Item compendium.
- Explicit Weapon Family metadata on every reloadable catalogue weapon.
- Explicit native SWNR roll fields on every weapon, with a portable skill
  prompt and documented Shoot/Stab mappings.
- 46 colour-coded SVG weapon icons.
- A 14-item Harbour City Stories armor catalogue in its own native Foundry
  Item compendium.
- 14 original armor icons.
- A 14-item **CWN Ammunition & Reloads** compendium containing preconfigured
  physical magazines, shells, ammunition boxes, rounds, and charge packs.
- 14 original transparent-background ammunition SVG icons.
- A 27-item **CWN Common Operator Gear** compendium organized into Protective
  Gear, Carry and Clothing, Tools and Field Gear, Electronics, and Services and
  Supplies.
- 27 distinct original Common Operator Gear SVG icons.
- A complete 88-item **CWN Cyberware** catalogue using native SWNR Cyberware
  fields and eight category folders.
- 88 distinct original transparent-background cyberware SVG icons.
- Audited automation classifications and neutral recurring-maintenance metadata
  on every cyberware Item.
- A nine-Actor **CWN Drones** compendium using the native SWNR drone Actor
  schema.
- Nine distinct original 512px WebP drone tokens with transparent corners and
  a shared segmented gunmetal frame.
- Recurring-service metadata on Monthly Bus Pass and Smartphone Service Plan
  for optional use by CWN Combat Enhancements.
- Native SWNR containers for Backpack (capacity 6) and Gear Harness (capacity
  4), with no Content Pack runtime automation.
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
   - **CWN Common Operator Gear**
   - **CWN Cyberware**
   - **CWN Drones**
4. Drag selected Items or Actors into the world, or import them selectively.

No World Items are created automatically.

## Native SWNR drones

**CWN Drones** contains Ironbark Mouse, Blackhound BH-10 Roach, ShinTech ST-14
Hummingbird, Ironbark Sunfish, Helix HX-35 Pitbull, Helix HX-40 Javelin, Titan
TD-66 Kraken, Titan TD-70 Kerberos, and ShinTech ST-90 Shrike. They are native
SWNR `drone` Actors with their cost, AC, Trauma Target, HP, fittings, speed,
movement type, hardpoints, and portability encoded in the corresponding system
fields.

The Actors contain no optional fittings, weapons, or other equipment. Their
prototype tokens use the model name only, display that name when hovered by
any user, have Friendly disposition, and have token vision enabled. See
[DRONE-CATALOGUE.md](DRONE-CATALOGUE.md) for the exact catalogue values.

Version 0.7.1 adds model-specific visible token scales from 0.6 to 1.0 while
retaining the existing 1 x 1 grid footprint for movement and targeting.
Version 0.7.2 standardizes the catalogue under the established Harbour City
manufacturers and model codes without changing mechanics, prices, token scales,
Actor IDs, or artwork.

Version 0.7.3 retains that catalogue unchanged while rebuilding and validating
all six compendia for SWNR 2.3.1 and allowing installation on Foundry VTT 14.

Version 0.7.4 explicitly applies each catalogue weapon's SWNR `stat`,
`secondStat`, `skill`, and `isMelee` values during generation. The portable
`system.skill` value is `ask`: SWNR skill references are actor-owned IDs, so a
static compendium cannot safely hard-code a Shoot or Stab Item ID. See
[`WEAPON-ROLL-MAPPING.md`](WEAPON-ROLL-MAPPING.md) for the complete 64-item
audit and intended native skills.

## Cyberware and recurring expenses

The cyberware catalogue uses the native SWNR 2.3.x Cyberware schema for cost,
Strain, tech level, category, concealment, effect text, complication, and the
disabled state. SWNR continues to calculate installed Strain. The Content Pack
does not add runtime automation or speculative Active Effects.

Every cyberware Item has an audited automation classification and a neutral
maintenance contract under `flags["cwn-content-pack"]`. CWN Combat Enhancements
v0.13.1 can use this metadata to calculate optional monthly cyberware upkeep.
Disabled cyberware remains installed and therefore still incurs upkeep unless a
GM explicitly disables its maintenance override.

The Monthly Bus Pass and Smartphone Service Plan also carry neutral monthly
service metadata. The Content Pack remains independently usable if Combat
Enhancements is absent.

See [CYBERWARE-CATALOGUE.md](CYBERWARE-CATALOGUE.md) for the complete manifest
and [CYBERWARE-AUDIT.md](CYBERWARE-AUDIT.md) for the automation audit.

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

With CWN Combat Enhancements v0.10.4 enabled, matching actor-owned ammunition
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

## Common Operator Gear

The Common Operator Gear pack contains exactly 27 everyday CWN Items. Generic
ammunition table rows are intentionally excluded because the separate
Ammunition & Reloads pack supplies the module's physical ammunition Items.

Backpack and Gear Harness use SWNR 2.3.x's native container fields. Capacity is
measured in contained-item Encumbrance, containers cannot be nested, and
contained Items inherit the container's location. The capacities of 6 and 4 are
Content Pack gameplay abstractions; the Content Pack does not replace or patch
SWNR's container implementation.

See
[COMMON-OPERATOR-GEAR-CATALOGUE.md](COMMON-OPERATOR-GEAR-CATALOGUE.md) for the
complete manifest, source policy, and container limitations.

## Icon workflow

Icons live in `assets/icons/`. Weapon mappings are recorded in
`data/icon-mappings.json`. Ammunition and armor compendium Items use direct,
module-relative icon paths.

All ammunition and Common Operator Gear artwork is original SVG line art with a
transparent background.

## Compatibility

- Foundry Virtual Tabletop v13
- Systems Without Number Redux 2.3.x
- Optional integration with CWN Combat Enhancements v0.10.4

## Independence notice

CWN Content & Icon Pack is an independent module compatible with Cities Without
Number. It is not affiliated with, endorsed by, or approved by Sine Nomine
Publishing.

Cities Without Number is © Sine Nomine Publishing, Inc. Game material used by
this module is derived only from the Cities Without Number System Reference
Document, released under CC0 1.0. All module artwork and additional content are
original or separately licensed.

See `LICENSE`, `ASSET-LICENSE.md`, and `THIRD-PARTY-LICENSES.md`.
