export const CONTENT_PACK_FLAG_SCOPE = "cwn-content-pack";

export const FAMILY_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Canonical platform classification for the 75-item Harbour City Stories
 * catalogue. Weapon families come from the authored base platform, never the
 * displayed manufacturer/model name.
 */
export const WEAPON_BASE_CONTRACT = Object.freeze({
  "Light Pistol": Object.freeze({ weaponFamily: "light-pistol", reloadable: true }),
  "Heavy Pistol": Object.freeze({ weaponFamily: "heavy-pistol", reloadable: true }),
  "Advanced Bow": Object.freeze({ weaponFamily: "bow", reloadable: true }),
  Rifle: Object.freeze({ weaponFamily: "rifle", reloadable: true }),
  "Combat Rifle": Object.freeze({ weaponFamily: "combat-rifle", reloadable: true }),
  "Submachine Gun": Object.freeze({ weaponFamily: "submachine-gun", reloadable: true }),
  Shotgun: Object.freeze({ weaponFamily: "shotgun", reloadable: true }),
  "Semi-Auto Shotgun": Object.freeze({
    weaponFamily: "semi-auto-shotgun",
    reloadable: true
  }),
  "Combat Shotgun": Object.freeze({ weaponFamily: "combat-shotgun", reloadable: true }),
  "Sniper Rifle": Object.freeze({ weaponFamily: "sniper-rifle", reloadable: true }),
  "Taser Pistol": Object.freeze({ weaponFamily: "taser-pistol", reloadable: true }),
  "Automatic Rifle": Object.freeze({ weaponFamily: "automatic-rifle", reloadable: true }),
  "Anti-Materiel Rifle": Object.freeze({
    weaponFamily: "anti-materiel-rifle",
    reloadable: true
  }),
  "Heavy Machine Gun": Object.freeze({
    weaponFamily: "heavy-machine-gun",
    reloadable: true
  }),
  Mortar: Object.freeze({ weaponFamily: "mortar", reloadable: true }),
  "Rocket Launcher": Object.freeze({
    weaponFamily: null,
    reloadable: false,
    reason: "CWN rocket launchers are disposable single-shot weapons."
  }),
  Knife: Object.freeze({
    weaponFamily: null,
    reloadable: false,
    reason: "Melee weapon; no ammunition."
  }),
  Club: Object.freeze({
    weaponFamily: null,
    reloadable: false,
    reason: "Melee weapon; no ammunition."
  }),
  Spear: Object.freeze({
    weaponFamily: null,
    reloadable: false,
    reason: "Melee/thrown weapon; no homogeneous reload Item."
  }),
  Sword: Object.freeze({
    weaponFamily: null,
    reloadable: false,
    reason: "Melee weapon; no ammunition."
  }),
  "Big Sword": Object.freeze({
    weaponFamily: null,
    reloadable: false,
    reason: "Melee weapon; no ammunition."
  }),
  "Advanced Knife": Object.freeze({
    weaponFamily: null,
    reloadable: false,
    reason: "Melee weapon; no ammunition."
  }),
  "Advanced Sword": Object.freeze({
    weaponFamily: null,
    reloadable: false,
    reason: "Melee weapon; no ammunition."
  }),
  "Advanced Big Sword": Object.freeze({
    weaponFamily: null,
    reloadable: false,
    reason: "Melee weapon; no ammunition."
  }),
  "Advanced Club": Object.freeze({
    weaponFamily: null,
    reloadable: false,
    reason: "Melee weapon; no ammunition."
  }),
  "Big Club": Object.freeze({
    weaponFamily: null,
    reloadable: false,
    reason: "Melee weapon; no ammunition."
  }),
  "Unarmed Attack": Object.freeze({
    weaponFamily: null,
    reloadable: false,
    reason: "Unarmed attack; no ammunition."
  })
});

export const RELOAD_ITEM_EXCLUSIONS = Object.freeze(
  Object.fromEntries(
    Object.entries(WEAPON_BASE_CONTRACT)
      .filter(([, contract]) => !contract.reloadable)
      .map(([base, contract]) => [base, contract.reason])
  )
);

export function contractForBaseWeapon(baseWeapon) {
  const contract = WEAPON_BASE_CONTRACT[baseWeapon];
  if (!contract) {
    throw new Error(`Unknown Harbour City Stories base weapon "${baseWeapon}".`);
  }
  if (
    contract.weaponFamily !== null
    && !FAMILY_SLUG_PATTERN.test(contract.weaponFamily)
  ) {
    throw new Error(
      `Base weapon "${baseWeapon}" has malformed family "${contract.weaponFamily}".`
    );
  }
  return contract;
}
