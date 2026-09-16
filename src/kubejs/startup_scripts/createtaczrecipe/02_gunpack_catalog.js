// Gunpack-specific conventional ammunition. Kept separate from the core catalog so
// removing a gunpack never changes the default 22-caliber definitions.
(() => {
  const api = global.createtaczrecipe;
  if (!api || !api.standardAmmo) return;
  const profiles = [
    { key: "hamster_compact_ammo", ammoId: "hamster:compact_ammo", displayName: "Gunpowder Revolution Compact Ammo", chargeLevel: "light", metalUnits: 10, sourceBatch: 64, powderCount: 2 },
    { key: "hamster_medium_ammo", ammoId: "hamster:medium_ammo", displayName: "Gunpowder Revolution Medium Ammo", chargeLevel: "standard", metalUnits: 15, sourceBatch: 48, powderCount: 3 },
    { key: "hamster_long_ammo", ammoId: "hamster:long_ammo", displayName: "Gunpowder Revolution Long Ammo", chargeLevel: "standard", metalUnits: 24, sourceBatch: 32, powderCount: 9 },
    { key: "cib_32acp", ammoId: "cib:32acp", displayName: ".32 ACP (CIBR)", chargeLevel: "light", metalUnits: 10, sourceBatch: 50, powderCount: 2 },
    { key: "cib_65x50", ammoId: "cib:65x50", displayName: "6.5x50mm (CIBR)", chargeLevel: "standard", metalUnits: 15, sourceBatch: 49, powderCount: 5 },
    { key: "cib_9x39mm", ammoId: "cib:9x39mm", displayName: "9x39mm (CIBR)", chargeLevel: "standard", metalUnits: 12, sourceBatch: 49, powderCount: 4 },
    { key: "create_armorer_gas_pistol_ammo", ammoId: "create_armorer:gas_pistol_ammo", displayName: "Gas Pistol Ammo (Create Armorer)", chargeLevel: "light", metalUnits: 8, sourceBatch: 60, powderCount: 2 },
    { key: "create_armorer_rbapb", ammoId: "create_armorer:rbapb", displayName: "RBAPB (Create Armorer)", chargeLevel: "standard", metalUnits: 8, sourceBatch: 32, powderCount: 3 },
    { key: "create_armorer_slap", ammoId: "create_armorer:slap", displayName: "SLAP (Create Armorer)", chargeLevel: "standard", metalUnits: 10, sourceBatch: 60, powderCount: 3, casingMetalUnits: 4, bulletMetalUnits: 6, casingMaterial: { tag: "c:ingots/copper" }, bulletMaterial: { tag: "c:ingots/iron" } },
    { key: "cib_18_4", ammoId: "cib:18.4", displayName: "18.4mm (CIBR)", chargeLevel: "heavy", metalUnits: 2, sourceBatch: 20, powderCount: 7, casingMetalUnits: 1, bulletMetalUnits: 1, casingMaterial: { tag: "c:ingots/iron" }, bulletMaterial: { tag: "c:nuggets/iron" }, bulletExtraIngredients: [{ tag: "c:nuggets/iron", amount: 18 }] }
  ];
  const enabled = {};
  try {
    var ctzGunpackOverridesDocument = typeof JsonIO !== "undefined" ? JsonIO.read("config/createtaczrecipe/gunpack_overrides.json") : null;
    if (ctzGunpackOverridesDocument && Array.isArray(ctzGunpackOverridesDocument.disabled)) ctzGunpackOverridesDocument.disabled.forEach((key) => { enabled[key] = false; });
  } catch (error) {
    console.log(`[CreateTacZrecipe] unable to read gunpack overrides; built-in gunpack catalog remains active: ${error}`);
  }
  profiles.forEach((profile) => {
    if (enabled[profile.key] === false) {
      console.log(`[CreateTacZrecipe] skipped disabled gunpack ammo ${profile.ammoId}`);
      return;
    }
    const casing = `createtaczrecipe:empty_${profile.key}_casing`;
    const rough = `createtaczrecipe:rough_${profile.key}_bullet`;
    const polished = `createtaczrecipe:polished_${profile.key}_bullet`;
    const transitional = `createtaczrecipe:incomplete_${profile.key}_round`;
    const definition = api.standardAmmo({
      key: profile.key, ammoId: profile.ammoId, displayName: profile.displayName,
      casing: casing, roughBullet: rough, polishedBullet: polished, transitional: transitional,
      casingMold: "createtaczrecipe_external_casing", bulletMold: "createtaczrecipe_external_bullet",
      chargeLevel: profile.chargeLevel, metalUnits: profile.metalUnits, sourceBatch: profile.sourceBatch,
      powderCount: profile.powderCount, dynamic: true,
      casingMetalUnits: profile.casingMetalUnits,
      bulletMetalUnits: profile.bulletMetalUnits,
      casingMaterial: profile.casingMaterial,
      bulletMaterial: profile.bulletMaterial,
      bulletExtraIngredients: profile.bulletExtraIngredients,
      counts: { casing: profile.sourceBatch, roughBullet: profile.sourceBatch, polishedBullet: 1, assembly: 1 }
    });
    definition.displayName = profile.displayName;
    definition.visuals = {};
    definition.dynamic = true;
    definition.gunpack = true;
    api.ammoCatalog.push(definition);
    api.externalAmmo.push(definition);
    api.caliberKeys.push(profile.key);
    api.caliberDisplayNames[profile.key] = profile.displayName;
    console.log(`[CreateTacZrecipe] received gunpack ammo definition: ${profile.ammoId} (${profile.key})`);
  });
})();
