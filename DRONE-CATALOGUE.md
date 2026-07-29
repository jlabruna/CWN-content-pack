# CWN Drone Catalogue

Version 0.7.0 adds nine ready-to-use native SWNR drone Actors. The compendium is
flat, contains no optional equipment, and uses deterministic Actor IDs.

| Actor | Cost | AC | TT | HP | Fittings | Speed | Movement | Hardpoints | Encumbrance |
|---|---:|---:|---:|---:|---:|---:|---|---:|---:|
| BanTech Roach | 1,000 | 13 | 6 | 8 | 3 | 10 | Ground | 0 | 3 |
| BanTech Sunfish | 1,000 | 15 | 6 | 8 | 3 | 10 | Swim | 0 | 3 |
| Kessler Kerberos | 15,000 | 18 | 8 | 25 | 6 | 20 | Ground | 3 | 99 (nonportable) |
| Lem Robotics Pitbull | 5,000 | 15 | 8 | 15 | 5 | 20 | Ground | 1 | 5 |
| NAMU Javelin | 10,000 | 16 | 6 | 12 | 5 | 20 | Fly | 1 | 6 |
| NAMU Shrike | 25,000 | 18 | 8 | 20 | 6 | 30 | Fly | 2 | 99 (nonportable) |
| Shintetsu Mouse | 500 | 13 | 6 | 1 | 0 | 5 | Ground | 0 | 1 |
| Sui Hummingbird | 2,000 | 15 | 6 | 5 | 2 | 10 | Fly | 0 | 3 |
| Sui Kraken | 10,000 | 16 | 8 | 20 | 5 | 15 | Swim | 2 | 99 (nonportable) |

## Prototype-token defaults

- Token name: model only
- Name display: Hovered by Anyone
- Disposition: Friendly
- Token vision: enabled
- Actor link: disabled
- Bar 1: Health
- Bar 2: Power

Each Actor and prototype token points to its own 512px WebP in
`assets/tokens/drones/`. The images use a common segmented gunmetal circular
frame, manufacturer accent colors, and transparent outer corners.
