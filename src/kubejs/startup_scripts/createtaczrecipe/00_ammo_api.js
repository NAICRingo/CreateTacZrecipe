// KubeJS only permits assigning global values during startup scripts.
const caliberKeys = [
  "22wmr", "9mm", "45acp", "46x30", "57x28", "762x25", "357mag", "500mag", "50ae",
  "545x39", "556x45", "58x42", "68x51fury", "762x39", "30_06", "308", "338", "45_70",
  "762x54", "792x57", "50bmg",
];
const caliberDisplayNames = {
  "22wmr": ".22 Winchester Magnum", "9mm": "9mm", "45acp": ".45 ACP", "46x30": "4.6x30mm", "57x28": "5.7x28mm",
  "762x25": "7.62x25mm Tokarev", "357mag": ".357 Magnum", "500mag": ".500 Magnum", "50ae": ".50 AE",
  "545x39": "5.45x39mm", "556x45": "5.56x45mm", "58x42": "5.8x42mm DBP87", "68x51fury": "6.8x51mm Fury",
  "762x39": "7.62x39mm", "30_06": ".30-06 Springfield", "308": ".308 Winchester", "338": ".338 Lapua Magnum",
  "45_70": ".45-70 Government", "762x54": "7.62x54mm", "792x57": "8mm Mauser", "50bmg": ".50 BMG",
};

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
    counts: spec.counts || { casing: 1, roughBullet: 1 },
    economy: { sourceBatch: sourceBatch, metalUnits: metalUnits, casingMetalUnits: casingMetalUnits, bulletMetalUnits: bulletMetalUnits, powderUnits: spec.powderCount || 2, chargeMaterialUnits: chargeMaterialUnits, chargeCapacity: Math.floor((spec.powderCount || 2) * 24 / chargeMaterialUnits), assemblyOutputCount: spec.assemblyOutputCount || 1 },
    casing: casing,
    roughBullet: roughBullet,
    polishedBullet: polishedBullet,
    primer: primer,
    propellant: propellant,
    chargeLevel: chargeLevel,
    transitional: transitional,
    final: spec.final || "tacz:ammo",
    ammoId: spec.ammoId || `tacz:${key}`,
    polishing: spec.polishing || { type: "create:sandpaper_polishing", input: { ref: "roughBullet" }, output: { ref: "polishedBullet" } },
    primerRecipe: spec.primerRecipe || {
      type: "create:pressing",
      ingredients: [{ tag: "createtaczrecipe:materials/iron_plates" }],
      results: [{ ref: "primer", count: 10 }],
    },
    propellantRecipe: spec.propellantRecipe || null,
    operations: spec.operations || [
      { type: "create:deploying", ingredients: [{ ref: "transitional" }, primerInput], results: [{ ref: "transitional" }] },
      { type: "create:deploying", ingredients: [{ ref: "transitional" }, propellantInput], results: [{ ref: "transitional" }] },
      { type: "create:deploying", ingredients: [{ ref: "transitional" }, bulletInput], results: [{ ref: "transitional" }] },
    ].concat(spec.extraOperations || [], [
      { type: "create:pressing", ingredients: [{ ref: "transitional" }], results: [{ ref: "transitional" }] },
    ]),
  };
};

global.createtaczrecipe = {
  definitions: [],
  caliberKeys: caliberKeys,
  caliberDisplayNames: caliberDisplayNames,
  standardAmmo: standardAmmo,
  registerAmmo: (definition) => {
    global.createtaczrecipe.definitions.push(definition);
    const key = definition && definition.key ? definition.key : "<missing key>";
    console.log(`[CreateTacZrecipe] received ammo definition: ${key}`);
  },
};
