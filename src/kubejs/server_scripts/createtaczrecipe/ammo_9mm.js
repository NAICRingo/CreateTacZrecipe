// The reusable generator lives in 00_ammo_framework.js; this file is the stable 9mm entry point.
global.createtaczrecipe.registerAmmo(global.createtaczrecipe.standardAmmo({
  key: "9mm",
  counts: { casing: 1, roughBullet: 2 }, sourceBatch: 50,
  casingMaterialTag: "createtaczrecipe:metal_blanks/9mm/brass",
  bulletMaterialTag: "createtaczrecipe:metal_blanks/9mm/copper",
  primer: "createtaczrecipe:small_arms_primer",
  propellant: "createtaczrecipe:light_propellant_charge",
}));
