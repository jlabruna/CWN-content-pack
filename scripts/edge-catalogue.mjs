/** Canonical, paraphrased CWN Operator Edge catalogue and Underdog reference. */

const fixed = (id, ...skills) => ({ id, kind: "fixed", skills });
const choice = (id, kind, ...skills) => ({ id, kind, skills });

export const CWN_EDGES = Object.freeze([
  {
    edgeKey: "educated", name: "Educated", iconLabel: "ED", selectable: true,
    skillAwards: [choice("any-skill", "any")], configuration: ["bonus-skill"], automation: ["advancement:educated"],
    description: "Gain any skill as a bonus skill. Whenever a new character level grants skill points, gain one additional skill point. This benefit is retroactive if the Edge is gained at level 5."
  },
  {
    edgeKey: "face", name: "Face", iconLabel: "FA", selectable: true,
    skillAwards: [fixed("connect", "Connect")], configuration: [], automation: ["edge-action:face-acquaintance"],
    description: "Gain Connect as a bonus skill. Once per game week, declare a temporary Acquaintance Contact appropriate to the situation. Using this ability again replaces the previous acquaintance; the GM may allow one to become permanent after suitable payment or favors."
  },
  {
    edgeKey: "focused", name: "Focused", iconLabel: "FO", selectable: true,
    skillAwards: [], configuration: [], automation: ["manual-reminder:extra-focus"],
    description: "Gain one additional Focus pick at character creation. This can buy a new level-1 Focus or the second level of the initial Focus. This Edge may be selected more than once."
  },
  {
    edgeKey: "ghost", name: "Ghost", iconLabel: "GH", selectable: true,
    skillAwards: [fixed("sneak", "Sneak")], configuration: [], automation: ["edge-action:ghost-reroll", "edge-action:ghost-unseen-move", "manual-reminder:fighting-withdrawal"],
    description: "Gain Sneak as a bonus skill. Fighting Withdrawal becomes an On Turn action. Once per scene, reroll a failed Sneak check made to remain hidden or unseen. Once per day, take a Move action to move up to 10 meters while unseen; if you end behind cover, observers lose track of you."
  },
  {
    edgeKey: "hacker", name: "Hacker", iconLabel: "HA", selectable: true,
    skillAwards: [fixed("program", "Program")], configuration: [], automation: ["edge-action:hacker-main-action", "manual-reminder:hacker-starting-gear"],
    description: "Gain Program as a bonus skill. At character creation you may begin with a Cranial Jack, a scrap cyberdeck, and eight program elements divided between Verbs and Subjects. Each round, gain one bonus Main Action usable only for hacking or cyberspace mental actions, not drones or vehicles."
  },
  {
    edgeKey: "hard-to-kill", name: "Hard To Kill", iconLabel: "HK", selectable: true,
    skillAwards: [], configuration: ["native-hit-die", "native-trauma-target"], automation: ["setup:hard-to-kill"],
    description: "Roll 1d6+2 per character level instead of 1d6 when determining maximum hit points. If Traumatic Hit rules are used, increase the base Trauma Target by 1, normally from 6 to 7."
  },
  {
    edgeKey: "killing-blow", name: "Killing Blow", iconLabel: "KB", selectable: true,
    skillAwards: [choice("combat-skill", "anyCombat")], configuration: [], automation: ["damage:killing-blow", "trauma:killing-blow"],
    description: "Gain any combat skill as a bonus skill. Whenever you inflict hit point damage, increase it by 1 per two character levels, rounded up. Any Trauma Die you roll gains +1."
  },
  {
    edgeKey: "masterful-expertise", name: "Masterful Expertise", iconLabel: "ME", selectable: true,
    skillAwards: [], configuration: [], automation: ["edge-action:masterful-expertise"],
    description: "Once per scene, as an Instant action, reroll a failed non-combat skill check and use the new result."
  },
  {
    edgeKey: "on-target", name: "On Target", iconLabel: "OT", selectable: true,
    skillAwards: [choice("combat-skill", "anyCombat")], configuration: [], automation: ["attack:on-target"],
    description: "Gain any combat skill as a bonus skill. Your basic attack bonus equals your full character level instead of half your level rounded down."
  },
  {
    edgeKey: "prodigy", name: "Prodigy", iconLabel: "PR", selectable: true,
    skillAwards: [], configuration: ["attribute"], automation: ["setup:prodigy"],
    description: "Choose one attribute other than Constitution. Its score becomes 18 and its modifier becomes +3 rather than +2. A character who received the bonus Edge from the Underdog Rule cannot select Prodigy with that bonus."
  },
  {
    edgeKey: "operators-fortune", name: "Operator's Fortune", iconLabel: "OF", selectable: true,
    skillAwards: [], configuration: [], automation: ["edge-action:operators-fortune"],
    description: "Once per game session, use an Instant action after a bad event occurs during the current round and roll 1d6. On 1 you are unaffected by the event, on 2-5 it is averted, and on 6 it affects an enemy or rival instead when possible."
  },
  {
    edgeKey: "veterans-luck", name: "Veteran's Luck", iconLabel: "VL", selectable: true,
    skillAwards: [], configuration: [], automation: ["edge-action:veterans-luck"],
    description: "Once per scene, as an Instant action, turn a hit against you into a miss or turn your own missed attack into a hit. This can affect vehicle weapons you operate, but not crashes, falls, environmental hazards, or other non-attack events."
  },
  {
    edgeKey: "voice-of-the-people", name: "Voice of the People", iconLabel: "VP", selectable: true,
    skillAwards: [], configuration: ["friend-contact"], automation: ["setup:voice-of-the-people"],
    description: "Gain both levels of the Pop Idol Focus and one additional Friend Contact connected to your art or public persona."
  },
  {
    edgeKey: "wired", name: "Wired", iconLabel: "WI", selectable: true,
    skillAwards: [], configuration: [], automation: ["manual-reminder:wired"],
    description: "At character creation, obtain up to $200,000 in new or secondhand cyberware with free installation; secondhand implants receive their normal defect rolls. Maintenance is covered for two months. With GM approval, the benefit may be redeemed later by paying double and exchanging this Edge."
  },
  {
    edgeKey: "underdog-rule", name: "Underdog Rule", iconLabel: "UR", selectable: false,
    skillAwards: [], configuration: [], automation: ["manual-reference:underdog"],
    description: "Character-creation reference: after attributes and modifiers are finalized, a character whose six attribute modifiers total -1 or less gains one bonus Edge. That bonus cannot select a Deluxe magic Edge. An Underdog character cannot later spend skill points to improve attributes, though cyberware and Foci may improve modifiers."
  }
]);

export const CWN_EDGE_KEYS = Object.freeze(CWN_EDGES.map((edge) => edge.edgeKey));
