// Single default data source for registered conventional ammunition.
(() => {
  const names = {
    "22wmr": ".22 Winchester Magnum", "9mm": "9mm", "45acp": ".45 ACP", "46x30": "4.6x30mm", "57x28": "5.7x28mm",
    "762x25": "7.62x25mm Tokarev", "357mag": ".357 Magnum", "500mag": ".500 Magnum", "50ae": ".50 AE",
    "545x39": "5.45x39mm", "556x45": "5.56x45mm", "58x42": "5.8x42mm DBP87", "68x51fury": "6.8x51mm Fury",
    "762x39": "7.62x39mm", "30_06": ".30-06 Springfield", "308": ".308 Winchester", "338": ".338 Lapua Magnum",
    "45_70": ".45-70 Government", "762x54": "7.62x54mm", "792x57": "8mm Mauser", "50bmg": ".50 BMG",
  };
  const rows = [
    ["22wmr", 2, 96, 10, "light"], ["9mm", 2, 50, 10, "light"], ["45acp", 2, 30, 10, "light"],
    ["46x30", 2, 48, 12, "light"], ["57x28", 2, 48, 15, "light"], ["762x25", 2, 45, 10, "light"],
    ["357mag", 6, 48, 25, "standard"], ["500mag", 10, 32, 40, "standard"], ["50ae", 7, 36, 30, "standard"],
    ["545x39", 3, 45, 13, "standard"], ["556x45", 3, 45, 15, "standard"], ["58x42", 3, 40, 15, "standard"],
    ["68x51fury", 5, 40, 15, "standard"], ["762x39", 3, 35, 15, "standard"], ["30_06", 6, 32, 20, "standard"],
    ["308", 10, 60, 30, "standard"], ["338", 8, 18, 25, "standard"], ["45_70", 7, 36, 30, "standard"],
    ["762x54", 8, 60, 25, "standard"], ["792x57", 6, 48, 20, "standard"], ["50bmg", 20, 24, 110, "heavy"],
  ];
  const lapisByKey = { "57x28": 5, "500mag": 5, "50ae": 5, "308": 1, "338": 4, "45_70": 5, "50bmg": 12 };
  const catalog = rows.map((row) => {
    const key = row[0];
    const sourceBatch = row[2];
    const extras = lapisByKey[key] ? [{ item: "minecraft:lapis_lazuli", amount: lapisByKey[key] }] : [];
    if (key === "50bmg") extras.push({ item: "minecraft:blaze_rod", amount: 1 });
    return {
      key: key,
      displayName: names[key],
      ammoId: `tacz:${key}`,
      sourceBatch: sourceBatch,
      powderCount: row[1],
      metalUnits: row[3],
      casingMetalUnits: key === "50bmg" ? 60 : Math.max(1, Math.ceil(row[3] / 2)),
      bulletMetalUnits: key === "50bmg" ? 50 : Math.max(1, row[3] - Math.ceil(row[3] / 2)),
      chargeLevel: row[4],
      casingMaterial: { tag: "createtaczrecipe:materials/brass_blanks" },
      bulletMaterial: { tag: "createtaczrecipe:materials/copper_blanks" },
      bulletExtraIngredients: extras,
      casingMold: `createtaczrecipe_${key}_casing`,
      bulletMold: `createtaczrecipe_${key}_bullet`,
      counts: { casing: sourceBatch, roughBullet: sourceBatch, polishedBullet: 1, assembly: 1 },
    };
  });

  global.createtaczrecipe.ammoCatalog = catalog;
  global.createtaczrecipe.caliberKeys = catalog.map((entry) => entry.key);
  global.createtaczrecipe.caliberDisplayNames = names;

  // Startup-time additions are read before item, mold and tag registration. This is
  // deliberately a single JsonIO document so external gun packs need no Java code.
  var ctzAdditionPath = "config/createtaczrecipe/ammo_overrides.json";
  var ctzAdditionIdPattern = /^[a-z0-9_.-]+:[a-z0-9_./-]+$/;
  var ctzAdditions = [];
  try {
    var ctzAdditionDocument = typeof JsonIO !== "undefined" ? JsonIO.read(ctzAdditionPath) : null;
    var ctzEntries = ctzAdditionDocument && Array.isArray(ctzAdditionDocument.additions) ? ctzAdditionDocument.additions : [];
    for (var ctzIndex = 0; ctzIndex < ctzEntries.length; ctzIndex++) {
      var ctzEntry = ctzEntries[ctzIndex];
      var ctzKey = ctzEntry && ctzEntry.key;
      var ctzOutput = ctzEntry && ctzEntry.outputItem;
      var ctzRequired = ctzOutput && [ctzOutput.casing, ctzOutput.roughBullet, ctzOutput.polishedBullet, ctzOutput.transitional];
      if (typeof ctzKey !== "string" || !/^[a-z0-9_]+$/.test(ctzKey) || global.createtaczrecipe.caliberKeys.indexOf(ctzKey) >= 0) {
        console.log(`[CreateTacZrecipe] skipped config addition ${ctzAdditionPath}#additions[${ctzIndex}]: invalid or duplicate key ${ctzKey}`);
        continue;
      }
      if (!ctzRequired || ctzRequired.some((id) => typeof id !== "string" || !ctzAdditionIdPattern.test(id))) {
        console.log(`[CreateTacZrecipe] skipped config addition ${ctzAdditionPath}#additions[${ctzIndex}] for ${ctzKey}: outputItem fields are required resource IDs`);
        continue;
      }
      var ctzMold = ctzEntry.molds || {};
      if (typeof ctzMold.casing !== "string" || typeof ctzMold.bullet !== "string") {
        console.log(`[CreateTacZrecipe] skipped config addition ${ctzAdditionPath}#additions[${ctzIndex}] for ${ctzKey}: molds.casing and molds.bullet are required`);
        continue;
      }
      var ctzSpec = {
        key: ctzKey, ammoId: ctzEntry.ammoId || `tacz:${ctzKey}`, displayName: ctzEntry.displayName || ctzKey,
        casing: ctzOutput.casing, roughBullet: ctzOutput.roughBullet, polishedBullet: ctzOutput.polishedBullet, transitional: ctzOutput.transitional,
        casingMold: ctzMold.casing, bulletMold: ctzMold.bullet,
        casingMaterial: ctzEntry.materials && ctzEntry.materials.casing, bulletMaterial: ctzEntry.materials && ctzEntry.materials.bullet,
        casingMetalUnits: ctzEntry.materials && ctzEntry.materials.casingUnits, bulletMetalUnits: ctzEntry.materials && ctzEntry.materials.bulletUnits,
        chargeLevel: ctzEntry.chargeLevel, counts: ctzEntry.counts, bulletExtraIngredients: ctzEntry.bulletExtraIngredients,
        sourceBatch: ctzEntry.sourceBatch || (ctzEntry.counts && ctzEntry.counts.casing) || 1,
      };
      if (!ctzSpec.casingMaterial || !ctzSpec.bulletMaterial || !Number.isInteger(ctzSpec.casingMetalUnits) || !Number.isInteger(ctzSpec.bulletMetalUnits)) {
        console.log(`[CreateTacZrecipe] skipped config addition ${ctzAdditionPath}#additions[${ctzIndex}] for ${ctzKey}: required materials and units are missing`);
        continue;
      }
      if (!ctzAdditionIdPattern.test(ctzSpec.ammoId) || !ctzEntry.chargeLevel || !ctzSpec.counts) {
        console.log(`[CreateTacZrecipe] skipped config addition ${ctzAdditionPath}#additions[${ctzIndex}] for ${ctzKey}: ammoId, chargeLevel and counts are required`);
        continue;
      }
      var ctzDefinition = global.createtaczrecipe.standardAmmo(ctzSpec);
      ctzDefinition.displayName = ctzSpec.displayName;
      ctzDefinition.dynamic = true;
      ctzAdditions.push(ctzDefinition);
      catalog.push(ctzDefinition);
      names[ctzKey] = ctzSpec.displayName;
      global.createtaczrecipe.caliberKeys.push(ctzKey);
      global.createtaczrecipe.caliberDisplayNames[ctzKey] = ctzSpec.displayName;
      console.log(`[CreateTacZrecipe] received external ammo definition: ${ctzKey}`);
    }
  } catch (error) {
    console.log(`[CreateTacZrecipe] unable to read external additions from ${ctzAdditionPath}; defaults remain active: ${error}`);
  }
  global.createtaczrecipe.externalAmmo = ctzAdditions;
})();
