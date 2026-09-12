// Example definition only. Do not place this file in server_scripts.
// In a real pack, call global.createtaczrecipe.registerAmmo(definition).
const exampleAmmo = {
  key: "example",
  casingMold: "createtaczrecipe_example_casing",
  bulletMold: "createtaczrecipe_example_bullet",
  materials: { casing: { tag: "createtaczrecipe:metal_blanks/brass" }, bullet: { tag: "createtaczrecipe:metal_blanks/copper" } },
  counts: { casing: 1, roughBullet: 2 },
  casing: "createtaczrecipe:empty_example_casing",
  roughBullet: "createtaczrecipe:rough_example_bullet",
  polishedBullet: "createtaczrecipe:polished_example_bullet",
  primer: "createtaczrecipe:small_arms_primer",
  propellant: "createtaczrecipe:light_propellant_charge",
  transitional: "createtaczrecipe:incomplete_example_round",
  final: "tacz:ammo",
  ammoId: "example_pack:example_ammo",
  polishing: { input: { ref: "roughBullet" }, output: { ref: "polishedBullet" } },
  primerRecipe: { type: "create:pressing", ingredients: [{ tag: "c:nuggets/iron" }], results: [{ ref: "primer", count: 10 }] },
  propellantRecipe: { type: "create:mixing", ingredients: [{ tag: "c:gunpowders" }], results: [{ ref: "propellant", count: 25 }] },
  operations: [
    { type: "create:deploying", keep_held_item: true, ingredients: [{ ref: "transitional" }, { ref: "primer" }], results: [{ ref: "transitional" }] },
    { type: "create:cutting", ingredients: [{ ref: "transitional" }], results: [{ ref: "transitional" }] },
    { type: "create:pressing", ingredients: [{ ref: "transitional" }], results: [{ ref: "transitional" }] },
  ],
};
