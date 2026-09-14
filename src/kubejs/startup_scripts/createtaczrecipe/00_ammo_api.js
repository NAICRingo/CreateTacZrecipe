// KubeJS only permits assigning global values during startup scripts.
const standardAmmo = (spec) => {
  const key = spec.key;
  const casing = spec.casing || `createtaczrecipe:empty_${key}_casing`;
  const roughBullet = spec.roughBullet || `createtaczrecipe:rough_${key}_bullet`;
  const polishedBullet = spec.polishedBullet || `createtaczrecipe:polished_${key}_bullet`;
  const transitional = spec.transitional || `createtaczrecipe:incomplete_${key}_round`;
  const brassTag = spec.casingMaterialTag || "createtaczrecipe:materials/brass_blanks";
  const copperTag = spec.bulletMaterialTag || "createtaczrecipe:materials/copper_blanks";
  const casingInput = spec.inputIngredient && spec.inputIngredient.casing ? spec.inputIngredient.casing : { tag: `createtaczrecipe:casings/empty/${key}` };
  const bulletInput = spec.inputIngredient && spec.inputIngredient.polishedBullet ? spec.inputIngredient.polishedBullet : { tag: `createtaczrecipe:projectiles/polished/${key}` };
  const casingMold = spec.casingMold || `createtaczrecipe_${key}_casing`;
  const bulletMold = spec.bulletMold || `createtaczrecipe_${key}_bullet`;
  const primer = spec.primer || "createtaczrecipe:small_arms_primer";
  const chargeLevel = spec.chargeLevel || "standard";
  const propellant = spec.propellant || `createtaczrecipe:${chargeLevel}_propellant_charge`;
  const primerInput = spec.inputIngredient && spec.inputIngredient.primer ? spec.inputIngredient.primer : { tag: "createtaczrecipe:materials/primers" };
  const propellantInput = spec.inputIngredient && spec.inputIngredient.propellant ? spec.inputIngredient.propellant : { tag: `createtaczrecipe:propellants/${chargeLevel}` };
  const sourceBatch = spec.sourceBatch || 50;
  const metalUnits = spec.metalUnits || 10;
  const casingMetalUnits = spec.casingMetalUnits || Math.max(1, Math.ceil(metalUnits / 2));
  const bulletMetalUnits = spec.bulletMetalUnits || Math.max(1, metalUnits - casingMetalUnits);
  const chargeMaterialUnits = chargeLevel === "heavy" ? 20 : (chargeLevel === "standard" ? 4 : 1);
  const counts = {
    casing: spec.counts && spec.counts.casing || 1,
    roughBullet: spec.counts && spec.counts.roughBullet || 1,
    polishedBullet: spec.counts && spec.counts.polishedBullet || 1,
    assembly: spec.counts && spec.counts.assembly || 1,
  };
  const conventionalOperations = [
    { type: "create:deploying", ingredients: [{ ref: "transitional" }, primerInput], results: [{ ref: "transitional" }] },
    { type: "create:deploying", ingredients: [{ ref: "transitional" }, propellantInput], results: [{ ref: "transitional" }] },
    { type: "create:deploying", ingredients: [{ ref: "transitional" }, bulletInput], results: [{ ref: "transitional" }] },
  ].concat(spec.extraOperations || [], [
    { type: "create:pressing", ingredients: [{ ref: "transitional" }], results: [{ ref: "transitional" }] },
  ]);
  const shotgunOperations = [
    { type: "create:deploying", ingredients: [{ ref: "transitional" }, primerInput], results: [{ ref: "transitional" }] },
    { type: "create:deploying", ingredients: [{ ref: "transitional" }, propellantInput], results: [{ ref: "transitional" }] },
    { type: "create:deploying", ingredients: [{ ref: "transitional" }, bulletInput], results: [{ ref: "transitional" }] },
    { type: "create:cutting", ingredients: [{ ref: "transitional" }], results: [{ ref: "transitional" }] },
    { type: "create:pressing", ingredients: [{ ref: "transitional" }], results: [{ ref: "transitional" }] },
  ];
  const processPreset = spec.processPreset || "conventional";
  const operations = processPreset === "custom" ? spec.operations : (processPreset === "shotgun" ? shotgunOperations : conventionalOperations);
  return {
    key: key,
    casingMold: casingMold,
    bulletMold: bulletMold,
    moldMaterials: spec.moldMaterials || {
      casing: [{ tag: "createtaczrecipe:materials/iron_plates" }, { tag: "createtaczrecipe:materials/brass_blanks" }],
      bullet: [{ tag: "createtaczrecipe:materials/iron_plates" }, { tag: "createtaczrecipe:materials/copper_blanks" }],
    },
    materials: {
      casing: spec.casingMaterial || { tag: brassTag },
      bullet: spec.bulletMaterial || { tag: copperTag },
      bulletExtras: spec.bulletExtraIngredients || [],
    },
    inputIngredient: { casing: casingInput, polishedBullet: bulletInput, primer: primerInput, propellant: propellantInput },
    outputItem: { casing: casing, roughBullet: roughBullet, polishedBullet: polishedBullet, transitional: transitional },
    counts: counts,
    economy: { sourceBatch: sourceBatch, metalUnits: metalUnits, casingMetalUnits: casingMetalUnits, bulletMetalUnits: bulletMetalUnits, powderUnits: spec.powderCount || 2, chargeMaterialUnits: chargeMaterialUnits, chargeCapacity: Math.floor((spec.powderCount || 2) * 24 / chargeMaterialUnits), assemblyOutputCount: counts.assembly },
    casing: casing,
    roughBullet: roughBullet,
    polishedBullet: polishedBullet,
    primer: primer,
    propellant: propellant,
    chargeLevel: chargeLevel,
    transitional: transitional,
    final: spec.final || "tacz:ammo",
    ammoId: spec.ammoId || `tacz:${key}`,
    processPreset: processPreset,
    polishing: spec.polishing || { type: "create:sandpaper_polishing", input: { ref: "roughBullet" }, output: { ref: "polishedBullet", count: counts.polishedBullet } },
    // Primers use the shared recipe unless a caliber explicitly opts into an override.
    primerRecipe: spec.primerRecipe || null,
    propellantRecipe: spec.propellantRecipe || null,
    operations: operations,
  };
};

global.createtaczrecipe = {
  definitions: [],
  ammoCatalog: [],
  caliberKeys: [],
  caliberDisplayNames: {},
  standardAmmo: standardAmmo,
  registerAmmo: (definition) => {
    global.createtaczrecipe.definitions.push(definition);
    const key = definition && definition.key ? definition.key : "<missing key>";
    console.log(`[CreateTacZrecipe] received ammo definition: ${key}`);
  },
};
