// Apply independent JSON overrides and register the resolved catalog.
(() => {
  const log = (message) => console.log(`[CreateTacZrecipe] ${message}`);
  const allowedFields = {
    key: true, ammoId: true,
    casingMetalUnits: true, bulletMetalUnits: true, chargeLevel: true,
    casingMaterial: true, bulletMaterial: true, bulletExtraIngredients: true,
    casingMold: true, bulletMold: true, counts: true, processPreset: true, operations: true,
  };
  const copyValue = (value) => {
    if (Array.isArray(value)) return value.map(copyValue);
    if (value && typeof value === "object") {
      const copy = {};
      for (const field in value) copy[field] = copyValue(value[field]);
      return copy;
    }
    return value;
  };
  const fail = (file, key, field, reason) => {
    log(`skipped config file ${file} for caliber ${key || "<unknown>"}: field ${field}: ${reason}`);
    return false;
  };
  const resourcePattern = /^[a-z0-9_.-]+:[a-z0-9_./-]+$/;
  const moldPattern = /^[a-z0-9_./-]+$/;
  const validIngredient = (value) => value && typeof value === "object" &&
    ((typeof value.item === "string" && resourcePattern.test(value.item)) || (typeof value.tag === "string" && resourcePattern.test(value.tag)));
  const itemExists = (id) => {
    if (typeof Item === "undefined") return true;
    try { return !Item.of(id).isEmpty(); } catch (error) { return false; }
  };
  const validateOverride = (file, override, knownKeys) => {
    if (!override || typeof override !== "object" || Array.isArray(override)) return fail(file, "<unknown>", "<root>", "expected one JSON object");
    const key = override.key;
    if (typeof key !== "string" || !knownKeys[key]) return fail(file, key, "key", "must name one of the registered default calibers");
    for (const field in override) if (!allowedFields[field]) return fail(file, key, field, "unknown or non-overridable field");
    for (const field of ["casingMetalUnits", "bulletMetalUnits"]) {
      if (override[field] !== undefined && (!Number.isInteger(override[field]) || override[field] < 1 || override[field] > 99)) return fail(file, key, field, "must be an integer in range 1..99");
    }
    if (override.ammoId !== undefined && (typeof override.ammoId !== "string" || !resourcePattern.test(override.ammoId))) return fail(file, key, "ammoId", "must be a valid namespace:path resource ID");
    if (override.chargeLevel !== undefined && ["light", "standard", "heavy"].indexOf(override.chargeLevel) < 0) return fail(file, key, "chargeLevel", "must be light, standard, or heavy");
    if (override.processPreset !== undefined && ["conventional", "shotgun", "custom"].indexOf(override.processPreset) < 0) return fail(file, key, "processPreset", "must be conventional, shotgun, or custom");
    if (override.processPreset === "custom" && (!Array.isArray(override.operations) || override.operations.length === 0)) return fail(file, key, "operations", "must be a non-empty array when processPreset is custom");
    for (const field of ["casingMold", "bulletMold"]) if (override[field] !== undefined && (typeof override[field] !== "string" || !moldPattern.test(override[field]))) return fail(file, key, field, "must be a valid mold path without a namespace");
    for (const field of ["casingMaterial", "bulletMaterial"]) {
      if (override[field] !== undefined && !validIngredient(override[field])) return fail(file, key, field, "must contain a valid item or tag resource ID");
      if (override[field] && override[field].item && !itemExists(override[field].item)) return fail(file, key, `${field}.item`, `item does not exist: ${override[field].item}`);
    }
    if (override.counts !== undefined) {
      if (!override.counts || typeof override.counts !== "object" || Array.isArray(override.counts)) return fail(file, key, "counts", "must be an object");
      for (const countField in override.counts) {
        if (["casing", "roughBullet", "polishedBullet", "assembly"].indexOf(countField) < 0) return fail(file, key, `counts.${countField}`, "unknown output stage");
        if (!Number.isInteger(override.counts[countField]) || override.counts[countField] < 1 || override.counts[countField] > 99) return fail(file, key, `counts.${countField}`, "must be an integer in range 1..99");
      }
    }
    if (override.bulletExtraIngredients !== undefined) {
      if (!Array.isArray(override.bulletExtraIngredients) || override.bulletExtraIngredients.some((entry) => !validIngredient(entry) || !Number.isInteger(entry.amount) || entry.amount < 1 || entry.amount > 99)) return fail(file, key, "bulletExtraIngredients", "must contain valid item/tag ingredients with amount in range 1..99");
      for (let i = 0; i < override.bulletExtraIngredients.length; i++) {
        const entry = override.bulletExtraIngredients[i];
        if (entry.item && !itemExists(entry.item)) return fail(file, key, `bulletExtraIngredients[${i}].item`, `item does not exist: ${entry.item}`);
      }
    }
    return true;
  };
  const mergeOverride = (base, override) => {
    const merged = copyValue(base);
    for (const field in override) {
      if (field === "counts") {
        for (const countField in override.counts) merged.counts[countField] = override.counts[countField];
      } else {
        merged[field] = copyValue(override[field]);
      }
    }
    return merged;
  };
  const validateResolved = (file, resolved) => {
    if (resolved.casingMetalUnits > 64) return fail(file, resolved.key, "casingMetalUnits", `creates ${resolved.casingMetalUnits} compression molding inputs; maximum is 64`);
    const extraCount = resolved.bulletExtraIngredients.reduce((total, entry) => total + entry.amount, 0);
    const bulletInputs = resolved.bulletMetalUnits + extraCount;
    if (bulletInputs > 64) return fail(file, resolved.key, "bulletMetalUnits/bulletExtraIngredients", `creates ${bulletInputs} compression molding inputs; maximum is 64`);
    return true;
  };
  const loadOverrides = (catalog) => {
    const configPath = "config/createtaczrecipe/ammo_overrides.json";
    const knownKeys = {};
    const byKey = {};
    catalog.forEach((entry) => { knownKeys[entry.key] = true; byKey[entry.key] = copyValue(entry); });
    let document = null;
    try {
      document = JsonIO.read(configPath);
    } catch (error) {
      log(`unable to read ${configPath}; using all defaults: ${error}`);
      return catalog;
    }
    if (document === null || document === undefined) {
      log(`config ${configPath} not found; using all defaults`);
      return catalog;
    }
    const overrides = Array.isArray(document) ? document : (document.overrides === undefined ? [] : document.overrides);
    if (!Array.isArray(overrides)) {
      log(`invalid config ${configPath}: field overrides must be an array; using all defaults`);
      return catalog;
    }
    let index;
    let overrideEntry;
    let source;
    let resolved;
    let changedFields;
    let changedField;
    for (index = 0; index < overrides.length; index++) {
      overrideEntry = overrides[index];
      source = `${configPath}#overrides[${index}]`;
      if (!validateOverride(source, overrideEntry, knownKeys)) continue;
      resolved = mergeOverride(byKey[overrideEntry.key], overrideEntry);
      if (!validateResolved(source, resolved)) continue;
      byKey[overrideEntry.key] = resolved;
      changedFields = [];
      for (changedField in overrideEntry) if (changedField !== "key") changedFields.push(`${changedField}=${JSON.stringify(overrideEntry[changedField])}`);
      log(`applied config override ${source} for caliber ${overrideEntry.key}: ${changedFields.join(", ")}`);
    }
    return catalog.map((entry) => byKey[entry.key]);
  };

  loadOverrides(global.createtaczrecipe.ammoCatalog).forEach((spec) => {
    global.createtaczrecipe.registerAmmo(spec.dynamic ? spec : global.createtaczrecipe.standardAmmo(spec));
  });
})();
