// The reusable generator lives in 00_ammo_framework.js; this file is the stable 9mm entry point.
global.createtaczrecipe.registerAmmo(global.createtaczrecipe.standardAmmo({
  key: "9mm",
  counts: { casing: 50, roughBullet: 50 }, sourceBatch: 50, metalUnits: 10,
  chargeLevel: "light",
  primer: "createtaczrecipe:small_arms_primer",
  propellant: "createtaczrecipe:light_propellant_charge",
}));
