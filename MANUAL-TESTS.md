# Foundry VTT v13 / SWNR 2.3.x manual test checklist

Use CWN Content & Icon Pack 0.5.0 in a disposable Foundry v13 world running
SWNR 2.3.x. Tests marked as Combat Enhancements integration require CWN Combat
Enhancements 0.10.4.

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
- [ ] Harbour City Stories Armor still contains exactly 14 armor Items.
- [ ] CWN Ammunition & Reloads still contains exactly 14 ammunition Items.
- [ ] Existing weapon and armor deterministic IDs remain unchanged.
- [ ] Weapon and armor icons still render.
- [ ] No red console errors identify CWN Content Pack or CWN Combat
      Enhancements during import and reload tests.
