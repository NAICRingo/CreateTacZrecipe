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
  polishing: { input: { item: "createtaczrecipe:rough_example_bullet" }, output: { id: "createtaczrecipe:polished_example_bullet" } },
  operations: [
    { type: "create:deploying", ingredients: [{ item: "createtaczrecipe:incomplete_example_round" }, { item: "createtaczrecipe:small_arms_primer" }], results: [{ id: "createtaczrecipe:incomplete_example_round" }] },
    { type: "create:cutting", ingredients: [{ item: "createtaczrecipe:incomplete_example_round" }], results: [{ id: "createtaczrecipe:incomplete_example_round" }] },
    { type: "create:pressing", ingredients: [{ item: "createtaczrecipe:incomplete_example_round" }], results: [{ id: "createtaczrecipe:incomplete_example_round" }] },
  ],
};
