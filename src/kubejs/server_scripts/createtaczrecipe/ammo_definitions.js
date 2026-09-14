// Apply independent JSON overrides and register the resolved catalog.
(() => {
  const log = (message) => console.log(`[CreateTacZrecipe] ${message}`);
  const allowedFields = {
    key: true, ammoId: true, sourceBatch: true, powderCount: true, metalUnits: true,
    casingMetalUnits: true, bulletMetalUnits: true, chargeLevel: true,
    casingMaterial: true, bulletMaterial: true, bulletExtraIngredients: true,
    casingMold: true, bulletMold: true, counts: true,
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
    for (const field of ["sourceBatch", "powderCount", "metalUnits", "casingMetalUnits", "bulletMetalUnits"]) {
      if (override[field] !== undefined && (!Number.isInteger(override[field]) || override[field] < 1 || override[field] > 99)) return fail(file, key, field, "must be an integer in range 1..99");
    }
    if (override.ammoId !== undefined && (typeof override.ammoId !== "string" || !resourcePattern.test(override.ammoId))) return fail(file, key, "ammoId", "must be a valid namespace:path resource ID");
    if (override.chargeLevel !== undefined && ["light", "standard", "heavy"].indexOf(override.chargeLevel) < 0) return fail(file, key, "chargeLevel", "must be light, standard, or heavy");
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
    if (typeof Java === "undefined") return catalog;
    const Files = Java.loadClass("java.nio.file.Files");
    const Paths = Java.loadClass("java.nio.file.Paths");
    const StandardCharsets = Java.loadClass("java.nio.charset.StandardCharsets");
    const directory = Paths.get("config", "createtaczrecipe");
    try { Files.createDirectories(directory); } catch (error) { log(`unable to create config directory ${directory}: ${error}`); return catalog; }
    const knownKeys = {};
    const byKey = {};
    catalog.forEach((entry) => { knownKeys[entry.key] = true; byKey[entry.key] = copyValue(entry); });
    let stream;
    try {
      stream = Files.newDirectoryStream(directory, "*.json");
      const paths = [];
      const iterator = stream.iterator();
      while (iterator.hasNext()) paths.push(iterator.next());
      paths.sort((a, b) => String(a.getFileName()).localeCompare(String(b.getFileName())));
      paths.forEach((path) => {
        const file = String(path.getFileName());
        let override;
        let raw = "";
        try { raw = String(Files.readString(path, StandardCharsets.UTF_8)); override = JSON.parse(raw); }
        catch (error) {
          const match = raw.match(/"key"\s*:\s*"([^"]+)"/);
          fail(file, match ? match[1] : "<unknown>", "<json>", String(error));
          return;
        }
        if (!validateOverride(file, override, knownKeys)) return;
        const resolved = mergeOverride(byKey[override.key], override);
        if (!validateResolved(file, resolved)) return;
        byKey[override.key] = resolved;
        log(`applied config override ${file} for caliber ${override.key}`);
      });
    } catch (error) {
      log(`unable to enumerate config overrides in ${directory}: ${error}`);
    } finally {
      if (stream) try { stream.close(); } catch (error) { log(`unable to close config directory stream: ${error}`); }
    }
    return catalog.map((entry) => byKey[entry.key]);
  };

  loadOverrides(global.createtaczrecipe.ammoCatalog).forEach((spec) => {
    global.createtaczrecipe.registerAmmo(global.createtaczrecipe.standardAmmo(spec));
  });
})();
