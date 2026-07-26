# CWN Ammunition & Reloads

## Exact ammunition manifest

| Source key | Display name | Magazine Family | Capacity | Cost | Encumbrance |
|---|---|---|---:|---:|---:|
| `light-pistol-magazine` | Light Pistol Magazine | `light-pistol` | 15 | $15 | 0 |
| `heavy-pistol-magazine` | Heavy Pistol Magazine | `heavy-pistol` | 8 | $8 | 0 |
| `rifle-magazine` | Rifle Magazine | `rifle` | 6 | $6 | 0 |
| `combat-rifle-magazine` | Combat Rifle Magazine | `combat-rifle` | 30 | $30 | 0 |
| `submachine-gun-magazine` | Submachine Gun Magazine | `submachine-gun` | 20 | $20 | 0 |
| `shotgun-reload` | Shotgun Reload | `shotgun` | 2 | $2 | 0 |
| `semi-auto-shotgun-magazine` | Semi-Auto Shotgun Magazine | `semi-auto-shotgun` | 6 | $6 | 0 |
| `combat-shotgun-magazine` | Combat Shotgun Magazine | `combat-shotgun` | 12 | $12 | 0 |
| `sniper-rifle-round` | Sniper Rifle Round | `sniper-rifle` | 1 | $1 | 0 |
| `automatic-rifle-ammunition-box` | Automatic Rifle Ammunition Box | `automatic-rifle` | 10 | $500 | 0 |
| `heavy-machine-gun-ammunition-box` | Heavy Machine Gun Ammunition Box | `heavy-machine-gun` | 10 | $1,000 | 0 |
| `mortar-round` | Mortar Round | `mortar` | 1 | $50 | 0 |
| `anti-materiel-rifle-magazine` | Anti-Materiel Rifle Magazine | `anti-materiel-rifle` | 5 | $5 | 0 |
| `taser-pistol-charge-pack` | Taser Pistol Charge Pack | `taser-pistol` | 2 | $2 | 0 |

## Exact Weapon Family mapping

| Canonical base platform | Weapon Family |
|---|---|
| Light Pistol | `light-pistol` |
| Heavy Pistol | `heavy-pistol` |
| Rifle | `rifle` |
| Combat Rifle | `combat-rifle` |
| Submachine Gun | `submachine-gun` |
| Shotgun | `shotgun` |
| Semi-Auto Shotgun | `semi-auto-shotgun` |
| Combat Shotgun | `combat-shotgun` |
| Sniper Rifle | `sniper-rifle` |
| Taser Pistol | `taser-pistol` |
| Automatic Rifle | `automatic-rifle` |
| Anti-Materiel Rifle | `anti-materiel-rifle` |
| Heavy Machine Gun | `heavy-machine-gun` |
| Mortar | `mortar` |

The mapping is generated from the catalogue's canonical
`flags["harbour-city-stories"].baseWeapon` value, never from the displayed
manufacturer/model name.

## Explicit exclusions

- **Rocket Launcher:** disposable single-shot weapon; no reload Item and no
  Weapon Family flag.
- **Knife, Club, Sword, Big Sword, and advanced variants:** melee weapons with
  no ammunition.
- **Spear:** melee/thrown weapon without a homogeneous reload Item.
- **Grenade Launcher and Advanced Bow:** not present in the current 64-item
  Harbour City Stories catalogue, so this release invents neither weapons nor
  reload Items for them.
- **Mines and demolition charges:** not weapon platforms in this catalogue and
  cannot be represented faithfully as homogeneous reload Items.

## Table abstraction and provenance

The ammunition catalogue derives its rules values from the Cities Without
Number System Reference Document under CC0 1.0.

Ordinary ammunition uses the $1-per-round rule where no special price is
stated. Automatic Rifle, Heavy Machine Gun, and Mortar ammunition use their
explicit prices.

The catalogue intentionally omits the ordinary empty-magazine shell price,
empty objects, refill bookkeeping, and ammunition Encumbrance. Each imported
reload is quantity 1 and tracks its own remaining rounds through SWNR Uses.
