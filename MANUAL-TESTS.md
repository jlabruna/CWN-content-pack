# Foundry VTT 14.365 / SWNR 2.3.1 manual test checklist

Use CWN Content & Icon Pack 0.7.3 in a disposable Foundry V14 world running
SWNR 2.3.1. Tests marked as Combat Enhancements integration require CWN Combat
Enhancements 0.13.1.

Do not claim Foundry runtime success until these checks have been completed.

## Compendium and independence

- [ ] **CWN Ammunition & Reloads** appears and contains exactly 14 Items in four
      folders.
- [ ] **CWN Common Operator Gear** appears and contains exactly 27 Items in
      five folders.
- [ ] Every ammunition Item has a distinct original icon.
- [ ] Importing an ammunition Item creates only the requested World Item.
- [ ] Enabling the module creates no World Items automatically.
- [ ] Existing SWNR compendia and their documents remain unchanged.
- [ ] With CWN Combat Enhancements disabled, all four Content Pack compendia
      open and their Items can be imported or dragged onto actors.

## Common Operator Gear

- [ ] The pack contains these five folders and no others: Protective Gear,
      Carry and Clothing, Tools and Field Gear, Electronics, and Services and
      Supplies.
- [ ] No generic `Ammunition, empty magazine` or `Ammunition, per round` Item
      appears.
- [ ] All 27 Items display distinct custom icons and non-empty descriptions.
- [ ] Backpack has Cost 25, Encumbrance 1, No Encumbrance Readied enabled, Is
      Container enabled, and capacity 0/6.
- [ ] Gear Harness has Cost 25, Encumbrance 1, No Encumbrance Readied enabled,
      Is Container enabled, and capacity 0/4.
- [ ] Ordinary Clothing, Fashionable Clothing, Haute Couture Clothing, and
      Wearable Light have No Encumbrance Readied enabled.
- [ ] All remaining gear has No Encumbrance Readied disabled.
- [ ] Drag a 2-Encumbrance Item into Backpack; confirm it appears nested and
      Backpack capacity becomes 2/6.
- [ ] Move Backpack between Readied and Stowed; confirm the contained Item
      inherits Backpack's location.
- [ ] Attempt to place Gear Harness inside Backpack; confirm SWNR rejects
      nested containers.
- [ ] Fill Backpack to 6/6, then attempt to add another Encumbrance-1 Item;
      confirm SWNR reports insufficient capacity.
- [ ] Drag the contained Item back out; confirm its `containerId` relationship
      clears and Backpack capacity returns to 0/6.
- [ ] Import a gear Item into World Items, edit its name or cost, and confirm
      the compendium source remains unchanged.

## Item data

- [ ] Combat Rifle Magazine has Quantity 1, Cost 30, Encumbrance 0,
      Consumable Individual, Uses 30/30, Bundle Count disabled,
      No Encumbrance Readied disabled, and Is Container disabled.
- [ ] Automatic Rifle Ammunition Box has Cost 500 and Uses 10/10.
- [ ] Heavy Machine Gun Ammunition Box has Cost 1,000 and Uses 10/10.
- [ ] Mortar Round has Cost 50 and Uses 1/1.
- [ ] Imported copies remain distinct Items and can hold different Uses values.

## Combat Enhancements integration

- [ ] Import a Harbour City Stories Combat Rifle and confirm Weapon Family
      displays `combat-rifle`.
- [ ] Add a Combat Rifle Magazine to the same actor and confirm it appears in
      Compatible Magazine.
- [ ] A weapon at 0/30 plus magazine at 30/30 becomes 30/30 and deletes the
      depleted magazine.
- [ ] A weapon at 15/30 plus magazine at 22/30 becomes 30/30 and retains the
      magazine at 7/30.
- [ ] A Heavy Pistol Magazine is excluded from a Combat Rifle.
- [ ] Multiple partial Combat Rifle Magazines remain separate selector choices.
- [ ] A Stowed compatible magazine can reload.
- [ ] Automatic Rifle Ammunition Box transfers at most 10 Uses.
- [ ] Heavy Machine Gun Ammunition Box transfers at most 10 Uses.

## Regression

- [ ] Harbour City Stories Weapons still contains exactly 64 weapons.
- [ ] Open a Combat Rifle: confirm its native SWNR roll uses Dexterity and the
      dialog offers the actor's Shoot skill without any stale skill warning.
- [ ] Open an Ironbark Trailknife or another knife/sword: confirm it is marked
      as a melee weapon and SWNR offers Strength/Dexterity and Stab.
- [ ] Open a Spear: confirm it retains SWNR's thrown/ranged handling while its
      roll still offers Strength/Dexterity and Stab.
- [ ] Open a Mortar: confirm it retains SWNR's native Wisdom/Shoot mapping.
- [ ] Harbour City Stories Armor still contains exactly 14 armor Items.
- [ ] CWN Ammunition & Reloads still contains exactly 14 ammunition Items.
- [ ] Existing weapon and armor deterministic IDs remain unchanged.
- [ ] Weapon and armor icons still render.
- [ ] No red console errors identify CWN Content Pack or CWN Combat
      Enhancements during import and reload tests.

