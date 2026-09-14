// Gunpack-specific conventional ammunition. Kept separate from the core catalog so
// removing a gunpack never changes the default 22-caliber definitions.
(() => {
  const api = global.createtaczrecipe;
  if (!api || !api.standardAmmo) return;
  const profiles = [
    { key: "hamster_compact_ammo", ammoId: "hamster:compact_ammo", displayName: "Gunpowder Revolution Compact Ammo", chargeLevel: "light", metalUnits: 8, sourceBatch: 50, powderCount: 2 },
    { key: "hamster_medium_ammo", ammoId: "hamster:medium_ammo", displayName: "Gunpowder Revolution Medium Ammo", chargeLevel: "standard", metalUnits: 16, sourceBatch: 40, powderCount: 4 },
    { key: "hamster_long_ammo", ammoId: "hamster:long_ammo", displayName: "Gunpowder Revolution Long Ammo", chargeLevel: "standard", metalUnits: 18, sourceBatch: 40, powderCount: 4 },
    { key: "cib_32acp", ammoId: "cib:32acp", displayName: ".32 ACP (CIBR)", chargeLevel: "light", metalUnits: 8, sourceBatch: 50, powderCount: 2 },
    { key: "cib_58x21", ammoId: "cib:58x21", displayName: "5.8x21mm (CIBR)", chargeLevel: "light", metalUnits: 8, sourceBatch: 50, powderCount: 2 },
    { key: "cib_65x50", ammoId: "cib:65x50", displayName: "6.5x50mm (CIBR)", chargeLevel: "standard", metalUnits: 16, sourceBatch: 40, powderCount: 4 },
    { key: "cib_8x22", ammoId: "cib:8x22", displayName: "8x22mm (CIBR)", chargeLevel: "light", metalUnits: 8, sourceBatch: 50, powderCount: 2 },
    { key: "cib_9x39mm", ammoId: "cib:9x39mm", displayName: "9x39mm (CIBR)", chargeLevel: "standard", metalUnits: 16, sourceBatch: 40, powderCount: 4 }
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
      powderCount: profile.powderCount, dynamic: true
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
