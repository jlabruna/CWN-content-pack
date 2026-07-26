# CWN Common Operator Gear catalogue

Version 0.5.0 provides 27 native SWNR `item` documents derived from the Cities
Without Number System Reference Document. The generic table rows
`Ammunition, empty magazine` and `Ammunition, per round` are intentionally
excluded because physical ammunition is supplied by the separate
**CWN Ammunition & Reloads** compendium.

| Folder | Item | Cost | Enc. | No Enc. Readied | Container capacity |
|---|---|---:|---:|:---:|---:|
| Protective Gear | Active Hearing Protection | 250 | 1 | No | — |
| Protective Gear | Gas Mask | 1,000 | 1 | No | — |
| Protective Gear | Anti-Flash Goggles | 100 | 1 | No | — |
| Protective Gear | IR Goggles | 1,000 | 1 | No | — |
| Carry and Clothing | Backpack | 25 | 1 | Yes | 6 |
| Carry and Clothing | Gear Harness | 25 | 1 | Yes | 4 |
| Carry and Clothing | Ordinary Clothing | 25 | 1 | Yes | — |
| Carry and Clothing | Fashionable Clothing | 500 | 1 | Yes | — |
| Carry and Clothing | Haute Couture Clothing | 10,000 | 1 | Yes | — |
| Tools and Field Gear | Binoculars | 100 | 1 | No | — |
| Tools and Field Gear | Climbing Kit | 150 | 2 | No | — |
| Tools and Field Gear | Basic Tools Kit | 100 | 2 | No | — |
| Tools and Field Gear | Cyberdoc Kit | 500 | 2 | No | — |
| Tools and Field Gear | Medkit | 100 | 1 | No | — |
| Tools and Field Gear | Survival Kit | 100 | 2 | No | — |
| Tools and Field Gear | Lockpicks | 100 | 1 | No | — |
| Tools and Field Gear | Wearable Light | 25 | 1 | Yes | — |
| Electronics | Portable Video Camera | 300 | 1 | No | — |
| Electronics | Handheld Radio | 50 | 1 | No | — |
| Electronics | Ultralight Radio Tab | 500 | 0 | No | — |
| Electronics | Basic Smartphone | 50 | 0 | No | — |
| Electronics | Fashionable Smartphone | 2,000 | 0 | No | — |
| Electronics | Cheap VR Crown | 50 | 1 | No | — |
| Services and Supplies | Monthly Bus Pass | 50 | 0 | No | — |
| Services and Supplies | Smartphone Service Plan — One Month | 10 | 0 | No | — |
| Services and Supplies | Military Ration | 20 | 1 | No | — |
| Services and Supplies | Military Ration with Water | 20 | 2 | No | — |

## Native container behaviour

Backpack and Gear Harness use SWNR 2.3.x's native container fields. Their
capacity values are Content Pack gameplay abstractions measured in points of
contained-item Encumbrance.

SWNR 2.3.x currently:

- permits actor-owned gear, weapons, and armor to be dragged into an open
  container;
- records the relationship in the contained Item's `system.containerId`;
- updates the container's current capacity and propagates its location to its
  contents;
- prevents containers from being placed inside other containers;
- measures capacity from each contained Item's base Encumbrance.

The Content Pack adds no runtime container automation and does not modify SWNR.

## Source and artwork

Descriptions and table values were checked against the corresponding CWN SRD
documents distributed in SWNR 2.3.0's `cwn-items` source pack. The two capacity
values are explicitly identified above as Content Pack abstractions.

Each catalogue Item has a distinct original SVG icon in
`assets/icons/gear/common-operator-gear/`. See `ASSET-LICENSE.md` and
`THIRD-PARTY-LICENSES.md`.
