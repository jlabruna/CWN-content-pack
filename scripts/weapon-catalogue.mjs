import {
  CONTENT_PACK_FLAG_SCOPE,
  contractForBaseWeapon
} from "./weapon-family-contract.mjs";
import {
  applyWeaponRollContract,
  weaponRollContractForBaseWeapon,
} from "./weapon-roll-contract.mjs";

/**
 * Harbour City Stories weapon catalogue installer
 * Foundry VTT v14 / Systems Without Number Redux v2.3.1
 *
 * Installed and updated through the CWN Content & Icon Pack settings menu.
 *
 * The installer:
 * - finds the native SWNR base weapon in World Items or an Item compendium;
 * - clones that native item so all SWNR schema fields remain intact;
 * - creates family folders below "Harbour City Stories Weapons";
 * - adopts a single exact-name World Item on the first run, for catalogues
 *   that were partly created by hand;
 * - uses stable flags for all subsequent idempotent updates.
 */

export async function installWeaponCatalogue() {
  "use strict";

  const INSTALLER_VERSION = "2.2.0";
  const FLAG_SCOPE = "harbour-city-stories";
  const ROOT_FOLDER_NAME = "Harbour City Stories Weapons";
  const ICON_MODULE_ID = "cwn-content-pack";
  const ICON_MODULE_PATH = `modules/${ICON_MODULE_ID}/assets/icons/weapons`;

  if (!game.user?.isGM) {
    return ui.notifications.error("Only a GM can install the Harbour City Stories weapon catalogue.");
  }

  if (game.system.id !== "swnr") {
    return ui.notifications.error(
      `This macro requires Systems Without Number Redux (swnr). The active system is "${game.system.id}".`
    );
  }

  if (game.system.version !== "2.3.1") {
    ui.notifications.warn(
      `This macro was prepared for SWNR 2.3.1. You are running ${game.system.version}; native base-item cloning will reduce compatibility risk.`
    );
  }

  const iconModuleActive = game.modules.get(ICON_MODULE_ID)?.active === true;
  if (!iconModuleActive) {
    ui.notifications.warn(
      "CWN Content & Icon Pack is not enabled. Weapons will retain their existing images; enable the module and rerun this installer to apply catalogue icons."
    );
  }

  const manufacturerData = {
    blackhound: {
      name: "Blackhound Arms",
      slogan: "When backup isn't coming.",
      perkName: "Field Service",
      perk:
        "Maintenance costs are reduced by <strong>25%</strong>. Replacement parts are common almost everywhere, making repairs quicker and easier to arrange.",
    },
    helix: {
      name: "Helix Dynamics",
      slogan: "Tomorrow's firefight. Today.",
      perkName: "Certified Ecosystem",
      perk:
        "Factory servicing costs are reduced by <strong>20%</strong> at authorised Helix Dynamics service centres. Factory modifications installed by authorised Helix technicians require <strong>half the normal installation time</strong>. Helix equipment is easy to source in major cities but difficult to repair in remote areas.",
    },
    titan: {
      name: "Titan Industrial Defence",
      slogan: "Still standing after everyone else isn't.",
      perkName: "Overbuilt",
      perk:
        "Ignore the first point of Maintenance accumulated between services. Titan Industrial Defence weapons are engineered for extended deployments with minimal logistical support.",
    },
    shintech: {
      name: "ShinTech Systems",
      slogan: "Because perfection leaves no witnesses.",
      perkName: "Premium Engineering",
      perk:
        "Authenticated ShinTech weapons sold by their registered lawful owner through an authorised dealer retain <strong>80%</strong> of their base weapon and ordinary modification value. Stolen, undocumented or illegally modified weapons use the normal rules for fencing loot. Licensed armourers gain a <strong>+1 bonus</strong> to checks made to modify or repair ShinTech equipment due to exceptional manufacturing consistency.",
    },
    ironbark: {
      name: "Ironbark Outdoor Industries",
      slogan: "Beyond the city limits.",
      perkName: "Licensed Outfitter Network",
      perk:
        "Ironbark equipment is distributed through licensed outdoor, agricultural and sporting retailers. Ironbark products never require a Contact to source wherever the underlying item is legal. The owner gains a <strong>+1 bonus</strong> on relevant Talk or Administer checks made to license, transport or explain restricted Ironbark equipment as legitimate sporting, agricultural or wilderness gear. This benefit is lost if the item has illegal aftermarket modifications.",
    },
    generic: {
      name: "Various Manufacturers",
      slogan: "Available wherever sporting goods are sold.",
    },
    antique: {
      name: "Unrecorded",
      slogan: "Some weapons outlive their makers.",
    },
  };

  const integralSuppressorRule =
    "Integral Suppressor heavily reduces the weapon's report. Firing does not automatically alert everyone throughout the location; nearby people can still hear and recognise the shot, while detection at greater distances depends on circumstances or a Notice check set by the GM.";

  // Sale prices deliberately ignore factory-installation premiums. They use the
  // base weapon plus the ordinary listed cost of each installed modification.
  const baseWeaponCosts = Object.freeze({
    "Combat Rifle": 2500,
    "Submachine Gun": 2000,
    "Automatic Rifle": 10000,
    "Combat Shotgun": 3000,
    "Light Pistol": 200,
    "Heavy Pistol": 200,
    Shotgun: 200,
    "Semi-Auto Shotgun": 1000,
    Rifle: 1000,
    "Sniper Rifle": 3000,
    "Taser Pistol": 500,
    Mortar: 5000,
    "Heavy Machine Gun": 10000,
    "Anti-Materiel Rifle": 8000,
    "Rocket Launcher": 5000,
    Knife: 20,
    Club: 50,
    Spear: 50,
    Sword: 200,
    "Big Sword": 500,
    "Advanced Knife": 200,
    "Advanced Sword": 1000,
    "Advanced Big Sword": 2500,
    "Advanced Club": 500,
  });

  const ordinaryModCosts = Object.freeze({
    Autotargeting: 5000,
    Concealed: 5000,
    Customized: 1000,
    "Extended Magazine": 1000,
    "Heavy Sabot": 2000,
    "Integral Toxins": 10000,
    "Onboard Gunlink": 10000,
    "Predictive Guidance": 15000,
    "Reel Wires": 2500,
    "Savage Impact": 5000,
    "Shock Burst": 5000,
    "Stun Rounds": 5000,
    "Thermal Charge": 7500,
    // Campaign mod: its 5,000-credit factory premium implies a 1,000-credit
    // ordinary installation cost under the standard x5 factory-mod rule.
    "Integral Suppressor": 1000,
  });

  const sniperRifleRule =
    "If the weapon is not fired from a rest in a prepared position, use the statistics of a normal Rifle instead. It can be reloaded with a Move action, or as an On Turn action if the user has at least Shoot-1.";

  const iconSlug = (value) =>
    String(value)
      .toLocaleLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  const iconPathFor = (weapon) =>
    `${ICON_MODULE_PATH}/${weapon.manufacturer}/${iconSlug(weapon.base)}.svg`;

  const makeWeapon = ({
    key,
    category = "Firearms",
    family,
    base,
    manufacturer,
    name,
    cost,
    mods = [],
    special = [],
    slogan,
    paragraphs,
    ab,
    damage,
    shockDamage,
    shockAC,
    magazine,
    rangeNormal,
    rangeMax,
    nonLethal,
  }) => ({
    key,
    category,
    family,
    base,
    manufacturer,
    name,
    cost,
    mods,
    special,
    slogan,
    paragraphs,
    overrides: {
      ab,
      damage,
      shockDamage,
      shockAC,
      magazine,
      rangeNormal,
      rangeMax,
      nonLethal,
    },
  });

  const weapons = [
    // -----------------------------------------------------------------------
    // Combat Rifles
    // -----------------------------------------------------------------------
    makeWeapon({
      key: "combat-rifle-blackhound-hound",
      family: "Combat Rifles",
      base: "Combat Rifle",
      manufacturer: "blackhound",
      name: "BH-12 Hound",
      cost: 2500,
      paragraphs: [
        "The BH-12 Hound is Blackhound Arms' entry-level combat rifle and one of the most common long arms found outside corporate armouries. Designed for independent security contractors, gangs and private citizens, it emphasises reliability, simple maintenance and affordable ownership over cutting-edge technology.",
        "Built around rugged stamped components and oversized controls, the Hound continues to function long after more sophisticated rifles have failed. Spare parts are inexpensive, field repairs are straightforward, and virtually every gunsmith knows how to service one.",
      ],
    }),
    makeWeapon({
      key: "combat-rifle-blackhound-wolf",
      family: "Combat Rifles",
      base: "Combat Rifle",
      manufacturer: "blackhound",
      name: "BH-27 Wolf",
      cost: 7500,
      magazine: 60,
      mods: ["Extended Magazine"],
      paragraphs: [
        "The BH-27 Wolf is Blackhound Arms' professional combat rifle and the company's most successful platform. Favoured by private security firms, police tactical units and mercenary companies, it expands on the dependable Hound with a factory-fitted extended magazine for prolonged engagements.",
        "Easy to strip, easy to repair and built from widely available components, the Wolf has earned a reputation as one of the most dependable rifles in circulation.",
      ],
    }),
    makeWeapon({
      key: "combat-rifle-blackhound-predator",
      family: "Combat Rifles",
      base: "Combat Rifle",
      manufacturer: "blackhound",
      name: "BH-46 Predator",
      cost: 17500,
      magazine: 60,
      mods: ["Extended Magazine", "Heavy Sabot"],
      special: ["Heavy Sabot ammunition can inflict Traumatic Hits against drones and vehicles."],
      paragraphs: [
        "The BH-46 Predator is Blackhound Arms' flagship combat rifle. Built for veteran operators who demand uncompromising reliability, it combines the Wolf's extended magazine with a factory-installed Heavy Sabot package while retaining the rugged simplicity that defines every Blackhound firearm.",
        "Designed to defeat hardened targets, drones and light vehicles, it has earned a reputation among mercenaries and professional security contractors as the rifle to carry when a mission may require more than dropping another gunman.",
      ],
    }),
    makeWeapon({
      key: "combat-rifle-helix-phantom",
      family: "Combat Rifles",
      base: "Combat Rifle",
      manufacturer: "helix",
      name: "HX-25 Phantom",
      cost: 12500,
      ab: 1,
      mods: ["Customized", "Integral Suppressor"],
      special: [
        "The +1 Attack Bonus from Customized applies only to the rifle's designated operator.",
        integralSuppressorRule,
      ],
      slogan: "Because every operator is unique.",
      paragraphs: [
        "The HX-25 Phantom is built around the principle that a weapon should be tailored to its operator and discreet in use rather than treated as interchangeable equipment. Every Phantom leaves the factory calibrated for a designated user, with its trigger geometry, stock alignment, recoil impulse and sighting systems precisely adjusted around an integral suppressor.",
        "Favoured by executive protection specialists and covert private contractors, the Phantom combines controlled rifle fire with a heavily reduced report. Anyone can fire it, but only its registered operator benefits from the full precision of Helix's customization programme.",
      ],
    }),
    makeWeapon({
      key: "combat-rifle-helix-wraith",
      family: "Combat Rifles",
      base: "Combat Rifle",
      manufacturer: "helix",
      name: "HX-31 Wraith",
      cost: 32500,
      ab: 2,
      mods: ["Customized", "Autotargeting"],
      special: [
        "The +1 Attack Bonus from Customized applies only to the rifle's designated operator.",
        "The additional +1 Attack Bonus from Autotargeting requires a compatible Gunlink or Cranial Jack.",
      ],
      slogan: "The rifle has already found the target.",
      paragraphs: [
        "The HX-31 Wraith builds upon the Phantom with Helix's factory-integrated Autotargeting suite. Motion sensors and predictive software continuously analyse weapon movement, refining the point of aim before each shot.",
        "Reserved for elite corporate response teams and government security agencies, the Wraith assumes its user possesses a compatible neural combat interface. Without that connection it remains an outstanding rifle, but connected operators unlock its full precision.",
      ],
    }),
    makeWeapon({
      key: "combat-rifle-helix-revenant",
      family: "Combat Rifles",
      base: "Combat Rifle",
      manufacturer: "helix",
      name: "HX-50 Revenant",
      cost: 307500,
      ab: 2,
      damage: "1d12+1",
      mods: ["Customized", "Predictive Guidance"],
      special: [
        "The +1 Attack Bonus from Customized applies only to the rifle's designated operator.",
        "Predictive Guidance requires a compatible Gunlink or Cranial Jack. When connected, it grants +1 Attack Bonus and +1 Damage.",
      ],
      slogan: "Tomorrow's battlefield, today.",
      paragraphs: [
        "The HX-50 Revenant represents the pinnacle of Helix Dynamics' combat rifle programme. Its predictive guidance package fuses weapon and neural-interface data to model recoil, target motion and orientation before the trigger is fully depressed.",
        "Its extraordinary cost places it beyond all but national special operations forces, corporate black teams and the wealthiest private clients. For those able to field it, the Revenant is a symbol of technological superiority as much as a weapon.",
      ],
    }),
    makeWeapon({
      key: "combat-rifle-titan-bastion",
      family: "Combat Rifles",
      base: "Combat Rifle",
      manufacturer: "titan",
      name: "TD-41 Bastion",
      cost: 12500,
      mods: ["Heavy Sabot"],
      special: ["Heavy Sabot ammunition can inflict Traumatic Hits against drones and vehicles."],
      paragraphs: [
        "The TD-41 Bastion was developed for armies expected to fight prolonged campaigns against mechanised opponents. Titan engineers focused on a rifle that would remain operational after months of mud, dust, heat and neglect.",
        "Its factory Heavy Sabot package gives ordinary infantry the ability to threaten drones, light vehicles and hardened targets without relying on specialist support weapons.",
      ],
    }),
    makeWeapon({
      key: "combat-rifle-titan-bulwark",
      family: "Combat Rifles",
      base: "Combat Rifle",
      manufacturer: "titan",
      name: "TD-52 Bulwark",
      cost: 17500,
      magazine: 60,
      mods: ["Heavy Sabot", "Extended Magazine"],
      special: ["Heavy Sabot ammunition can inflict Traumatic Hits against drones and vehicles."],
      slogan: "Hold the line.",
      paragraphs: [
        "The TD-52 Bulwark expands upon the Bastion with a factory-installed Extended Magazine, allowing infantry squads to maintain sustained fire without sacrificing Titan's renowned reliability.",
        "Its increased ammunition capacity and Heavy Sabot capability make it popular with military engineers, vehicle crews and defence units that frequently face lightly armoured threats.",
      ],
    }),
    makeWeapon({
      key: "combat-rifle-titan-aegis",
      family: "Combat Rifles",
      base: "Combat Rifle",
      manufacturer: "titan",
      name: "TD-64 Aegis",
      cost: 42500,
      ab: 1,
      magazine: 60,
      mods: ["Heavy Sabot", "Extended Magazine", "Autotargeting"],
      special: [
        "Heavy Sabot ammunition can inflict Traumatic Hits against drones and vehicles.",
        "Autotargeting grants a +1 Attack Bonus when used with a compatible Gunlink or Cranial Jack.",
      ],
      slogan: "Every soldier deserves an advantage.",
      paragraphs: [
        "The TD-64 Aegis is Titan's premier infantry combat rifle. Built upon the Bulwark, it integrates a ruggedised Autotargeting system designed for battlefield durability and dependable performance in adverse conditions.",
        "Issued to elite infantry and veteran NCOs, the Aegis combines sustained firepower, anti-armour capability and practical fire-control assistance in a single overbuilt package.",
      ],
    }),
    makeWeapon({
      key: "combat-rifle-shintech-kestrel",
      family: "Combat Rifles",
      base: "Combat Rifle",
      manufacturer: "shintech",
      name: "ST-22 Kestrel",
      cost: 7500,
      ab: 1,
      mods: ["Customized"],
      special: ["The +1 Attack Bonus from Customized applies only to the rifle's designated operator."],
      paragraphs: [
        "The ST-22 Kestrel embodies ShinTech Systems' uncompromising approach to firearms design. Every rifle is hand-fitted using individually matched components, producing exceptional balance, flawless trigger characteristics and remarkable consistency.",
        "Favoured by elite security professionals and discerning private clients, the Kestrel is built to disappear into the operator's hands, allowing instinct and training to take precedence over mechanical compromise.",
      ],
    }),
    makeWeapon({
      key: "combat-rifle-shintech-falcon",
      family: "Combat Rifles",
      base: "Combat Rifle",
      manufacturer: "shintech",
      name: "ST-37 Falcon",
      cost: 32500,
      ab: 1,
      mods: ["Customized", "Stun Rounds"],
      special: [
        "The +1 Attack Bonus from Customized applies only to the rifle's designated operator.",
        "Stun Rounds function as described in Cities Without Number.",
      ],
      slogan: "Precision. Without compromise.",
      paragraphs: [
        "Developed for specialist law enforcement and executive protection teams, the ST-37 Falcon pairs ShinTech craftsmanship with an integrated Stun Rounds system.",
        "It has become synonymous with hostage rescue, tactical intervention and high-risk arrest teams, reflecting ShinTech's belief that precision includes applying exactly the level of force a situation demands.",
      ],
    }),
    makeWeapon({
      key: "combat-rifle-shintech-peregrine",
      family: "Combat Rifles",
      base: "Combat Rifle",
      manufacturer: "shintech",
      name: "ST-80 Peregrine",
      cost: 307500,
      ab: 2,
      damage: "1d12+1",
      mods: ["Customized", "Predictive Guidance"],
      special: [
        "The +1 Attack Bonus from Customized applies only to the rifle's designated operator.",
        "Predictive Guidance requires a compatible Gunlink or Cranial Jack. When connected, it grants +1 Attack Bonus and +1 Damage.",
      ],
      slogan: "Masterpiece. Perfected.",
      paragraphs: [
        "The ST-80 Peregrine represents the pinnacle of ShinTech's craft. Its components are individually selected, polished and fitted before Predictive Guidance is added to complement rather than replace the operator's skill.",
        "Produced only in limited numbers, the Peregrine is reserved for premier special operations units, corporate security teams and private clients for whom cost is secondary to excellence.",
      ],
    }),

    // -----------------------------------------------------------------------
    // Submachine Guns
    // -----------------------------------------------------------------------
    makeWeapon({
      key: "submachine-gun-blackhound-jackal",
      family: "Submachine Guns",
      base: "Submachine Gun",
      manufacturer: "blackhound",
      name: "BH-16 Jackal",
      cost: 2000,
      paragraphs: [
        "The BH-16 Jackal is Blackhound Arms' compact answer to close-quarters violence. Built around a simple blowback action, generous tolerances and commonly available components, it gives security contractors, gang enforcers and independent operators reliable burst fire in a light package.",
        "The Jackal has little interest in refinement or prestige. It is inexpensive, easy to service and dependable in the cramped alleys, vehicles and interior spaces where full-sized rifles become a liability.",
      ],
    }),
    makeWeapon({
      key: "submachine-gun-blackhound-hyena",
      family: "Submachine Guns",
      base: "Submachine Gun",
      manufacturer: "blackhound",
      name: "BH-34 Hyena",
      cost: 62000,
      magazine: 40,
      mods: ["Extended Magazine", "Concealed", "Integral Suppressor"],
      special: [
        "Concealed construction makes the weapon much harder to recognise for what it is.",
        integralSuppressorRule,
      ],
      slogan: "Looks harmless. Isn't.",
      paragraphs: [
        "The BH-34 Hyena is a covert professional model built for operators who need serious close-range firepower to pass unnoticed before and after the shooting starts. Its disguised external architecture conceals the weapon's purpose, an integral suppressor heavily reduces its report, and an enlarged magazine supports prolonged burst fire.",
        "Popular with smugglers, undercover security teams and well-funded criminal crews, the Hyena is unusually expensive by Blackhound standards. Its buyers are paying for visual and acoustic discretion without surrendering the company's familiar reliability and ease of service.",
      ],
    }),
    makeWeapon({
      key: "submachine-gun-helix-shade",
      family: "Submachine Guns",
      base: "Submachine Gun",
      manufacturer: "helix",
      name: "HX-44 Shade",
      cost: 112000,
      ab: 1,
      mods: ["Customized", "Onboard Gunlink", "Integral Suppressor"],
      special: [
        "The +1 Attack Bonus from Customized applies only to the weapon's designated operator.",
        "The Onboard Gunlink allows the weapon to emulate the Gunlink cybersystem.",
        integralSuppressorRule,
      ],
      slogan: "Connection is accuracy.",
      paragraphs: [
        "The HX-44 Shade is a compact, suppressed smart weapon intended for executive protection details, corporate response teams and covert security personnel. Every Shade is calibrated for a designated operator before its onboard neural interface and integral suppressor are certified for service.",
        "Its integrated Gunlink architecture provides the functionality of the corresponding cybersystem without requiring a separate weapon interface, while its reduced report limits how far each engagement advertises the operator's position. The result is an expensive but remarkably self-contained close-protection platform.",
      ],
    }),
    makeWeapon({
      key: "submachine-gun-titan-phalanx",
      family: "Submachine Guns",
      base: "Submachine Gun",
      manufacturer: "titan",
      name: "TD-30 Phalanx",
      cost: 32000,
      ab: 1,
      magazine: 40,
      mods: ["Extended Magazine", "Autotargeting"],
      paragraphs: [
        "The TD-30 Phalanx is an overbuilt personal-defence weapon designed for vehicle crews, military police and security personnel operating in confined environments. Its enlarged magazine supports sustained burst fire, while a rugged Autotargeting package improves practical accuracy under battlefield pressure.",
        "Titan deliberately traded elegance for endurance. Oversized controls, reinforced housings and conservative electronics make the Phalanx heavier in appearance than its competitors, but dependable through long deployments and indifferent maintenance.",
      ],
    }),
    makeWeapon({
      key: "submachine-gun-shintech-kitsune",
      family: "Submachine Guns",
      base: "Submachine Gun",
      manufacturer: "shintech",
      name: "ST-14 Kitsune",
      cost: 32000,
      ab: 1,
      damage: "1d8-2",
      rangeNormal: 15,
      rangeMax: 50,
      nonLethal: true,
      mods: ["Customized", "Stun Rounds"],
      special: [
        "The +1 Attack Bonus from Customized applies only to the weapon's designated operator.",
        "Stun Rounds impose -2 damage, halve the weapon's ranges, and make its damage non-lethal.",
      ],
      slogan: "Control, perfectly delivered.",
      paragraphs: [
        "The ST-14 Kitsune is a precision less-lethal weapon developed for specialist police, executive protection and high-risk capture teams. Each weapon is fitted to its designated operator and factory-configured for ShinTech's proprietary Stun Rounds.",
        "The Kitsune sacrifices range and raw lethality for controlled force delivered with exceptional accuracy. Its immaculate construction and restrained profile have made it the preferred weapon of clients who need hostile targets taken alive.",
      ],
    }),

    // -----------------------------------------------------------------------
    // Automatic Rifles
    // -----------------------------------------------------------------------
    makeWeapon({
      key: "automatic-rifle-blackhound-mauler",
      family: "Automatic Rifles",
      base: "Automatic Rifle",
      manufacturer: "blackhound",
      name: "BH-55 Mauler",
      cost: 10000,
      paragraphs: [
        "The BH-55 Mauler is Blackhound Arms' answer to the need for dependable suppressive fire. Built around a brutally simple operating system with generous tolerances and readily available parts, it sacrifices refinement for reliability.",
        "Favoured by mercenary companies and independent security contractors, the Mauler has earned a reputation as an honest support weapon that refuses to quit.",
      ],
    }),
    makeWeapon({
      key: "automatic-rifle-helix-overseer",
      family: "Automatic Rifles",
      base: "Automatic Rifle",
      manufacturer: "helix",
      name: "HX-85 Overseer",
      cost: 315000,
      ab: 2,
      damage: "2d8+1",
      mods: ["Customized", "Predictive Guidance"],
      special: [
        "The +1 Attack Bonus from Customized applies only to the weapon's designated operator.",
        "Predictive Guidance requires a compatible Gunlink or Cranial Jack. When connected, it grants +1 Attack Bonus and +1 Damage.",
      ],
      paragraphs: [
        "The HX-85 Overseer combines sustained firepower with an advanced predictive targeting suite. Every weapon is calibrated to its designated operator while onboard systems analyse recoil, movement and firing solutions in real time.",
        "Reserved for elite corporate security and military special operations units, the Overseer transforms suppressive fire into a calculated exercise in battlefield control.",
      ],
    }),
    makeWeapon({
      key: "automatic-rifle-titan-rampart",
      family: "Automatic Rifles",
      base: "Automatic Rifle",
      manufacturer: "titan",
      name: "TD-80 Rampart",
      cost: 20000,
      mods: ["Heavy Sabot"],
      special: ["Heavy Sabot ammunition can inflict Traumatic Hits against drones and vehicles."],
      paragraphs: [
        "The TD-80 Rampart was designed so sustained fire remains effective against every target on the battlefield. Its factory Heavy Sabot package lets infantry suppress hostile forces while threatening drones, light vehicles and hardened positions.",
        "Widely issued to military formations, the Rampart supports advancing infantry and holds defensive positions under the harshest conditions.",
      ],
    }),
    makeWeapon({
      key: "automatic-rifle-titan-fortress",
      family: "Automatic Rifles",
      base: "Automatic Rifle",
      manufacturer: "titan",
      name: "TD-95 Fortress",
      cost: 25000,
      magazine: 20,
      mods: ["Heavy Sabot", "Extended Magazine"],
      special: ["Heavy Sabot ammunition can inflict Traumatic Hits against drones and vehicles."],
      slogan: "Hold the line.",
      paragraphs: [
        "The TD-95 Fortress pairs Heavy Sabot capability with an enlarged ammunition system for extended suppressive fire. It lets infantry maintain fire superiority while engaging armoured threats without changing weapons.",
        "The Fortress is synonymous with entrenched positions, convoy security and expeditionary operations where resupply cannot be guaranteed.",
      ],
    }),

    // -----------------------------------------------------------------------
    // Combat Shotguns
    // -----------------------------------------------------------------------
    makeWeapon({
      key: "combat-shotgun-blackhound-breacher",
      family: "Combat Shotguns",
      base: "Combat Shotgun",
      manufacturer: "blackhound",
      name: "BH-18 Breacher",
      cost: 3000,
      paragraphs: [
        "The BH-18 Breacher is a straightforward combat shotgun built for operators who value reliability over sophistication. Its robust action and forgiving tolerances keep it functioning in filthy conditions where more refined weapons fail.",
        "Favoured by mercenaries, security contractors and independent peacekeepers, it delivers devastating stopping power with minimal maintenance demands.",
      ],
    }),
    makeWeapon({
      key: "combat-shotgun-blackhound-enforcer",
      family: "Combat Shotguns",
      base: "Combat Shotgun",
      manufacturer: "blackhound",
      name: "BH-28 Enforcer",
      cost: 8000,
      magazine: 24,
      mods: ["Extended Magazine"],
      paragraphs: [
        "The BH-28 Enforcer builds upon the Breacher with a factory Extended Magazine, allowing overwhelming close-range firepower without frequent reloads.",
        "Popular with boarding teams, riot response units and mercenary assault squads, it remains a practical weapon designed to keep firing after more complicated systems fail.",
      ],
    }),
    makeWeapon({
      key: "combat-shotgun-helix-spectre",
      family: "Combat Shotguns",
      base: "Combat Shotgun",
      manufacturer: "helix",
      name: "HX-15 Spectre",
      cost: 308000,
      ab: 2,
      damage: "3d4+1",
      mods: ["Customized", "Predictive Guidance"],
      special: [
        "The +1 Attack Bonus from Customized applies only to the weapon's designated operator.",
        "Predictive Guidance requires a compatible Gunlink or Cranial Jack. When connected, it grants +1 Attack Bonus and +1 Damage.",
      ],
      paragraphs: [
        "The HX-15 Spectre is Helix Dynamics' vision of a modern close-quarters weapon. Each shotgun is calibrated to its designated operator and equipped with Predictive Guidance capable of analysing movement, recoil and target trajectories.",
        "Reserved for elite corporate security and special operations units, the Spectre excels during boarding actions, urban assaults and facility clearances.",
      ],
    }),
    makeWeapon({
      key: "combat-shotgun-titan-bulldog",
      family: "Combat Shotguns",
      base: "Combat Shotgun",
      manufacturer: "titan",
      name: "TD-12 Bulldog",
      cost: 13000,
      mods: ["Heavy Sabot"],
      special: ["Heavy Sabot ammunition can inflict Traumatic Hits against drones and vehicles."],
      paragraphs: [
        "The TD-12 Bulldog is a military assault shotgun engineered for breaching fortified positions and engaging hardened targets at close range.",
        "Its Heavy Sabot package, reinforced receiver and oversized controls reflect Titan's commitment to battlefield durability in bunkers, trenches and choke points.",
      ],
    }),
    makeWeapon({
      key: "combat-shotgun-titan-siege",
      family: "Combat Shotguns",
      base: "Combat Shotgun",
      manufacturer: "titan",
      name: "TD-24 Siege",
      cost: 18000,
      magazine: 24,
      mods: ["Heavy Sabot", "Extended Magazine"],
      special: ["Heavy Sabot ammunition can inflict Traumatic Hits against drones and vehicles."],
      paragraphs: [
        "The TD-24 Siege pairs Heavy Sabot capability with a factory Extended Magazine, allowing assault teams to sustain devastating close-range fire without frequent reloads.",
        "Designed for breaching operations and prolonged urban combat, it combines anti-materiel capability with the reliability expected of Titan heavy infantry equipment.",
      ],
    }),

    // -----------------------------------------------------------------------
    // Light Pistols
    // -----------------------------------------------------------------------
    makeWeapon({
      key: "light-pistol-blackhound-mutt",
      family: "Light Pistols",
      base: "Light Pistol",
      manufacturer: "blackhound",
      name: "BH-5 Mutt",
      cost: 200,
      paragraphs: [
        "The BH-5 Mutt is Blackhound Arms' smallest and least expensive defensive firearm. Built from proven components with deliberately forgiving tolerances, it is intended for ordinary citizens, low-budget security personnel and operators who need a backup weapon they can neglect without consequence.",
        "The Mutt is neither elegant nor prestigious, but it is easy to conceal, simple to service and supported by an enormous supply of interchangeable parts. For many owners, it is the pistol kept close when every more impressive weapon is out of reach.",
      ],
    }),
    makeWeapon({
      key: "light-pistol-blackhound-coyote",
      family: "Light Pistols",
      base: "Light Pistol",
      manufacturer: "blackhound",
      name: "BH-19 Coyote",
      cost: 60200,
      magazine: 30,
      mods: ["Extended Magazine", "Concealed", "Integral Suppressor"],
      special: [
        "Concealed construction makes the weapon much harder to recognise for what it is.",
        integralSuppressorRule,
      ],
      slogan: "More bite than it shows.",
      paragraphs: [
        "The BH-19 Coyote is a covert high-capacity pistol developed for smugglers, undercover contractors and security personnel operating under restrictive weapons laws. Its disguised profile makes it difficult to identify as a firearm, its integral suppressor heavily reduces the report, and its enlarged magazine offers far more endurance than its modest appearance suggests.",
        "Although unusually expensive for a Blackhound pistol, the Coyote remains mechanically straightforward and compatible with the company's ubiquitous service network. It is designed for buyers who need both visual and acoustic discretion without trusting delicate boutique engineering.",
      ],
    }),
    makeWeapon({
      key: "light-pistol-helix-whisper",
      family: "Light Pistols",
      base: "Light Pistol",
      manufacturer: "helix",
      name: "HX-6 Whisper",
      cost: 110200,
      ab: 1,
      mods: ["Customized", "Onboard Gunlink", "Integral Suppressor"],
      special: [
        "The +1 Attack Bonus from Customized applies only to the weapon's designated operator.",
        "The Onboard Gunlink allows the weapon to emulate the Gunlink cybersystem.",
        integralSuppressorRule,
      ],
      slogan: "Intelligence, pocket-sized.",
      paragraphs: [
        "The HX-6 Whisper is a compact, integrally suppressed smart sidearm built for executive protection, discreet corporate carry and wealthy private clients. Each pistol is calibrated to its designated operator and fitted with a self-contained Gunlink interface, placing Helix's combat ecosystem into a weapon small enough for daily concealment.",
        "The Whisper is prized less for raw stopping power than for integration, consistency and a heavily reduced firing report. It offers a registered operator the handling of a bespoke pistol and the functionality of a neural weapon interface without requiring a separate Gunlink installation.",
      ],
    }),
    makeWeapon({
      key: "light-pistol-shintech-suzume",
      family: "Light Pistols",
      base: "Light Pistol",
      manufacturer: "shintech",
      name: "ST-5 Suzume",
      cost: 5200,
      ab: 1,
      mods: ["Customized"],
      special: [
        "The +1 Attack Bonus from Customized applies only to the weapon's designated operator.",
      ],
      slogan: "Small form. Perfect balance.",
      paragraphs: [
        "The ST-5 Suzume is ShinTech's refined interpretation of the everyday defensive pistol. Its individually matched components, immaculate trigger and carefully balanced frame make it exceptionally controllable despite its compact dimensions.",
        "Popular with collectors, plain-clothes professionals and discerning civilians, the Suzume is factory-fitted to its designated owner. It is an understated sidearm for buyers who believe craftsmanship should be felt rather than advertised.",
      ],
    }),
    makeWeapon({
      key: "light-pistol-shintech-tsubame",
      family: "Light Pistols",
      base: "Light Pistol",
      manufacturer: "shintech",
      name: "ST-18 Tsubame",
      cost: 30200,
      ab: 1,
      damage: "1d6-2",
      rangeNormal: 5,
      rangeMax: 40,
      nonLethal: true,
      mods: ["Customized", "Stun Rounds"],
      special: [
        "The +1 Attack Bonus from Customized applies only to the weapon's designated operator.",
        "Stun Rounds impose -2 damage, halve the weapon's ranges, and make its damage non-lethal.",
      ],
      slogan: "Restraint without hesitation.",
      paragraphs: [
        "The ST-18 Tsubame is a compact less-lethal pistol designed for executive protection, plain-clothes police and medical security teams. Each weapon is fitted to its designated operator and engineered around ShinTech Stun Rounds for precise incapacitation at close range.",
        "Its reduced range and stopping power are deliberate compromises in service of controlled force. The Tsubame is carried by professionals whose work demands that a dangerous subject be stopped quickly, cleanly and alive.",
      ],
    }),

    // -----------------------------------------------------------------------
    // Heavy Pistols
    // -----------------------------------------------------------------------
    makeWeapon({
      key: "heavy-pistol-blackhound-sidearm",
      family: "Heavy Pistols",
      base: "Heavy Pistol",
      manufacturer: "blackhound",
      name: "BH-9 Sidearm",
      cost: 200,
      paragraphs: [
        "The BH-9 Sidearm is a dependable service pistol designed for professionals who need a weapon that works every time the trigger is pulled. Durable internals and easily sourced parts let it thrive where maintenance opportunities are scarce.",
        "Widely issued to mercenary companies, private security and frontier law enforcement, the BH-9 offers no unnecessary technology—only dependable performance.",
      ],
    }),
    makeWeapon({
      key: "heavy-pistol-blackhound-viper",
      family: "Heavy Pistols",
      base: "Heavy Pistol",
      manufacturer: "blackhound",
      name: "BH-11 Viper",
      cost: 5200,
      magazine: 16,
      mods: ["Extended Magazine"],
      paragraphs: [
        "The BH-11 Viper equips the proven Sidearm platform with a factory Extended Magazine, giving operators twice the ammunition before reloading.",
        "Favoured by security personnel, bounty hunters and boarding teams, it provides greater staying power without sacrificing Blackhound's rugged construction.",
      ],
    }),
    makeWeapon({
      key: "heavy-pistol-helix-ghost",
      family: "Heavy Pistols",
      base: "Heavy Pistol",
      manufacturer: "helix",
      name: "HX-8 Ghost",
      cost: 10200,
      ab: 1,
      mods: ["Customized", "Integral Suppressor"],
      special: [
        "The +1 Attack Bonus from Customized applies only to the weapon's designated operator.",
        integralSuppressorRule,
      ],
      paragraphs: [
        "The HX-8 Ghost is a premium suppressed combat sidearm individually calibrated for its designated operator. Precision manufacturing, extensive factory fitting and an integral suppressor provide exceptional handling with a heavily reduced report.",
        "Favoured by executive protection and covert corporate security personnel, the Ghost delivers controlled stopping power and discretion through engineering rather than excessive complexity.",
      ],
    }),
    makeWeapon({
      key: "heavy-pistol-helix-specter",
      family: "Heavy Pistols",
      base: "Heavy Pistol",
      manufacturer: "helix",
      name: "HX-12 Specter",
      cost: 310200,
      ab: 2,
      damage: "1d8+1",
      mods: ["Customized", "Predictive Guidance", "Integral Suppressor"],
      special: [
        "The +1 Attack Bonus from Customized applies only to the weapon's designated operator.",
        "Predictive Guidance requires a compatible Gunlink or Cranial Jack. When connected, it grants +1 Attack Bonus and +1 Damage.",
        integralSuppressorRule,
      ],
      paragraphs: [
        "The HX-12 Specter is the pinnacle of Helix's suppressed smart-sidearm philosophy. Each pistol is calibrated to its operator and pairs an integral suppressor with Predictive Guidance that analyses movement, recoil and target behaviour.",
        "Reserved for elite corporate response and special operations personnel, it offers extraordinary neural-linked performance while limiting the distance at which each shot reveals the operator's position.",
      ],
    }),
    makeWeapon({
      key: "heavy-pistol-titan-legion",
      family: "Heavy Pistols",
      base: "Heavy Pistol",
      manufacturer: "titan",
      name: "TD-5 Legion",
      cost: 10200,
      mods: ["Heavy Sabot"],
      special: ["Heavy Sabot ammunition can inflict Traumatic Hits against drones and vehicles."],
      paragraphs: [
        "The TD-5 Legion is a military service pistol designed to remain effective against hardened targets. Its factory Heavy Sabot package gives personnel a sidearm capable of engaging drones and light vehicles.",
        "Built for harsh deployments, the Legion is favoured by vehicle crews, combat engineers and personnel who need compact battlefield durability.",
      ],
    }),
    makeWeapon({
      key: "heavy-pistol-shintech-ronin",
      family: "Heavy Pistols",
      base: "Heavy Pistol",
      manufacturer: "shintech",
      name: "ST-6 Ronin",
      cost: 5200,
      ab: 1,
      mods: ["Customized"],
      special: ["The +1 Attack Bonus from Customized applies only to the weapon's designated operator."],
      paragraphs: [
        "The ST-6 Ronin is a precision-crafted combat sidearm built for professionals who demand flawless performance. Every component is individually machined, hand-fitted and calibrated to its designated owner.",
        "Favoured by specialist security and discerning private operators, the Ronin reflects ShinTech's belief that excellence comes from craftsmanship rather than mass production.",
      ],
    }),
    makeWeapon({
      key: "heavy-pistol-shintech-daimyo",
      family: "Heavy Pistols",
      base: "Heavy Pistol",
      manufacturer: "shintech",
      name: "ST-9 Daimyo",
      cost: 305200,
      ab: 2,
      damage: "1d8+1",
      mods: ["Customized", "Predictive Guidance"],
      special: [
        "The +1 Attack Bonus from Customized applies only to the weapon's designated operator.",
        "Predictive Guidance requires a compatible Gunlink or Cranial Jack. When connected, it grants +1 Attack Bonus and +1 Damage.",
      ],
      paragraphs: [
        "The ST-9 Daimyo is ShinTech's flagship combat pistol, combining master craftsmanship with advanced predictive targeting. It pairs exquisite mechanical precision with guidance systems that enhance performance without compromising handling.",
        "Produced in limited numbers, the Daimyo is carried by elite bodyguards, executives and specialist operatives who demand uncompromising quality.",
      ],
    }),
    makeWeapon({
      key: "shotgun-ironbark-drover",
      family: "Shotguns",
      base: "Shotgun",
      manufacturer: "ironbark",
      name: "Ironbark Drover",
      cost: 200,
      paragraphs: [
        "The Ironbark Drover is Ironbark's uncomplicated break-action shotgun for farms, wilderness camps and isolated homesteads. Its simple action, durable furniture and widely available ammunition make it equally suitable for hunting, pest control and emergency defence.",
        "Affordable enough to be kept behind a farmhouse door or carried in a utility vehicle, the Drover is not intended to compete with military combat shotguns. It is an honest civilian tool built to remain dependable through poor weather, rough handling and infrequent servicing.",
      ],
    }),
    makeWeapon({
      key: "semi-auto-shotgun-ironbark-wayfarer",
      family: "Semi-Auto Shotguns",
      base: "Semi-Auto Shotgun",
      manufacturer: "ironbark",
      name: "Ironbark Wayfarer",
      cost: 1000,
      paragraphs: [
        "The Ironbark Wayfarer is a dependable semi-automatic sporting shotgun developed for hunters, wilderness professionals and practical shooting competitors. Its six-round action provides rapid follow-up shots without the restricted military features or conspicuous profile of a combat shotgun.",
        "Balanced for long days in the field and built around components that can be serviced by ordinary sporting armourers, the Wayfarer is common among rural security patrols, expedition crews and anyone who needs more capacity than a traditional break-action gun.",
      ],
    }),
    makeWeapon({
      key: "rifle-ironbark-longreach",
      family: "Rifles",
      base: "Rifle",
      manufacturer: "ironbark",
      name: "Ironbark Longreach",
      cost: 1000,
      paragraphs: [
        "The Ironbark Longreach is Ironbark's general-purpose hunting and field rifle, designed for accurate fire across open country without the expense or legal complications of military hardware. Its full-power cartridge, six-round magazine and conventional controls make it suitable for game hunting, predator control and competitive target shooting.",
        "The Longreach is widely carried by wilderness guides, agricultural contractors and remote communities that value reach and decisive single-shot performance over burst fire and high-capacity magazines. Like most Ironbark equipment, it is deliberately conventional, easy to understand and supported by a broad rural dealer network.",
      ],
    }),
    makeWeapon({
      key: "sniper-rifle-blackhound-longfang",
      family: "Sniper Rifles",
      base: "Sniper Rifle",
      manufacturer: "blackhound",
      name: "BH-62 Longfang",
      cost: 3000,
      special: [sniperRifleRule],
      slogan: "Distance is just another kind of cover.",
      paragraphs: [
        "The BH-62 Longfang is a rugged bolt-action precision rifle built for mercenary marksmen, bounty hunters and frontier security teams. It uses conventional components, a reinforced action and uncomplicated optics chosen for their ability to hold zero after hard travel and indifferent treatment.",
        "The Longfang lacks the electronic assistance of more expensive corporate rifles, but its affordability and broad parts compatibility make it a dependable choice for operators who may need to maintain a long-range weapon far from a certified armourer.",
      ],
    }),
    makeWeapon({
      key: "sniper-rifle-helix-eidolon",
      family: "Sniper Rifles",
      base: "Sniper Rifle",
      manufacturer: "helix",
      name: "HX-92 Eidolon",
      cost: 138000,
      ab: 2,
      mods: ["Customized", "Autotargeting", "Onboard Gunlink", "Integral Suppressor"],
      special: [
        sniperRifleRule,
        "The +1 Attack Bonus from Customized applies only to the rifle's designated operator.",
        "Autotargeting grants an additional +1 Attack Bonus when used with a compatible Gunlink or Cranial Jack.",
        "The Onboard Gunlink allows the rifle to emulate the Gunlink cybersystem and satisfies the interface requirement for Autotargeting.",
        integralSuppressorRule,
      ],
      slogan: "The shot arrives before the warning.",
      paragraphs: [
        "The HX-92 Eidolon is a suppressed networked sniper system developed for corporate counter-sniper teams and deniable special operations. Each rifle is calibrated to a designated operator and combines ruggedised Autotargeting with an Onboard Gunlink that links its fire-control systems directly to the user's neural impulses.",
        "An integral suppressor limits how far each shot reveals the firing position, while Helix's targeting suite refines the operator's aim before the trigger breaks. The Eidolon is expensive and dependent on certified support, but within that ecosystem it is a remarkably complete covert precision platform.",
      ],
    }),
    makeWeapon({
      key: "sniper-rifle-titan-watchtower",
      family: "Sniper Rifles",
      base: "Sniper Rifle",
      manufacturer: "titan",
      name: "TD-88 Watchtower",
      cost: 43000,
      ab: 1,
      magazine: 2,
      mods: ["Heavy Sabot", "Extended Magazine", "Autotargeting"],
      special: [
        sniperRifleRule,
        "Heavy Sabot ammunition allows the rifle to inflict Traumatic Hits against drones and vehicles.",
        "Extended Magazine doubles the rifle's ammunition capacity from 1 to 2 rounds.",
        "Autotargeting grants a +1 Attack Bonus when used with a compatible Gunlink or Cranial Jack.",
      ],
      slogan: "Own the ground you can see.",
      paragraphs: [
        "The TD-88 Watchtower is Titan Industrial Defence's precision counter-machine rifle for military reconnaissance units, defensive strongpoints and counter-drone teams. Its reinforced Heavy Sabot system allows a trained marksman to interdict drones, exposed vehicle systems and lightly armoured machines at extreme range without carrying a true 20 mm anti-materiel weapon.",
        "A two-round ammunition system and ruggedised Autotargeting package give the Watchtower greater battlefield endurance without compromising its role as a portable marksman's rifle. It is built to place precise fire on vulnerable machine components and light targets; operators facing heavy cyborgs, concrete barriers or substantial vehicles step up to Titan's much larger Ballista platform.",
      ],
    }),
    makeWeapon({
      key: "sniper-rifle-shintech-osprey",
      family: "Sniper Rifles",
      base: "Sniper Rifle",
      manufacturer: "shintech",
      name: "ST-70 Osprey",
      cost: 8000,
      ab: 1,
      mods: ["Customized"],
      special: [
        sniperRifleRule,
        "The +1 Attack Bonus from Customized applies only to the rifle's designated operator.",
      ],
      slogan: "Precision begins with the shooter.",
      paragraphs: [
        "The ST-70 Osprey is a bespoke precision rifle assembled around the measurements, posture and shooting habits of its designated owner. ShinTech armourers individually fit the stock, trigger, action and optic alignment until the rifle settles naturally into the operator's prepared firing position.",
        "The Osprey contains little exotic technology. Its accuracy comes from exceptional materials, meticulous tolerances and the intimate fit between weapon and shooter, making it a favourite among professional marksmen who distrust unnecessary battlefield electronics.",
      ],
    }),
    makeWeapon({
      key: "sniper-rifle-shintech-gyrfalcon",
      family: "Sniper Rifles",
      base: "Sniper Rifle",
      manufacturer: "shintech",
      name: "ST-99 Gyrfalcon",
      cost: 308000,
      ab: 2,
      damage: "2d8+1",
      mods: ["Customized", "Predictive Guidance"],
      special: [
        sniperRifleRule,
        "The +1 Attack Bonus from Customized applies only to the rifle's designated operator.",
        "Predictive Guidance requires a compatible Gunlink or Cranial Jack. When connected, it grants +1 Attack Bonus and +1 Damage.",
      ],
      slogan: "One movement. One conclusion.",
      paragraphs: [
        "The ST-99 Gyrfalcon is ShinTech's master-grade sniper rifle, beginning as a hand-fitted Osprey before receiving a Predictive Guidance system individually harmonised with both weapon and owner. The electronics do not replace the marksman's judgement; they model movement, recoil and atmospheric changes quickly enough to let craftsmanship and training operate at their absolute limit.",
        "Produced in tiny numbers for premier counter-terror units, state marksmen and extraordinarily wealthy professionals, the Gyrfalcon is as much a commissioned instrument as a manufactured firearm. Each example is documented, supported and valued as an individual work.",
      ],
    }),
    makeWeapon({
      key: "taser-pistol-ironbark-shepherd",
      family: "Taser Pistols",
      base: "Taser Pistol",
      manufacturer: "ironbark",
      name: "Ironbark Shepherd",
      cost: 500,
      damage: "1d6",
      shockDamage: 2,
      shockAC: 13,
      nonLethal: true,
      special: [
        "All damage inflicted by the weapon is non-lethal.",
        "On a missed attack against a target with AC 13 or lower, the weapon inflicts 2 non-lethal Shock damage.",
      ],
      slogan: "Control the danger. Preserve the life.",
      paragraphs: [
        "The Ironbark Shepherd is a compact electrical deterrent sold for wildlife control, farm safety and civilian self-defence. Its uncomplicated two-shot design gives rangers, animal handlers and isolated workers a way to stop a dangerous person or animal without immediately resorting to lethal force.",
        "Ironbark distributes the Shepherd through agricultural suppliers and outdoor retailers alongside its ordinary field equipment. It is inexpensive, easy to license and deliberately free of proprietary electronics, making replacement cartridges and routine servicing widely accessible.",
      ],
    }),
    makeWeapon({
      key: "taser-pistol-helix-compliance",
      family: "Taser Pistols",
      base: "Taser Pistol",
      manufacturer: "helix",
      name: "HX-18 Compliance",
      cost: 35500,
      ab: 1,
      damage: "1d6",
      shockDamage: 2,
      shockAC: 13,
      magazine: 4,
      nonLethal: true,
      mods: ["Customized", "Extended Magazine", "Shock Burst"],
      special: [
        "All damage inflicted by the weapon is non-lethal.",
        "On a missed attack against a target with AC 13 or lower, the weapon inflicts 2 non-lethal Shock damage.",
        "The +1 Attack Bonus from Customized applies only to the weapon's designated operator.",
        "Extended Magazine doubles the weapon's ammunition capacity from 2 to 4 shots.",
        "Once per fight, declare Shock Burst before making the attack. On a hit, roll [[/r 2d6]] bonus non-lethal electrical damage. On a miss against AC 13 or lower, the attack inflicts 4 non-lethal Shock instead of 2.",
      ],
      slogan: "Compliance at the speed of thought.",
      paragraphs: [
        "The HX-18 Compliance is Helix Dynamics' premium less-lethal sidearm for executive security, high-risk detention teams and corporate facility response units. Each weapon is factory-calibrated to a designated officer and carries twice the cartridge capacity of an ordinary taser pistol.",
        "Its Shock Burst capacitor can deliver a single intensified discharge during each engagement, overwhelming resistant targets without changing the weapon's non-lethal purpose. The Compliance is extravagantly expensive for a restraint device, but institutions that value controlled force and documented accountability consider that expense preferable to a fatal incident.",
      ],
    }),

    // -----------------------------------------------------------------------
    // Heavy Weapons
    // -----------------------------------------------------------------------
    makeWeapon({
      key: "mortar-titan-bombard",
      category: "Heavy Weapons",
      family: "Mortars",
      base: "Mortar",
      manufacturer: "titan",
      name: "TD-102 Bombard",
      cost: 5000,
      special: [
        "The mortar has a minimum range of 200 metres and can fire indirectly over buildings and other obstacles.",
        "A new target point is initially treated as AC 20. Each consecutive round fired at the same target point gains a cumulative +1 Attack Bonus when a forward spotter is adjusting the aim.",
        "A mortar round affects a 10-metre radius like a fragmentation grenade but inflicts 3d6 damage at the blast's base. Armor does not lessen damage from mortar rounds.",
        "Each mortar round costs 50 credits and counts as one item of encumbrance.",
      ],
      slogan: "Reach beyond the wall.",
      paragraphs: [
        "The TD-102 Bombard is Titan Industrial Defence's compact infantry mortar for dense urban battlefields and long deployments beyond reliable fire support. Its reinforced baseplate, oversized adjustment controls and uncomplicated sighting assembly are designed to survive repeated displacement between rooftops, courtyards and improvised firing pits.",
        "Titan supplies the Bombard to expeditionary forces, planetary defence units and corporate armies that need organic indirect fire without depending on aircraft or vehicle-mounted artillery. It is neither subtle nor light, but it can place explosive force behind cover that direct-fire weapons cannot reach.",
      ],
    }),
    makeWeapon({
      key: "heavy-machine-gun-blackhound-hellhound",
      category: "Heavy Weapons",
      family: "Heavy Machine Guns",
      base: "Heavy Machine Gun",
      manufacturer: "blackhound",
      name: "BH-75 Hellhound",
      cost: 10000,
      special: [
        "The weapon can fire to suppress only when fixed to a vehicle or stationary firing position.",
        "Without a fixed firing position or vehicle mount, recoil makes the weapon almost uncontrollable.",
        "Each round of Heavy Machine Gun ammunition costs 100 credits and counts as a full item of encumbrance.",
        "The weapon's Trauma Die can inflict Traumatic Hits on drones, vehicles and other machines.",
      ],
      slogan: "Put it down. Keep it down.",
      paragraphs: [
        "The BH-75 Hellhound is Blackhound Arms at its most direct: an old-fashioned heavy machine gun built from proven components, generous tolerances and parts that can be replaced far from a corporate service centre. Mercenary companies mount it on trucks, strongpoints and improvised fighting vehicles wherever sustained heavy fire matters more than elegance.",
        "The Hellhound is brutally difficult to control away from a proper mount, but once emplaced it delivers the dependable suppressive fire that made the design a fixture of militias and irregular armies. Its appetite for ammunition is substantial; its willingness to keep working under neglect is greater.",
      ],
    }),
    makeWeapon({
      key: "heavy-machine-gun-titan-citadel",
      category: "Heavy Weapons",
      family: "Heavy Machine Guns",
      base: "Heavy Machine Gun",
      manufacturer: "titan",
      name: "TD-125 Citadel",
      cost: 40000,
      ab: 1,
      magazine: 20,
      mods: ["Extended Magazine", "Autotargeting"],
      special: [
        "Extended Magazine doubles the weapon's ammunition capacity from 10 to 20 rounds.",
        "Autotargeting grants a +1 Attack Bonus when used with a compatible Gunlink or Cranial Jack.",
        "The weapon can fire to suppress only when fixed to a vehicle or stationary firing position.",
        "Without a fixed firing position or vehicle mount, recoil makes the weapon almost uncontrollable.",
        "Each round of Heavy Machine Gun ammunition costs 100 credits and counts as a full item of encumbrance.",
        "The weapon's Trauma Die can inflict Traumatic Hits on drones, vehicles and other machines.",
      ],
      slogan: "The position holds.",
      paragraphs: [
        "The TD-125 Citadel is Titan Industrial Defence's premier sustained-fire system, pairing an enlarged ammunition feed with a ruggedised Autotargeting package designed for vehicle mounts and fortified positions. Its fire-control hardware assists a linked gunner without sacrificing the overbuilt construction expected of Titan battlefield equipment.",
        "Citadels guard convoy turrets, hardened checkpoints and defensive lines where a stoppage can collapse an entire position. Once mounted and supplied, the weapon can dominate an approach for as long as its crew and ammunition remain available.",
      ],
    }),
    makeWeapon({
      key: "anti-materiel-rifle-titan-ballista",
      category: "Heavy Weapons",
      family: "Anti-Materiel Rifles",
      base: "Anti-Materiel Rifle",
      manufacturer: "titan",
      name: "TD-110 Ballista",
      cost: 8000,
      special: [
        "Use of a secure firing rest is recommended for best results.",
        "The weapon's Trauma Die can inflict Traumatic Hits on drones, vehicles and other machines.",
      ],
      slogan: "Some cover is only scenery.",
      paragraphs: [
        "The TD-110 Ballista is a portable 20 mm cannon built to defeat targets beyond the practical limits of an ordinary sniper rifle. Its massive action and reinforced recoil assembly launch rounds capable of punching through lighter armour plate, concrete walls, large drones and heavily cybered combatants.",
        "Where Titan's Watchtower is a precision counter-machine rifle, the Ballista is an unapologetic anti-materiel weapon. It is heavier, harder to conceal and best fired from a secure rest, but it carries five full-power rounds and delivers raw destructive force without relying on targeting electronics or specialist interfaces.",
      ],
    }),
    makeWeapon({
      key: "rocket-launcher-blackhound-dragon",
      category: "Heavy Weapons",
      family: "Rocket Launchers",
      base: "Rocket Launcher",
      manufacturer: "blackhound",
      name: "BH-73 Dragon",
      cost: 5000,
      special: [
        "The launcher is a single-shot disposable weapon.",
        "Attacks against human-sized targets suffer a -4 penalty to hit.",
        "The standard fragmentation warhead inflicts fragmentation-grenade damage on every target within 5 metres of the impact point.",
        "A specialised anti-armour warhead loses the fragmentation blast but inflicts double damage against vehicles and obstacles.",
        "The weapon's Trauma Die can inflict Traumatic Hits on drones, vehicles and other machines.",
      ],
      slogan: "One tube. One answer.",
      paragraphs: [
        "The BH-73 Dragon is a disposable rocket launcher engineered for militias, mercenary companies and independent operators who need immediate anti-vehicle force without maintaining a complex guided-weapon system. Its sealed launch tube tolerates long storage, rough transport and hurried deployment with minimal preparation.",
        "Dragons are inexpensive by heavy-weapon standards and common wherever Blackhound distributors can reach. The standard warhead is effective against clustered personnel, while specialised anti-armour rounds turn the same simple launcher into a threat to vehicles and hardened obstacles.",
      ],
    }),
    makeWeapon({
      key: "rocket-launcher-helix-harbinger",
      category: "Heavy Weapons",
      family: "Rocket Launchers",
      base: "Rocket Launcher",
      manufacturer: "helix",
      name: "HX-120 LUCY",
      cost: 130000,
      ab: 1,
      mods: ["Autotargeting", "Onboard Gunlink"],
      special: [
        "Autotargeting grants a +1 Attack Bonus when used through a compatible Gunlink or Cranial Jack.",
        "The Onboard Gunlink allows the launcher to emulate the Gunlink cybersystem and satisfies the interface requirement for Autotargeting.",
        "The launcher is a single-shot disposable weapon.",
        "Attacks against human-sized targets suffer a -4 penalty to hit.",
        "The standard fragmentation warhead inflicts fragmentation-grenade damage on every target within 5 metres of the impact point.",
        "A specialised anti-armour warhead loses the fragmentation blast but inflicts double damage against vehicles and obstacles.",
        "The weapon's Trauma Die can inflict Traumatic Hits on drones, vehicles and other machines.",
      ],
      slogan: "Let L.U.C.Y. handle the introduction.",
      paragraphs: [
        "The HX-120 LUCY—formally the Launcher Unit, Cyberlinked, Yield-Optimised—is Helix Dynamics' premium single-use guided launcher for corporate response teams and special operations units. Its integrated Onboard Gunlink feeds firing data directly into a ruggedised Autotargeting suite, giving the operator a refined firing solution before the rocket leaves the tube.",
        "L.U.C.Y.'s calm synthetic targeting prompts and unusually personable diagnostic system have led many operators to treat the launcher less like disposable equipment and more like another member of the team. Its extraordinary price reflects its certified sensors, self-contained neural interface and tightly controlled warhead package, reserved for missions where striking a vehicle or fortified target on the first attempt matters more than cost.",
      ],
    }),

    // -----------------------------------------------------------------------
    // Melee and Thrown Weapons
    // -----------------------------------------------------------------------
    makeWeapon({
      key: "knife-ironbark-trailknife",
      category: "Melee and Thrown Weapons",
      family: "Knives",
      base: "Knife",
      manufacturer: "ironbark",
      name: "Ironbark Trailknife",
      cost: 20,
      slogan: "The tool that stays on your belt.",
      paragraphs: [
        "The Ironbark Trailknife is a practical fixed-blade field knife intended for hunters, guides, agricultural workers and expedition crews. Its broad utility blade is equally suited to dressing game, cutting rope, preparing camp and serving as a last-resort defensive weapon.",
        "Ironbark makes the Trailknife from ordinary, easily sharpened materials rather than exotic alloys. Replacement sheaths and grips are available through almost any outdoor supplier, and its unthreatening sporting profile rarely attracts the attention given to purpose-built combat blades.",
      ],
    }),
    makeWeapon({
      key: "club-generic-baseball-bat",
      category: "Melee and Thrown Weapons",
      family: "Clubs",
      base: "Club",
      manufacturer: "generic",
      name: "Regulation Baseball Bat",
      cost: 50,
      special: [
        "The weapon's damage is non-lethal unless the wielder deliberately chooses otherwise. Non-lethal hits do not roll the Trauma Die.",
      ],
      slogan: "League weight. Street proven.",
      paragraphs: [
        "This regulation sporting bat is sold by countless manufacturers in timber, composite and light-alloy versions. It is balanced for ordinary league play, inexpensive to replace and sturdy enough to survive years in a school equipment cage or the boot of a commuter's car.",
        "On the street, a baseball bat draws less immediate suspicion than a dedicated melee weapon while remaining a substantial length of reinforced material. Brand, colour and team markings vary, but the underlying performance is much the same.",
      ],
    }),
    makeWeapon({
      key: "spear-ironbark-tidemark-harpoon",
      category: "Melee and Thrown Weapons",
      family: "Spears",
      base: "Spear",
      manufacturer: "ironbark",
      name: "Ironbark Tidemark Harpoon",
      cost: 12550,
      mods: ["Reel Wires"],
      special: [
        "Reel Wires link the harpoon to a wrist spool with retractable line. It can be retrieved as an On Turn action.",
        "The retracting line can drag up to 20 kilograms. It can be cut by a properly timed attack with a sharp weapon but is too thin and sharp to be safely grabbed. Broken wires require fifteen minutes to replace.",
      ],
      slogan: "Bring the catch home.",
      paragraphs: [
        "The Ironbark Tidemark Harpoon is a powered sporting harpoon for commercial divers, offshore hunters and wilderness crews working around large aquatic animals. Its balanced shaft functions as an ordinary hand spear, while a reinforced wrist-spool line retrieves a thrown harpoon without forcing the user to abandon secure footing.",
        "Although designed for fishing and marine work, the Tidemark has found an enthusiastic following among urban operators who appreciate a reusable thrown weapon with an integrated line. Ironbark continues to market it exclusively as licensed outdoor equipment.",
      ],
    }),
    makeWeapon({
      key: "spear-titan-phalanx",
      category: "Melee and Thrown Weapons",
      family: "Spears",
      base: "Spear",
      manufacturer: "titan",
      name: "TD-18 Phalanx",
      cost: 25050,
      damage: "1d6+1",
      shockDamage: 3,
      mods: ["Savage Impact"],
      special: [
        "Savage Impact is built into the spear's powered striking surfaces, granting +1 damage and +1 Shock.",
      ],
      slogan: "Reach wins the first exchange.",
      paragraphs: [
        "The TD-18 Phalanx is Titan Industrial Defence's tactical polearm for riot formations, boarding teams and augmented infantry operating in confined approaches. A reinforced shaft and powered impact head let the weapon deliver substantially greater force than a conventional spear without compromising its ability to be thrown.",
        "The Phalanx is uncommon in ordinary line units but valued by specialist teams that need reach, mechanical simplicity and a weapon that remains useful when ammunition or electronics fail. Like most Titan equipment, it is designed to withstand treatment that would ruin a sporting implement.",
      ],
    }),
    makeWeapon({
      key: "sword-generic-mall-katana",
      category: "Melee and Thrown Weapons",
      family: "Swords",
      base: "Sword",
      manufacturer: "generic",
      name: "Mall Katana",
      cost: 200,
      slogan: "Authentic styling. Affordable steel.",
      paragraphs: [
        "The mall katana is a mass-produced sword sold through martial-arts shops, enthusiast catalogues and neon-lit retail arcades. Most examples combine a machine-finished blade with synthetic fittings and enough functional construction to make them dangerous despite their theatrical presentation.",
        "Collectors argue endlessly over brands, tempering and historical accuracy, but most street examples are mechanically interchangeable. They are inexpensive, conspicuous and entirely capable of turning an argument into a medical emergency.",
      ],
    }),
    makeWeapon({
      key: "big-sword-antique-claymore",
      category: "Melee and Thrown Weapons",
      family: "Big Swords",
      base: "Big Sword",
      manufacturer: "antique",
      name: "Antique Claymore",
      cost: 500,
      special: [
        "This is a two-handed weapon, making it impossible to have a Readied item in the wielder's off hand.",
      ],
      slogan: "Some weapons outlive their makers.",
      paragraphs: [
        "This two-handed claymore is a genuine antique or a careful reproduction built according to traditional proportions. Its long grip, broad blade and substantial reach demand room and commitment, making it thoroughly impractical for ordinary street carry but terrifying when brought into open combat.",
        "Surviving originals vary enormously in age and provenance, while modern reproductions are commissioned by historical martial artists and wealthy collectors. Whatever its origin, a properly constructed claymore remains a formidable piece of sharpened steel.",
      ],
    }),
    makeWeapon({
      key: "advanced-knife-blackhound-ripper",
      category: "Melee and Thrown Weapons",
      family: "Advanced Knives",
      base: "Advanced Knife",
      manufacturer: "blackhound",
      name: "BH-16 Ripper",
      cost: 75200,
      damage: "1d6+1",
      shockDamage: 3,
      mods: ["Concealed", "Savage Impact"],
      special: [
        "Concealed construction makes the knife impossible to detect without a full minute spent thoroughly patting down the bearer.",
        "Savage Impact grants +1 damage and +1 Shock through powered impact plates and vibrating cutting surfaces.",
      ],
      slogan: "The last weapon they find.",
      paragraphs: [
        "The BH-16 Ripper is a compact military fighting knife designed for mercenaries, covert security teams and operators who expect every visible weapon to be confiscated. Adaptive materials disguise its outline and apparent purpose, while powered cutting surfaces give the small blade a disproportionate ability to tear through protective clothing and flesh.",
        "Blackhound sells the Ripper through restricted professional channels but makes few efforts to control the secondary market. Its simple powered mechanism and broadly available replacement components have made it a favourite last-ditch weapon throughout the underworld.",
      ],
    }),
    makeWeapon({
      key: "advanced-sword-shintech-raijin",
      category: "Melee and Thrown Weapons",
      family: "Advanced Swords",
      base: "Advanced Sword",
      manufacturer: "shintech",
      name: "ST-55 Raijin",
      cost: 306000,
      ab: 2,
      damage: "1d10+1",
      shockDamage: 4,
      mods: ["Customized", "Predictive Guidance"],
      special: [
        "The +1 Attack Bonus from Customized applies only to the sword's designated owner.",
        "Predictive Guidance requires a compatible Gunlink or Cranial Jack. When connected, it grants +1 Attack Bonus, +1 damage and +1 Shock.",
      ],
      slogan: "Perfection at the moment of contact.",
      paragraphs: [
        "The ST-55 Raijin is ShinTech's signature weapon for corporate samurai, elite bodyguards and wealthy duelists who treat close combat as both profession and identity. Every blade is fitted to its designated owner before a Predictive Guidance core is tuned to their reach, posture and neural timing.",
        "When connected to compatible cyberware, the Raijin analyses movement and collision geometry quickly enough to guide minute corrections throughout a strike. Its extraordinary price buys neither tradition nor ornament alone, but a precision combat system built around a single operator.",
      ],
    }),
    makeWeapon({
      key: "advanced-big-sword-titan-warcleaver",
      category: "Melee and Thrown Weapons",
      family: "Advanced Big Swords",
      base: "Advanced Big Sword",
      manufacturer: "titan",
      name: "TD-72 Warcleaver",
      cost: 52500,
      damage: "2d8+1",
      shockDamage: 5,
      mods: ["Savage Impact", "Shock Burst"],
      special: [
        "Savage Impact grants +1 damage and +1 Shock through powered impact plates and vibrating cutting surfaces.",
        "Once per fight, activate Shock Burst as an On Turn action. The next attack inflicts [[/r 2d6]] additional electrical damage and +2 Shock. This additional damage is not affected by the usual +3 cap on weapon hit and damage bonuses.",
        "This is a two-handed weapon, making it impossible to have a Readied item in the wielder's off hand.",
      ],
      slogan: "Breach the line in one stroke.",
      paragraphs: [
        "The TD-72 Warcleaver is a powered two-handed assault blade built for heavily augmented shock troops and security units expected to break fortified close-combat positions. Vibrating cutting surfaces amplify every impact, while a bank of discharge capacitors can flood the blade with a single overwhelming electrical burst.",
        "Its mass and violent recoil make the Warcleaver unsuitable for ordinary personnel, but a strong operator can use it to shatter shields, disable armoured opponents and force open a path through a packed defensive line. Titan considers it a specialist breaching weapon rather than a duelling sword.",
      ],
    }),
    makeWeapon({
      key: "advanced-club-titan-breachhammer",
      category: "Melee and Thrown Weapons",
      family: "Advanced Clubs",
      base: "Advanced Club",
      manufacturer: "titan",
      name: "TD-60 Breachhammer",
      cost: 63000,
      damage: "1d8+1",
      shockDamage: 3,
      mods: ["Savage Impact", "Thermal Charge"],
      special: [
        "Savage Impact grants +1 damage and +1 Shock through powered impact plates and vibrating striking surfaces.",
        "Thermal Charge can be activated as an On Turn action. While active, it adds +2 heat damage and +2 Shock against targets not impervious to heat for two fights. Replacing its batteries and cooling the elements requires one hour.",
        "The weapon's damage is non-lethal unless the wielder deliberately chooses otherwise. Non-lethal hits do not roll the Trauma Die.",
      ],
      slogan: "Every entrance is temporary.",
      paragraphs: [
        "The TD-60 Breachhammer is a compact tactical sledge designed for forced entry, obstacle clearance and close combat in structures too confined for a full-sized demolition tool. Powered striking plates multiply the force of ordinary swings against doors, locks and armoured opponents.",
        "When resistance exceeds brute force alone, the operator can activate a bank of thermal cells embedded behind the hammer face. For two engagements the heated striking surfaces add destructive thermal energy to every impact, after which the assembly must cool and receive fresh batteries.",
      ],
    }),
  ];

  const escapeHtml = (value) =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const formatCredits = (value) => `${Math.floor(value).toLocaleString("en-US")}&cent;`;

  const ordinaryBuildValue = (weapon) => {
    const baseCost = baseWeaponCosts[weapon.base];
    if (!Number.isFinite(baseCost)) {
      throw new Error(`No ordinary base cost is configured for ${weapon.base}.`);
    }

    return weapon.mods.reduce((total, mod) => {
      const modCost = ordinaryModCosts[mod];
      if (!Number.isFinite(modCost)) {
        throw new Error(`No ordinary modification cost is configured for ${mod}.`);
      }
      return total + modCost;
    }, baseCost);
  };

  const buildDescription = (weapon) => {
    const manufacturer = manufacturerData[weapon.manufacturer];
    const ordinaryValue = ordinaryBuildValue(weapon);
    const fenceMinimum = Math.floor(ordinaryValue * 0.1);
    const fenceMaximum = Math.floor(ordinaryValue * 0.25);
    const legalRate = weapon.manufacturer === "shintech" ? 0.8 : 0.5;
    const legalValue = Math.floor(ordinaryValue * legalRate);
    const salePrice = [
      "<h3>Sale Price</h3>",
      `<p><strong>Fence:</strong> ${formatCredits(fenceMinimum)}&ndash;${formatCredits(fenceMaximum)} <em>(10&ndash;25% of ${formatCredits(ordinaryValue)})</em><br>`,
      `<strong>Legally Owned:</strong> ${formatCredits(legalValue)} <em>(${Math.round(legalRate * 100)}% of ${formatCredits(ordinaryValue)})</em></p>`,
    ].join("");
    const modList = weapon.mods.length
      ? `<ul>${weapon.mods.map((mod) => `<li>${escapeHtml(mod)}</li>`).join("")}</ul>`
      : "<p>None</p>";
    const specialRules = weapon.special.length
      ? `<h3>Special Rules</h3><ul>${weapon.special
          .map((rule) => `<li>${escapeHtml(rule)}</li>`)
          .join("")}</ul>`
      : "";
    const paragraphs = weapon.paragraphs
      .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
      .join("");
    const manufacturerPerk =
      manufacturer.perkName && manufacturer.perk
        ? [
            "<h3>Manufacturer Perk</h3>",
            `<p><strong>${escapeHtml(manufacturer.perkName)}</strong><br>${manufacturer.perk}</p>`,
          ].join("")
        : "";

    return [
      `<p><strong>Manufacturer:</strong> ${escapeHtml(manufacturer.name)}</p>`,
      `<p><strong>Platform:</strong> ${escapeHtml(weapon.base)}</p>`,
      `<p><strong>Model:</strong> ${escapeHtml(weapon.name)}</p>`,
      `<p><em>&ldquo;${escapeHtml(weapon.slogan ?? manufacturer.slogan)}&rdquo;</em></p>`,
      salePrice,
      paragraphs,
      "<h3>Factory Modifications</h3>",
      modList,
      specialRules,
      manufacturerPerk,
    ].join("");
  };

  const normalized = (value) => String(value ?? "").trim().toLocaleLowerCase();

  const findBaseItem = async (baseName) => {
    const worldMatch = game.items.find(
      (item) => item.type === "weapon" && normalized(item.name) === normalized(baseName)
    );
    if (worldMatch) return worldMatch;

    for (const pack of game.packs.filter((candidate) => candidate.documentName === "Item")) {
      let index;
      try {
        index = await pack.getIndex({ fields: ["name", "type"] });
      } catch (error) {
        console.warn(`HCS installer could not index compendium ${pack.collection}`, error);
        continue;
      }

      const entry = index.find(
        (item) => item.type === "weapon" && normalized(item.name) === normalized(baseName)
      );
      if (entry) return pack.getDocument(entry._id);
    }

    return null;
  };

  const folderParentId = (folder) => folder?.folder?.id ?? folder?.folder ?? null;

  const findFolder = (name, parentId = null) =>
    game.folders.find(
      (folder) =>
        folder.type === "Item" &&
        folder.name === name &&
        (folderParentId(folder) ?? null) === (parentId ?? null)
    );

  const getOrCreateFolder = async (name, parentId = null) => {
    const existing = findFolder(name, parentId);
    if (existing) return existing;

    return Folder.create({
      name,
      type: "Item",
      folder: parentId,
      sorting: "a",
    });
  };

  const weaponFolderKey = (category, family) => `${category}::${family}`;

  const requiredBases = [...new Set(weapons.map((weapon) => weapon.base))];
  const baseItems = new Map();
  const missingBases = [];

  ui.notifications.info("Checking native SWNR weapon templates...");

  for (const baseName of requiredBases) {
    const item = await findBaseItem(baseName);
    if (item) baseItems.set(baseName, item);
    else missingBases.push(baseName);
  }

  if (missingBases.length) {
    const missing = missingBases.join(", ");
    console.error("HCS weapon installer missing native base items:", missingBases);
    return ui.notifications.error(
      `Installation stopped before making changes. Could not find these native SWNR weapons: ${missing}. Import them into World Items or enable their compendium, then run the macro again.`
    );
  }

  const rootFolder = await getOrCreateFolder(ROOT_FOLDER_NAME);
  const categoryFolders = new Map();
  for (const category of [...new Set(weapons.map((weapon) => weapon.category))]) {
    categoryFolders.set(category, await getOrCreateFolder(category, rootFolder.id));
  }

  const familyFolders = new Map();
  let migratedFamilyFolders = 0;
  const folderPairs = [
    ...new Map(
      weapons.map((weapon) => [
        weaponFolderKey(weapon.category, weapon.family),
        { category: weapon.category, family: weapon.family },
      ])
    ).entries(),
  ];

  for (const [key, { category, family }] of folderPairs) {
    const categoryFolder = categoryFolders.get(category);
    let familyFolder = findFolder(family, categoryFolder.id);

    if (!familyFolder) {
      const legacyFolder = findFolder(family, rootFolder.id);
      if (legacyFolder) {
        try {
          await legacyFolder.update({ folder: categoryFolder.id });
          familyFolder = legacyFolder;
          migratedFamilyFolders += 1;
        } catch (error) {
          console.warn(
            `HCS installer could not move legacy folder "${family}" beneath "${category}".`,
            error
          );
        }
      }
    }

    familyFolder ??= await getOrCreateFolder(family, categoryFolder.id);
    familyFolders.set(key, familyFolder);
  }

  const existingByKey = new Map(
    game.items
      .filter((item) => foundry.utils.getProperty(item, `flags.${FLAG_SCOPE}.catalogueKey`))
      .map((item) => [
        foundry.utils.getProperty(item, `flags.${FLAG_SCOPE}.catalogueKey`),
        item,
      ])
  );

  const worldWeaponsByName = new Map();
  for (const item of game.items.filter((candidate) => candidate.type === "weapon")) {
    const name = normalized(item.name);
    const matches = worldWeaponsByName.get(name) ?? [];
    matches.push(item);
    worldWeaponsByName.set(name, matches);
  }

  const summary = { created: 0, adopted: 0, updated: 0, failed: 0 };
  const failures = [];

  ui.notifications.info(`Installing ${weapons.length} Harbour City Stories weapons...`);

  for (const weapon of weapons) {
    try {
      const baseContract = contractForBaseWeapon(weapon.base);
      const rollContract = weaponRollContractForBaseWeapon(weapon.base);
      const baseItem = baseItems.get(weapon.base);
      const source = foundry.utils.deepClone(baseItem.toObject());
      delete source._id;
      delete source.folder;
      delete source.sort;
      delete source._stats;

      source.name = weapon.name;
      source.type = "weapon";
      source.folder = familyFolders.get(weaponFolderKey(weapon.category, weapon.family)).id;
      source.effects = [];
      const desiredIcon = iconPathFor(weapon);
      if (iconModuleActive) source.img = desiredIcon;
      source.flags = foundry.utils.mergeObject(source.flags ?? {}, {
        [FLAG_SCOPE]: {
          catalogueKey: weapon.key,
          installerVersion: INSTALLER_VERSION,
          baseWeapon: weapon.base,
          nativeSkill: rollContract.skill,
          category: weapon.category,
          manufacturer: manufacturerData[weapon.manufacturer].name,
        },
      });
      if (baseContract.reloadable) {
        source.flags = foundry.utils.mergeObject(source.flags, {
          [CONTENT_PACK_FLAG_SCOPE]: {
            weaponFamily: baseContract.weaponFamily
          }
        });
      }
      if (iconModuleActive) {
        source.flags[FLAG_SCOPE].managedIcon = desiredIcon;
      }

      source.system.description = buildDescription(weapon);
      source.system.cost = weapon.cost;
      applyWeaponRollContract(source.system, rollContract);

      if (weapon.overrides.ab !== undefined) {
        source.system.ab = weapon.overrides.ab;
      }
      if (weapon.overrides.damage !== undefined) {
        source.system.damage = weapon.overrides.damage;
      }
      if (weapon.overrides.shockDamage !== undefined) {
        source.system.shock ??= {};
        source.system.shock.damage = weapon.overrides.shockDamage;
      }
      if (weapon.overrides.shockAC !== undefined) {
        source.system.shock ??= {};
        source.system.shock.ac = weapon.overrides.shockAC;
      }
      if (weapon.overrides.magazine !== undefined) {
        source.system.ammo.max = weapon.overrides.magazine;
        source.system.ammo.value = weapon.overrides.magazine;
      }
      if (weapon.overrides.rangeNormal !== undefined) {
        source.system.range.normal = weapon.overrides.rangeNormal;
      }
      if (weapon.overrides.rangeMax !== undefined) {
        source.system.range.max = weapon.overrides.rangeMax;
      }
      if (weapon.overrides.nonLethal !== undefined) {
        source.system.nonLethal = weapon.overrides.nonLethal;
      }

      let existing = existingByKey.get(weapon.key);
      let adopted = false;

      if (!existing) {
        const exactNameMatches = worldWeaponsByName.get(normalized(weapon.name)) ?? [];
        if (exactNameMatches.length === 1) {
          existing = exactNameMatches[0];
          adopted = true;
        } else if (exactNameMatches.length > 1) {
          console.warn(
            `HCS installer found ${exactNameMatches.length} unflagged weapons named "${weapon.name}". ` +
              "None were adopted because the match is ambiguous."
          );
        }
      }

      if (existing) {
        const priorManagedIcon = foundry.utils.getProperty(
          existing,
          `flags.${FLAG_SCOPE}.managedIcon`
        );

        if (iconModuleActive) {
          const inheritedBaseIcon = baseItem.img;
          const hasManualIcon =
            Boolean(existing.img) &&
            existing.img !== desiredIcon &&
            existing.img !== priorManagedIcon &&
            existing.img !== inheritedBaseIcon &&
            existing.img !== "icons/svg/item-bag.svg";

          if (hasManualIcon) {
            source.img = existing.img;
            delete source.flags[FLAG_SCOPE].managedIcon;
          }
        } else if (existing.img) {
          // Keep current images unchanged when the companion icon module is unavailable.
          source.img = existing.img;
          if (priorManagedIcon) {
            source.flags[FLAG_SCOPE].managedIcon = priorManagedIcon;
          }
        }

        await existing.update(source, { diff: false, recursive: false });
        existingByKey.set(weapon.key, existing);
        if (adopted) summary.adopted += 1;
        summary.updated += 1;
      } else {
        const created = await Item.create(source);
        existingByKey.set(weapon.key, created);
        summary.created += 1;
      }
    } catch (error) {
      summary.failed += 1;
      failures.push(`${weapon.name}: ${error.message}`);
      console.error(`HCS weapon installer failed for ${weapon.name}`, error);
    }
  }

  const result =
    `Harbour City Stories weapons complete: ${summary.created} created, ` +
    `${summary.updated} updated (${summary.adopted} adopted by exact name), ` +
    `${summary.failed} failed; ${migratedFamilyFolders} family folders reorganised.`;

  if (summary.failed) {
    ui.notifications.warn(result);
    console.warn("HCS weapon installer failures:", failures);
  } else {
    ui.notifications.info(result);
  }

  console.log("Harbour City Stories weapon catalogue installer result", {
    installerVersion: INSTALLER_VERSION,
    systemVersion: game.system.version,
    weaponCount: weapons.length,
    migratedFamilyFolders,
    ...summary,
  });
}
