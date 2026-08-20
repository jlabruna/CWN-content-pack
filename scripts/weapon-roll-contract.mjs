/**
 * Native SWNR weapon-roll contract for the Harbour City Stories catalogue.
 *
 * `system.skill` stores an embedded Item ID on an Actor, not a compendium
 * skill name. A portable compendium entry therefore must retain SWNR's
 * canonical `ask` value. The `skill` property below documents the native
 * combat skill the GM or player selects from the actor's sheet.
 */

const ACTOR_SKILL_PROMPT = "ask";

const firearm = Object.freeze({
  skill: "Shoot",
  stat: "dex",
  secondStat: "none",
  systemSkill: ACTOR_SKILL_PROMPT,
  isMelee: false,
});

const meleeFinesse = Object.freeze({
  skill: "Stab",
  stat: "str",
  secondStat: "dex",
  systemSkill: ACTOR_SKILL_PROMPT,
  isMelee: true,
});

const meleeStrength = Object.freeze({
  skill: "Stab",
  stat: "str",
  secondStat: "none",
  systemSkill: ACTOR_SKILL_PROMPT,
  isMelee: true,
});

/**
 * Every native base weapon used by the 74-record Harbour City Stories source.
 * Mortar intentionally retains SWNR's native Wisdom/Shoot configuration, and
 * Spear intentionally remains non-melee to preserve SWNR's thrown-weapon
 * handling while still using Stab with Strength or Dexterity.
 */
export const WEAPON_ROLL_CONTRACTS = Object.freeze({
  "Anti-Materiel Rifle": firearm,
  "Advanced Bow": firearm,
  "Automatic Rifle": firearm,
  "Combat Rifle": firearm,
  "Combat Shotgun": firearm,
  "Heavy Machine Gun": firearm,
  "Heavy Pistol": firearm,
  "Light Pistol": firearm,
  Rifle: firearm,
  "Rocket Launcher": firearm,
  "Semi-Auto Shotgun": firearm,
  Shotgun: firearm,
  "Sniper Rifle": firearm,
  "Submachine Gun": firearm,
  "Taser Pistol": firearm,
  Mortar: Object.freeze({
    skill: "Shoot",
    stat: "wis",
    secondStat: "none",
    systemSkill: ACTOR_SKILL_PROMPT,
    isMelee: false,
  }),
  "Advanced Knife": meleeFinesse,
  "Advanced Sword": meleeFinesse,
  Knife: meleeFinesse,
  Spear: Object.freeze({
    skill: "Stab",
    stat: "str",
    secondStat: "dex",
    systemSkill: ACTOR_SKILL_PROMPT,
    isMelee: false,
  }),
  Sword: meleeFinesse,
  "Advanced Big Sword": meleeStrength,
  "Advanced Club": meleeStrength,
  "Big Club": meleeStrength,
  "Big Sword": meleeStrength,
  Club: meleeStrength,
});

export function weaponRollContractForBaseWeapon(baseWeapon) {
  const contract = WEAPON_ROLL_CONTRACTS[baseWeapon];
  if (!contract) {
    throw new Error(`No SWNR roll contract exists for base weapon "${baseWeapon}".`);
  }
  return contract;
}

export function applyWeaponRollContract(system, contract) {
  system.stat = contract.stat;
  system.secondStat = contract.secondStat;
  system.skill = contract.systemSkill;
  system.isMelee = contract.isMelee;
  return system;
}
