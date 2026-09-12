// KubeJS only permits assigning global values during startup scripts.
const caliberKeys = [
  "22wmr", "9mm", "45acp", "46x30", "57x28", "762x25", "357mag", "500mag", "50ae",
  "545x39", "556x45", "58x42", "68x51fury", "762x39", "30_06", "308", "338", "45_70",
  "762x54", "792x57", "50bmg",
];

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
  const chargeLevel = spec.chargeLevel || (spec.powderCount && spec.powderCount >= 8 ? "heavy" : (spec.powderCount && spec.powderCount >= 3 ? "standard" : "light"));
  const propellant = spec.propellant || `createtaczrecipe:${chargeLevel}_propellant_charge`;
  const propellantIngredients = [{ tag: "createtaczrecipe:materials/propellants", count: spec.powderCount || 2 }].concat(spec.propellantExtraIngredients || []);
  const primerInput = spec.inputIngredient && spec.inputIngredient.primer ? spec.inputIngredient.primer : { tag: "createtaczrecipe:materials/primers" };
  const propellantInput = spec.inputIngredient && spec.inputIngredient.propellant ? spec.inputIngredient.propellant : { tag: `createtaczrecipe:propellants/${chargeLevel}` };
  const sourceBatch = spec.sourceBatch || 50;
  const metalUnits = spec.metalUnits || 10;
  const casingMetalUnits = spec.casingMetalUnits || Math.max(1, Math.ceil(metalUnits / 2));
  const bulletMetalUnits = spec.bulletMetalUnits || Math.max(1, metalUnits - casingMetalUnits);
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
    },
    inputIngredient: { casing: casingInput, polishedBullet: bulletInput, primer: primerInput, propellant: propellantInput },
    outputItem: { casing: casing, roughBullet: roughBullet, polishedBullet: polishedBullet, transitional: transitional },
    counts: spec.counts || { casing: 1, roughBullet: 1 },
    economy: { sourceBatch: sourceBatch, metalUnits: metalUnits, casingMetalUnits: casingMetalUnits, bulletMetalUnits: bulletMetalUnits, powderUnits: spec.powderCount || 2, assemblyOutputCount: spec.assemblyOutputCount || 1 },
    casing: casing,
    roughBullet: roughBullet,
    polishedBullet: polishedBullet,
    primer: primer,
    propellant: propellant,
    transitional: transitional,
    final: spec.final || "tacz:ammo",
    ammoId: spec.ammoId || `tacz:${key}`,
    polishing: spec.polishing || { input: { ref: "roughBullet" }, output: { ref: "polishedBullet" } },
    primerRecipe: spec.primerRecipe || {
      type: "create:pressing",
      ingredients: [{ tag: "createtaczrecipe:materials/iron_plates" }],
      results: [{ ref: "primer", count: 10 }],
    },
    propellantRecipe: spec.propellantRecipe || {
      type: "create:mixing",
      ingredients: propellantIngredients,
      results: [{ ref: "propellant", count: sourceBatch }],
    },
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
  standardAmmo: standardAmmo,
  registerAmmo: (definition) => {
    global.createtaczrecipe.definitions.push(definition);
    const key = definition && definition.key ? definition.key : "<missing key>";
    console.log(`[CreateTacZrecipe] received ammo definition: ${key}`);
  },
};
