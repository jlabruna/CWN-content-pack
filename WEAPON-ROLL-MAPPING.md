# Harbour City Stories weapon-roll mapping

This table is the source-of-truth audit for all 64 Harbour City Stories weapon
records. The catalogue has 24 native SWNR base-weapon groups.

`system.skill` is deliberately `ask` for every compendium entry. SWNR stores a
skill as an **actor-owned Item ID**, so a static pack cannot safely store a
universal Shoot, Stab, or Punch ID. The listed skill is the native skill to
select in SWNR's weapon-roll dialog. This avoids stale PC skill IDs on copied
items and keeps a compendium entry portable between actors.

Each record also carries `flags["harbour-city-stories"].nativeSkill` and
`nativeStat`. When CWN Combat Enhancements is active, it uses those semantic
values to resolve the matching Skill Item and restore the intended native Stat
if SWNR imports a character copy as `Ask`, without ever writing PC roll data to
an NPC weapon.

| Native base weapon | Records | Native skill | `stat` / `secondStat` | `isMelee` |
|---|---:|---|---|---:|
| Anti-Materiel Rifle | 1 | Shoot | Dex / None | false |
| Automatic Rifle | 4 | Shoot | Dex / None | false |
| Combat Rifle | 12 | Shoot | Dex / None | false |
| Combat Shotgun | 5 | Shoot | Dex / None | false |
| Heavy Machine Gun | 2 | Shoot | Dex / None | false |
| Heavy Pistol | 7 | Shoot | Dex / None | false |
| Light Pistol | 5 | Shoot | Dex / None | false |
| Rifle | 1 | Shoot | Dex / None | false |
| Rocket Launcher | 2 | Shoot | Dex / None | false |
| Semi-Auto Shotgun | 1 | Shoot | Dex / None | false |
| Shotgun | 1 | Shoot | Dex / None | false |
| Sniper Rifle | 5 | Shoot | Dex / None | false |
| Submachine Gun | 5 | Shoot | Dex / None | false |
| Taser Pistol | 2 | Shoot | Dex / None | false |
| Mortar | 1 | Shoot | Wis / None | false |
| Advanced Knife | 1 | Stab | Str / Dex | true |
| Advanced Sword | 1 | Stab | Str / Dex | true |
| Knife | 1 | Stab | Str / Dex | true |
| Spear | 2 | Stab | Str / Dex | false |
| Sword | 1 | Stab | Str / Dex | true |
| Advanced Big Sword | 1 | Stab | Str / None | true |
| Advanced Club | 1 | Stab | Str / None | true |
| Big Sword | 1 | Stab | Str / None | true |
| Club | 1 | Stab | Str / None | true |

There are no Punch/body-weapon source records in the current 64-item
catalogue. Any such item added later must be reviewed individually and mapped
to Punch before it is included in the build.

Spear is the only thrown-capable source base. It deliberately remains
`isMelee: false`, matching SWNR's own native Spear item and preserving its
ranged/thrown handling.
