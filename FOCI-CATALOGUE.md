# CWN Foci Catalogue

Version 0.10.0 adds the 26 standard core Cities Without Number Foci in the dedicated `cwn-foci` Item compendium. Each entry is a native SWNR `feature` Item with `system.type: focus`, starts at level 1, and contains an original concise Level 1/Level 2 rules summary. Single-level Foci declare a maximum level of 1.

| Focus | Focus key | Deterministic Item ID | Maximum level |
|---|---|---|---:|
| Ace Driver | `ace-driver` | `F60703fc2442e700` | 2 |
| Alert | `alert` | `F36a84c08b234e5c` | 2 |
| All Natural | `all-natural` | `F8d087dc6bebce68` | 1 |
| Armsmaster | `armsmaster` | `F2a210693812a164` | 2 |
| Assassin | `assassin` | `F23f586c79c3d9fc` | 2 |
| Authority | `authority` | `Fabbbe30ff5c6b03` | 2 |
| Close Combatant | `close-combatant` | `F5ae09a26fce3b97` | 2 |
| Cyberdoc | `cyberdoc` | `Fc898c72f3305dfa` | 2 |
| Deadeye | `deadeye` | `F32ac3733b669987` | 2 |
| Diplomat | `diplomat` | `F509b5c478cf3553` | 2 |
| Drone Pilot | `drone-pilot` | `Fcb8de17f2c6883a` | 2 |
| Expert Programmer | `expert-programmer` | `F8519b6b9a72497a` | 2 |
| Healer | `healer` | `F823583618beabaa` | 2 |
| Henchkeeper | `henchkeeper` | `F0abf13c25aca79d` | 2 |
| Many Faces | `many-faces` | `F1e142af14c8904b` | 1 |
| Pop Idol | `pop-idol` | `F0c7f13cdbc851e4` | 2 |
| Roamer | `roamer` | `F18b1fe16fcfdbab` | 2 |
| Safe Haven | `safe-haven` | `Fccfd7d0d5d48a54` | 2 |
| Shocking Assault | `shocking-assault` | `F67851430e9d9026` | 2 |
| Sniper's Eye | `snipers-eye` | `Ff29d79d89c78a2a` | 2 |
| Specialist | `specialist` | `Fe9db8be6618f346` | 2 |
| Tinker | `tinker` | `Fde25721afc14381` | 2 |
| Unarmed Combatant | `unarmed-combatant` | `F9ae25e199f63483` | 2 |
| Unique Gift | `unique-gift` | `F54e5f69a221f15d` | 1 |
| Unregistered | `unregistered` | `F95fb246575f3596` | 1 |
| Whirlwind Assault | `whirlwind-assault` | `F746d2b1e3a447d9` | 2 |

## Integration metadata

`flags.cwn-content-pack.focusKey` is the authoritative opt-in key. The same flag scope also carries the small declarative `maxLevel`, `skillAwards`, `configuration`, and `automation` arrays. These values describe content; this module executes no Focus rules. Combat Enhancements 0.19.0 or later may consume them, while the full descriptions remain usable without that module.

All original SVGs are under `assets/icons/foci/<focus-key>.svg` and are generated deterministically by `tools/generate-focus-icons.mjs`.