## CWN Cyberware v0.6.0

- [ ] **CWN Cyberware** appears and contains exactly 88 Items in Body, Head,
      Skin, Limb, Nerve, Sensory, Medical, and General folders.
- [ ] All 88 Items display distinct original icons and non-empty descriptions.
- [ ] Inspect examples from every folder and confirm cost, Strain, TL,
      category, concealment, effect, complication, and Disabled match the
      permitted source.
- [ ] Drag cyberware onto a character and confirm native SWNR installed Strain
      updates normally.
- [ ] Disable an installed cyberware Item and confirm it remains installed;
      SWNR's native Strain calculation is not overridden by the Content Pack.
- [ ] Confirm no cyberware Item contains a generated Active Effect.
- [ ] With CWN Combat Enhancements disabled, the compendium still opens and
      Items can be imported and edited normally.
- [ ] Edit an actor-owned or World Item copy and confirm the compendium source
      remains unchanged.
- [ ] Monthly Bus Pass and Smartphone Service Plan still behave as ordinary
      native SWNR Items when Combat Enhancements is absent.

## Valcour rebrand v0.8.0

- [ ] Open representative Valcour weapons and confirm the manufacturer is
      `Valcour` with no suffix.
- [ ] Confirm the six-paragraph biography and advertising slogan render in the
      weapon description.
- [ ] Confirm **Premium Engineering** states 80% resale by the registered lawful
      owner through an authorised dealer, normal fencing for stolen,
      undocumented, or illegally modified weapons, and licensed armourer +1.
- [ ] Confirm the eleven names are VC-22 Kestrel, VC-37 Falcon, VC-80 Peregrine,
      VC-14 Merlin, VC-5 Sparrow, VC-18 Swallow, VC-6 Chevalier, VC-9 Regent,
      VC-70 Osprey, VC-99 Gyrfalcon, and VC-55 Tempest.
- [ ] Confirm no current compendium record displays ShinTech, an ST model code,
      Kitsune, Suzume, Tsubame, Ronin, Daimyo, or Raijin.
- [ ] Confirm Valcour weapons retain their prior damage, cost, range, Trauma,
      modification, weapon-family, ammunition, and native roll fields.

## CWN Drones v0.8.0

- [ ] **CWN Drones** appears in Compendium Packs and contains exactly nine
      Actors.
- [ ] Confirm the nine names are Ironbark Mouse, Blackhound BH-10 Roach,
      Valcour VC-14 Hummingbird, Ironbark Sunfish, Helix HX-35 Pitbull, Helix
      HX-40 Javelin, Titan TD-66 Kraken, Titan TD-70 Kerberos, and Valcour
      VC-90 Shrike.
- [ ] Confirm none of the superseded catalogue names appears in the compendium.
- [ ] Open each Actor and confirm it uses the native SWNR Drone sheet.
- [ ] Confirm each Actor has a distinct circular gunmetal-framed token with
      transparent corners and no caption or nameplate inside the image.
- [ ] Confirm all descriptions are non-empty and no Actor contains optional
      equipment, weapons, fittings, or Active Effects.
- [ ] Spot-check Mouse: Cost 500, AC 13, Trauma Target 6, HP 1, Fittings 0,
      Speed 5, Ground, Hardpoints 0, Encumbrance 1.
- [ ] Spot-check Pitbull: Cost 5,000, AC 15, Trauma Target 8, HP 15, Fittings
      5, Speed 20, Ground, Hardpoints 1, Encumbrance 5.
- [ ] Spot-check Shrike: Cost 25,000, AC 18, Trauma Target 8, HP 20, Fittings
      6, Speed 30, Flying, Hardpoints 2, nonportable Encumbrance 99.
- [ ] Drag every drone to a Scene and confirm its token uses only the model
      name, such as `BH-10 Roach` rather than `Blackhound BH-10 Roach`.
- [ ] Hover each token as the GM and as a player; confirm its name appears.
- [ ] Confirm newly placed tokens are Friendly and have token vision enabled.
- [ ] Confirm every token retains a 1 x 1 grid footprint while its visible
      artwork uses these scales: Mouse 0.6, Hummingbird 0.6, Roach 0.7,
      Sunfish 0.7, Pitbull 0.8, Javelin 0.8, Kerberos 0.9, Kraken 0.9, and
      Shrike 1.0.
- [ ] Confirm each placed token uses the same artwork as its compendium Actor.
- [ ] Modify an imported or world Actor copy and confirm the compendium source
      remains unchanged.
- [ ] If a world contains a copy imported before v0.7.2, confirm that independent
      copy retains its previous name and data.
- [ ] Restart the world and confirm the compendium, Actors, prototype settings,
      and token artwork still load without red Content Pack console errors.
