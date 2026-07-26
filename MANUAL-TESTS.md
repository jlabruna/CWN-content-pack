# Foundry VTT v13 / SWNR 2.3.x manual test checklist

Use CWN Content & Icon Pack 0.4.0 in a disposable Foundry v13 world running
SWNR 2.3.x. Tests marked as Combat Enhancements integration require CWN Combat
Enhancements 0.10.3.

Do not claim Foundry runtime success until these checks have been completed.

## Compendium and independence

- [ ] **CWN Ammunition & Reloads** appears and contains exactly 14 Items in four
      folders.
- [ ] Every ammunition Item has a distinct original icon.
- [ ] Importing an ammunition Item creates only the requested World Item.
- [ ] Enabling the module creates no World Items automatically.
- [ ] Existing SWNR compendia and their documents remain unchanged.
- [ ] With CWN Combat Enhancements disabled, all three Content Pack compendia
      open and their Items can be imported or dragged onto actors.

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
- [ ] Existing weapon and armor deterministic IDs remain unchanged.
- [ ] Weapon and armor icons still render.
- [ ] No red console errors identify CWN Content Pack or CWN Combat
      Enhancements during import and reload tests.
