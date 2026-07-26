const MODULE_ID = "cwn-content-pack";
const MAPPING_PATH = `modules/${MODULE_ID}/data/icon-mappings.json`;

/**
 * Loads and resolves icon mappings without changing Foundry documents.
 *
 * Automatic or bulk application is deliberately deferred until mappings and
 * source identifiers have been tested against the installed SWNR compendiums.
 */
export class CwnIconManager {
  #mappings = [];
  #loaded = false;

  get mappings() {
    return this.#mappings.map((mapping) => ({ ...mapping }));
  }

  get loaded() {
    return this.#loaded;
  }

  async load() {
    const response = await fetch(MAPPING_PATH, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Unable to load ${MAPPING_PATH}: HTTP ${response.status}`);
    }

    const data = await response.json();
    if (!Array.isArray(data?.mappings)) {
      throw new Error("icon-mappings.json must contain a mappings array.");
    }

    this.#mappings = data.mappings
      .map((mapping) => this.#normalizeMapping(mapping))
      .filter(Boolean);
    this.#loaded = true;
    return this.mappings;
  }

  /**
   * Resolve an icon for a Foundry Item or item-like object.
   *
   * Matching priority:
   * 1. Exact source UUID
   * 2. Item type plus normalized name
   * 3. Normalized name only
   */
  findIcon(item) {
    if (!item || !this.#loaded) return null;

    const sourceUuid =
      item.getFlag?.("core", "sourceId") ??
      item._stats?.compendiumSource ??
      item.flags?.core?.sourceId ??
      null;
    const type = String(item.type ?? "").trim().toLowerCase();
    const name = this.#normalizeName(item.name);

    const sourceMatch = sourceUuid
      ? this.#mappings.find((mapping) => mapping.sourceUuid === sourceUuid)
      : null;
    if (sourceMatch) return sourceMatch.img;

    const typedNameMatch = this.#mappings.find(
      (mapping) =>
        mapping.itemType &&
        mapping.itemType === type &&
        mapping.normalizedName === name
    );
    if (typedNameMatch) return typedNameMatch.img;

    return (
      this.#mappings.find(
        (mapping) => !mapping.itemType && mapping.normalizedName === name
      )?.img ?? null
    );
  }

  #normalizeMapping(mapping) {
    if (!mapping || typeof mapping !== "object") return null;

    const name = String(mapping.name ?? "").trim();
    const sourceUuid = String(mapping.sourceUuid ?? "").trim();
    const img = String(mapping.img ?? "").trim();
    const itemType = String(mapping.itemType ?? "").trim().toLowerCase();

    if (!img || (!name && !sourceUuid)) {
      console.warn(
        "CWN Content & Icon Pack | Ignoring invalid icon mapping.",
        mapping
      );
      return null;
    }

    return {
      id: String(mapping.id ?? "").trim(),
      name,
      normalizedName: this.#normalizeName(name),
      itemType,
      sourceUuid,
      img
    };
  }

  #normalizeName(value) {
    return String(value ?? "")
      .trim()
      .toLocaleLowerCase()
      .replace(/[’‘]/g, "'")
      .replace(/\s+/g, " ");
  }
}
