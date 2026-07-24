import { CwnIconManager } from "./icon-manager.mjs";

const MODULE_ID = "cwn-content-pack";

Hooks.once("init", () => {
  const module = game.modules.get(MODULE_ID);
  if (!module) return;

  const iconManager = new CwnIconManager();
  module.api = {
    iconManager,
    findIcon: (item) => iconManager.findIcon(item),
    get mappings() {
      return iconManager.mappings;
    }
  };
});

Hooks.once("ready", async () => {
  const iconManager = game.modules.get(MODULE_ID)?.api?.iconManager;
  if (!iconManager) return;

  try {
    await iconManager.load();
    console.info(
      `CWN Content & Icon Pack | Ready with ${iconManager.mappings.length} icon mapping(s).`
    );
  } catch (error) {
    console.error("CWN Content & Icon Pack | Failed to load icon mappings.", error);
    ui.notifications.error(
      "CWN Content & Icon Pack could not load its icon mappings. Check the console for details."
    );
  }
});
