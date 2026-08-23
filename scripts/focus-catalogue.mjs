/**
 * Canonical, paraphrased Cities Without Number core Focus catalogue.
 *
 * The small metadata contract is declarative. CWN Combat Enhancements may
 * consume focusKey, maxLevel, skillAwards, configuration, and automation IDs;
 * no executable rules belong in this content module.
 */

const fixed = (id, level, ...skills) => ({ id, level, kind: "fixed", skills });
const choice = (id, level, kind, ...skills) => ({ id, level, kind, skills });

export const CWN_FOCI = Object.freeze([
  {
    focusKey: "ace-driver", name: "Ace Driver", maxLevel: 2, iconLabel: "AD",
    skillAwards: [fixed("drive", 1, "Drive"), fixed("fix", 2, "Fix")],
    automation: ["focus-action:ace-driver-reroll"],
    level1: "Gain Drive as a bonus skill. You have acquired vehicles within the level-based vehicle budget and can replace lost or destroyed vehicles at $10,000 per week. Once per scene, as an Instant action, reroll a failed check for driving or vehicle maintenance or repair.",
    level2: "Gain Fix as a bonus skill. A vehicle you drive has +1 Speed. Once per vehicle, add one free modification with no dollar, experimental-component, or Maintenance cost; only you can operate it effectively. You may replace that modification after a week of downtime."
  },
  {
    focusKey: "alert", name: "Alert", maxLevel: 2, iconLabel: "AL",
    skillAwards: [fixed("notice", 1, "Notice")], automation: ["manual-reminder:initiative"],
    level1: "Gain Notice as a bonus skill. You cannot be surprised or targeted by an Execution Attack. When your group rolls initiative, roll twice and keep the higher result.",
    level2: "You always act first in a combat round unless another participant also has Alert level 2."
  },
  {
    focusKey: "all-natural", name: "All Natural", maxLevel: 1, iconLabel: "AN",
    skillAwards: [choice("any-skill", 1, "any")], configuration: ["attribute-increases"], automation: ["manual-reminder:all-natural"],
    level1: "Gain any skill as a bonus skill. Increase one attribute modifier by +1, to a maximum of +3; make another such choice at character levels 3, 5, 7, and 10. You can suffer Traumatic Hits but not major injuries. You cannot accept cyberware with an unmodified System Strain cost above zero, and this Focus is incompatible with specified magical or psychic Edges when those rules are used."
  },
  {
    focusKey: "armsmaster", name: "Armsmaster", maxLevel: 2, iconLabel: "AM",
    skillAwards: [fixed("stab", 1, "Stab")], automation: ["weapon:armsmaster"],
    level1: "Gain Stab as a bonus skill. Ready a Stowed melee or thrown weapon as an Instant action. With qualifying melee or thrown weapons, add Stab to either the damage roll or Shock damage. This does not apply to unarmed or non-thrown projectile attacks and cannot stack with another Focus that adds a skill to damage or Shock.",
    level2: "Shock from your melee attacks treats the target as AC 10. Gain +1 to hit with melee and thrown attacks."
  },
  {
    focusKey: "assassin", name: "Assassin", maxLevel: 2, iconLabel: "AS",
    skillAwards: [fixed("sneak", 1, "Sneak")], automation: ["manual-reminder:execution-attack"],
    level1: "Gain Sneak as a bonus skill. Conceal one knife- or pistol-sized object from anything short of a strip search, including ordinary detectors; produce it as an On Turn action. A point-blank ranged attack made from surprise with it cannot miss.",
    level2: "You may take and split a Move action in the round you make an Execution Attack. This rapid movement does not itself alert the victim and is not stopped by bodyguards outside your direct path."
  },
  {
    focusKey: "authority", name: "Authority", maxLevel: 2, iconLabel: "AU",
    skillAwards: [fixed("lead", 1, "Lead")], automation: ["focus-action:authority-request"],
    level1: "Gain Lead as a bonus skill. Once per day, request something from a non-hostile NPC and roll Cha/Lead against their Morale. On success they comply if the request is neither harmful nor seriously out of character.",
    level2: "NPC followers you directly lead gain a Morale and hit-roll bonus equal to your Lead skill and +1 on skill checks. They resist acting against your interests except under extreme pressure. The GM determines who is a voluntary follower; PCs never qualify."
  },
  {
    focusKey: "close-combatant", name: "Close Combatant", maxLevel: 2, iconLabel: "CC",
    skillAwards: [choice("combat-skill", 1, "anyCombat")], automation: ["weapon:close-combatant", "defense:melee-shock-immunity"],
    level1: "Gain any combat skill as a bonus skill. Pistol-sized ranged weapons suffer no proximity penalty in melee. Ignore Shock damage from melee attackers, even while unarmored.",
    level2: "Shock from your melee attacks treats targets as AC 10. Fighting Withdrawal becomes an On Turn action that you may perform freely."
  },
  {
    focusKey: "cyberdoc", name: "Cyberdoc", maxLevel: 2, iconLabel: "CY",
    skillAwards: [fixed("fix-heal", 1, "Fix", "Heal")], automation: ["manual-reminder:cyberdoc"],
    level1: "Gain Fix and Heal as bonus skills and a cyberdoc kit. You may implant cyberware with Heal-0 and gain +2 on implant-surgery checks. Your maintenance reduces a patient's total implant System Strain by 1 until their next maintenance interval.",
    level2: "Your maintenance reduction becomes 2. You never botch cyberware installation. Once per patient, build and install one eligible cyber modification without dollar or experimental-component cost if you meet its skill requirements."
  },
  {
    focusKey: "deadeye", name: "Deadeye", maxLevel: 2, iconLabel: "DE",
    skillAwards: [fixed("shoot", 1, "Shoot")], automation: ["weapon:deadeye", "focus-action:deadeye-target-shot"],
    level1: "Gain Shoot as a bonus skill. Ready a Stowed ranged weapon as an Instant action. Use rifles and other two-handed ranged weapons in melee at -4 to hit. Add Shoot to qualifying ranged-weapon damage. A thrown weapon cannot receive both Deadeye and Armsmaster benefits.",
    level2: "Reload ordinary guns, crossbows, and other weapons that normally take no more than one round as an On Turn action. Use ranged weapons of any size in melee without penalty. Once per scene, make an On Turn target shot against an inanimate non-creature target; it hits unless the Shoot check dice show 2 or the shot is impossible."
  },
  {
    focusKey: "diplomat", name: "Diplomat", maxLevel: 2, iconLabel: "DI",
    skillAwards: [fixed("talk", 1, "Talk")], automation: ["skill:diplomat", "focus-action:diplomat-reaction"],
    level1: "Gain Talk as a bonus skill. Speak all languages common to the city, learn a new one conversationally in a week, and become fluent in a month. Reroll 1s on skill-check dice for negotiation or diplomacy when the player identifies the check as qualifying.",
    level2: "Once per game session, after at least thirty seconds of conversation, shift an intelligent NPC's reaction one step toward friendly."
  },
  {
    focusKey: "drone-pilot", name: "Drone Pilot", maxLevel: 2, iconLabel: "DP",
    skillAwards: [fixed("drive-fix", 1, "Drive", "Fix")], automation: ["drone:pilot", "focus-action:drone-main-action"],
    level1: "Gain Drive and Fix as bonus skills, a fitted Remote Control Unit, and drones within the level-based drone budget. Repair your drones without spare parts, replace destroyed drones after a week, and always count as carrying a zero-Encumbrance drone repair kit.",
    level2: "Use Assume Command once per round as an On Turn action. Once per scene, gain a bonus Main Action to command a drone. Drones you control gain +2 to hit, including attacks you do not personally fire."
  },
  {
    focusKey: "expert-programmer", name: "Expert Programmer", maxLevel: 2, iconLabel: "EP",
    skillAwards: [fixed("program", 1, "Program")], automation: ["focus-action:expert-programmer-edit", "network:expert-programmer"],
    level1: "Gain Program as a bonus skill. Create and maintain character level + 2 additional program elements, divided between Verbs and Subjects and changeable after a week. Once per day as an On Turn action, temporarily change one Subject element you wrote into any other Subject.",
    level2: "Program elements you write use half normal Memory. A cyberdeck you use gains CPU equal to your Program skill."
  },
  {
    focusKey: "healer", name: "Healer", maxLevel: 2, iconLabel: "HE",
    skillAwards: [fixed("heal", 1, "Heal")], automation: ["skill:healer", "focus-action:healer-first-aid"],
    level1: "Gain Heal as a bonus skill. Stabilize one adjacent mortally wounded person each round as an On Turn action. Heal checks use 3d6, keeping the best two dice.",
    level2: "Technological healing you apply restores twice the normal hit points. Ten minutes of group first aid with basic supplies restores 1d6 + Heal hit points to every injured group member without System Strain; each target can benefit only once per day."
  },
  {
    focusKey: "henchkeeper", name: "Henchkeeper", maxLevel: 2, iconLabel: "HK",
    skillAwards: [fixed("lead", 1, "Lead")], automation: ["manual-reminder:henchkeeper"],
    level1: "Gain Lead as a bonus skill. In a suitable community, recruit loyal non-important henchmen within 24 hours, up to one per three character levels rounded up. They accompany you into danger but normally fight only to save themselves; their exact statistics depend on background and GM adjudication.",
    level2: "Your henchmen fight unless the odds are clearly overwhelming and are treated as Basic Corp Security. A capable NPC can become such a follower only after you earn that loyalty through meaningful help."
  },
  {
    focusKey: "many-faces", name: "Many Faces", maxLevel: 1, iconLabel: "MF",
    skillAwards: [fixed("sneak", 1, "Sneak")], automation: ["manual-reminder:many-faces"],
    level1: "Gain Sneak as a bonus skill. Maintain one deeply registered alternate identity per three character levels rounded up. Replace an identity after a week if desired or compromised. Identities cannot impersonate important people and require a Contact before involving a corporation."
  },
  {
    focusKey: "pop-idol", name: "Pop Idol", maxLevel: 2, iconLabel: "PI",
    skillAwards: [fixed("perform", 1, "Perform")], automation: ["manual-reminder:pop-idol"],
    level1: "Gain Perform as a bonus skill. Once per game week, mobilize roughly one hundred ordinary fans for a mildly risky or criminal task. Donations or merchandise provide $1,000 per character level, doubled at level 5 and quadrupled at level 10, but this fundraising works only once per month.",
    level2: "Mobilize up to one hundred fans per character level and route instructions through deniable fan leaders. Donation and merchandise income doubles again. Increase your Charisma modifier by +1, to a maximum of +2."
  },
  {
    focusKey: "roamer", name: "Roamer", maxLevel: 2, iconLabel: "RO",
    skillAwards: [fixed("survive-drive", 1, "Survive", "Drive")], automation: ["focus-action:roamer-reroll"],
    level1: "Gain Survive and Drive as bonus skills. Speak all common regional languages conversationally, never become lost, and acquire vehicles within the level-based budget. Replace lost or damaged vehicles at $10,000 per week.",
    level2: "Once per scene as an Instant action, reroll a failed skill check for safe travel or vehicle operation, including relevant repairs or negotiations."
  },
  {
    focusKey: "safe-haven", name: "Safe Haven", maxLevel: 2, iconLabel: "SH",
    skillAwards: [fixed("sneak", 1, "Sneak")], automation: ["manual-reminder:safe-haven"],
    level1: "Gain Sneak as a bonus skill. After a week in a neighborhood, arrange a secure safe house and affordable on-call medic or cyberdoc. It stays unnoticed unless Heat reaches 8+ or you compromise it, and remains safe at least 24 hours after compromise if you arrive unfollowed. Maintain no more active safe houses than your character level.",
    level2: "Local authorities protect your safe houses against ordinary pursuit while relations remain good. Safe havens may include a tech workshop or level-one cyberclinic equivalent."
  },
  {
    focusKey: "shocking-assault", name: "Shocking Assault", maxLevel: 2, iconLabel: "SA",
    skillAwards: [choice("punch-or-stab", 1, "choice", "Punch", "Stab")], automation: ["weapon:shocking-assault"],
    level1: "Gain Punch or Stab as a bonus skill. Shock from your weapons treats susceptible targets as AC 10 when the attack can harm them.",
    level2: "Add +2 to the Shock rating of every melee weapon and unarmed attack that already inflicts Shock. A normal hit still cannot deal less than its applicable Shock."
  },
  {
    focusKey: "snipers-eye", name: "Sniper's Eye", maxLevel: 2, iconLabel: "SE",
    skillAwards: [fixed("shoot", 1, "Shoot")], automation: ["manual-reminder:execution-attack"],
    level1: "Gain Shoot as a bonus skill. For ranged Execution Attack and target-shooting checks with guns, bows, or thrown weapons, roll 3d6 and keep the best two dice.",
    level2: "Ranged Execution Attacks do not miss. The target suffers -4 on the Physical save against immediate mortal injury; even on a successful save, the attack deals double normal damage."
  },
  {
    focusKey: "specialist", name: "Specialist", maxLevel: 2, iconLabel: "SP",
    skillAwards: [choice("specialist-skill", 1, "anyNonCombat")], configuration: ["specialist-skill"], automation: ["skill:specialist"],
    level1: "Choose a non-combat skill and gain it as a bonus skill. Checks with that configured skill use 3d6, keeping the best two dice. You may take this Focus again for a different skill.",
    level2: "Checks with the configured skill use 4d6, keeping the best two dice."
  },
  {
    focusKey: "tinker", name: "Tinker", maxLevel: 2, iconLabel: "TI",
    skillAwards: [fixed("fix", 1, "Fix")], automation: ["manual-reminder:tinker"],
    level1: "Gain Fix as a bonus skill. Double your Maintenance score. Vehicle, cyberware, and gear modifications cost half their normal dollars; experimental-component requirements are unchanged.",
    level2: "For building and maintaining modifications and calculating Maintenance only, treat Fix as one level higher, to a maximum of Fix-5. Advanced modifications require one fewer experimental component, to a minimum of zero."
  },
  {
    focusKey: "unarmed-combatant", name: "Unarmed Combatant", maxLevel: 2, iconLabel: "UC",
    skillAwards: [fixed("punch", 1, "Punch")], automation: ["weapon:unarmed-combatant"],
    level1: "Gain Punch as a bonus skill. Your unarmed attack damage is 1d6 at Punch-0, 1d8 at Punch-1, 1d10 at Punch-2, 1d12 at Punch-3, and 1d12+1 at Punch-4. At Punch-1+, it has Shock equal to Punch against AC 15. Add Punch once to unarmed damage but not twice to Shock. Lethal strikes use Trauma Die 1d6 and Trauma Rating x2. A free hand lets unarmed attacks bind ranged weapons as melee weapons do.",
    level2: "A missed Punch attack still deals an unmodified 1d6 plus any applicable Shock. Lethal unarmed attacks use Trauma Die 1d8."
  },
  {
    focusKey: "unique-gift", name: "Unique Gift", maxLevel: 1, iconLabel: "UG",
    skillAwards: [], configuration: ["gm-notes"], automation: ["manual-reminder:unique-gift"],
    level1: "Work with the GM to define a unique cybernetic, genetic, or exceptional ability that creates new options rather than merely improving an existing number. It should be comparable to another Focus, better than purchasable gear, and may require System Strain when especially powerful. Record the agreed details in GM Notes."
  },
  {
    focusKey: "unregistered", name: "Unregistered", maxLevel: 1, iconLabel: "UR",
    skillAwards: [], automation: ["manual-reminder:unregistered"],
    level1: "You have no usable government or corporate database identity, and newly added records corrupt or disappear within about a week. People can remember you, but computerized records cannot reliably track you. Banking and formal property ownership are generally unavailable; use cash or credit chips. With Many Faces, only your alternate identities remain usable."
  },
  {
    focusKey: "whirlwind-assault", name: "Whirlwind Assault", maxLevel: 2, iconLabel: "WA",
    skillAwards: [choice("stab-or-punch", 1, "choice", "Stab", "Punch")], automation: ["focus-action:whirlwind-shock", "focus-action:whirlwind-extra-attack"],
    level1: "Gain Stab or Punch as a bonus skill. Once per scene as an On Turn action, apply your Shock damage to every susceptible foe in melee range.",
    level2: "The first time each round that a normal attack kills someone through rolled damage or Shock, immediately gain one additional attack against a target in range with any Ready weapon. You choose the target and make the attack."
  }
]);

export const CWN_FOCUS_KEYS = Object.freeze(CWN_FOCI.map((focus) => focus.focusKey));
