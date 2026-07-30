# CWN Drone Catalogue

Version 0.7.0 added nine ready-to-use native SWNR drone Actors. Version 0.7.1
added model-specific visible token scales. Version 0.7.2 standardizes the
catalogue under established Harbour City manufacturers and model codes. The
compendium is flat, contains no optional equipment, and preserves its
established Actor IDs.

| Actor | Cost | AC | TT | HP | Fittings | Speed | Movement | Hardpoints | Encumbrance | Token scale |
|---|---:|---:|---:|---:|---:|---:|---|---:|---:|---:|
| Ironbark Mouse | 500 | 13 | 6 | 1 | 0 | 5 | Ground | 0 | 1 | 0.6 |
| Blackhound BH-10 Roach | 1,000 | 13 | 6 | 8 | 3 | 10 | Ground | 0 | 3 | 0.7 |
| ShinTech ST-14 Hummingbird | 2,000 | 15 | 6 | 5 | 2 | 10 | Fly | 0 | 3 | 0.6 |
| Ironbark Sunfish | 1,000 | 15 | 6 | 8 | 3 | 10 | Swim | 0 | 3 | 0.7 |
| Helix HX-35 Pitbull | 5,000 | 15 | 8 | 15 | 5 | 20 | Ground | 1 | 5 | 0.8 |
| Helix HX-40 Javelin | 10,000 | 16 | 6 | 12 | 5 | 20 | Fly | 1 | 6 | 0.8 |
| Titan TD-66 Kraken | 10,000 | 16 | 8 | 20 | 5 | 15 | Swim | 2 | 99 (nonportable) | 0.9 |
| Titan TD-70 Kerberos | 15,000 | 18 | 8 | 25 | 6 | 20 | Ground | 3 | 99 (nonportable) | 0.9 |
| ShinTech ST-90 Shrike | 25,000 | 18 | 8 | 20 | 6 | 30 | Fly | 2 | 99 (nonportable) | 1.0 |

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
0.7.2 renamed the production files to match the new catalogue keys without
altering the image bytes.
