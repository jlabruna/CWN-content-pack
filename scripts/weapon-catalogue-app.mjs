import { installWeaponCatalogue } from "./weapon-catalogue.mjs";

const MODULE_ID = "cwn-content-pack";
const EXPECTED_WEAPONS = 64;
const FLAG_SCOPE = "harbour-city-stories";

export class WeaponCatalogueApp extends foundry.applications.api.HandlebarsApplicationMixin(
  foundry.applications.api.ApplicationV2
) {
  static DEFAULT_OPTIONS = {
    id: "cwn-content-pack-weapon-catalogue",
    classes: ["cwn-content-pack", "weapon-catalogue"],
    position: {
      width: 520,
      height: "auto"
    },
    window: {
      title: "CWNContentPack.Catalogue.Title",
      icon: "fa-solid fa-gun"
    },
    actions: {
      installCatalogue: this.installCatalogue
    }
  };

  static PARTS = {
    main: {
      template: `modules/${MODULE_ID}/templates/weapon-catalogue.hbs`
    }
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const installed = game.items.filter(
      (item) =>
        item.type === "weapon" &&
        Boolean(foundry.utils.getProperty(item, `flags.${FLAG_SCOPE}.catalogueKey`))
    ).length;

    return {
      ...context,
      expected: EXPECTED_WEAPONS,
      installed
    };
  }

  static async installCatalogue() {
    if (!game.user?.isGM) {
      return ui.notifications.error("Only a GM can install the weapon catalogue.");
    }

    const confirmed = await foundry.applications.api.DialogV2.confirm({
      window: {
        title: game.i18n.localize("CWNContentPack.Catalogue.ConfirmTitle")
      },
      content: `<p>${foundry.utils.escapeHTML(
        game.i18n.localize("CWNContentPack.Catalogue.Confirm")
      )}</p>`,
      yes: {
        label: game.i18n.localize("CWNContentPack.Catalogue.ConfirmButton")
      },
      no: {
        label: game.i18n.localize("Cancel")
      }
    });
    if (!confirmed) return;

    ui.notifications.info(game.i18n.localize("CWNContentPack.Catalogue.Started"));

    try {
      await installWeaponCatalogue();
      await this.render({ force: true });
    } catch (error) {
      console.error("CWN Content & Icon Pack | Weapon catalogue installation failed.", error);
      ui.notifications.error(game.i18n.localize("CWNContentPack.Catalogue.Failed"));
    }
  }
}
