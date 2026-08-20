# CWN Drone Catalogue

Version 0.7.0 added nine ready-to-use native SWNR drone Actors. The unreleased
HX-47 work adds a tenth, special-purpose Actor. Version 0.7.1
added model-specific visible token scales. Version 0.8.0 renames ShinTech to
Valcour while preserving every Actor ID, mechanical value, and token scale. The
compendium is flat and preserves its established Actor IDs. The HX-47 alone
contains an embedded integral attack because its blade is part of the chassis;
this is not optional equipment.

| Actor | Cost | AC | TT | HP | Fittings | Speed | Movement | Hardpoints | Encumbrance | Token scale |
|---|---:|---:|---:|---:|---:|---:|---|---:|---:|---:|
| Ironbark Mouse | 500 | 13 | 6 | 1 | 0 | 5 | Ground | 0 | 1 | 0.6 |
| Blackhound BH-10 Roach | 1,000 | 13 | 6 | 8 | 3 | 10 | Ground | 0 | 3 | 0.7 |
| Valcour VC-14 Hummingbird | 2,000 | 15 | 6 | 5 | 2 | 10 | Fly | 0 | 3 | 0.6 |
| Ironbark Sunfish | 1,000 | 15 | 6 | 8 | 3 | 10 | Swim | 0 | 3 | 0.7 |
| Helix HX-35 Pitbull | 5,000 | 15 | 8 | 15 | 5 | 20 | Ground | 1 | 5 | 0.8 |
| Helix HX-40 Javelin | 10,000 | 16 | 6 | 12 | 5 | 20 | Fly | 1 | 6 | 0.8 |
| Helix HX-47 Vector | 5,000 | 15 | 6 | 5 | 0 | 20 | Fly | 0 | 0 | 0.8 |
| Titan TD-66 Kraken | 10,000 | 16 | 8 | 20 | 5 | 15 | Swim | 2 | 99 (nonportable) | 0.9 |
| Titan TD-70 Kerberos | 15,000 | 18 | 8 | 25 | 6 | 20 | Ground | 3 | 99 (nonportable) | 0.9 |
| Valcour VC-90 Shrike | 25,000 | 18 | 8 | 20 | 6 | 30 | Fly | 2 | 99 (nonportable) | 1.0 |

## Prototype-token defaults

- Token name: model only
- Name display: Hovered by Anyone
- Disposition: Friendly
- Token vision: enabled
- Actor link: disabled
- Grid footprint: 1 × 1
- Visible artwork scale: 0.6 to 1.0 according to model size
- Bar 1: Health
- Bar 2: Power

Each Actor and prototype token points to its own 512px WebP in
`assets/tokens/drones/`. The images use a common segmented gunmetal circular
frame, manufacturer accent colors, and transparent outer corners. Version
0.8.0 renamed the two Valcour production files without altering the image
bytes.

## HX-47 Vector special model

The weapon Item and drone Actor are alternate representations of one physical
HX-47 Vector. The Actor is directly controlled, cannot act autonomously, and
cannot accept fittings, hardpoints, weapon modifications, or aftermarket
upgrades. Its embedded Integral Advanced Sword uses the normal Advanced Sword
damage and Trauma profile but has no Shock.

The integral No Touch Web is automatically armed in drone mode. A successful
Grab Drone action causes 2d6 nonlethal damage and consumes one of five
discharges; the discharge count is tracked manually. If the deployed drone is
captured, its electronics permanently fry. Retire the Actor and continue with
the same object's unmodifiable HX-47 Vector weapon Item. Its remaining resale
value is calculated from a normal 1,000-credit Advanced Sword.
