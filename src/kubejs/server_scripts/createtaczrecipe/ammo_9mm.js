ServerEvents.recipes((event) => {
  const add = (id, recipe) => event.custom(recipe).id(`createtaczrecipe:${id}`);

  // New gunpacks can be added by copying this spec and changing only IDs,
  // tags, counts and the final TaCZ AmmoId.
  const ammo = {
    key: "9mm",
    casingMold: "createtaczrecipe_9mm_casing",
    bulletMold: "createtaczrecipe_9mm_bullet",
    casingBlankTag: "createtaczrecipe:metal_blanks/brass",
    bulletBlankTag: "createtaczrecipe:metal_blanks/copper",
    casing: "createtaczrecipe:empty_9mm_casing",
    roughBullet: "createtaczrecipe:rough_9mm_bullet",
    polishedBullet: "createtaczrecipe:polished_9mm_bullet",
    primer: "createtaczrecipe:small_arms_primer",
    propellant: "createtaczrecipe:light_propellant_charge",
    transitional: "createtaczrecipe:incomplete_9mm_round",
    final: "tacz:ammo",
    ammoId: "tacz:9mm",
  };

  add(`molds/${ammo.key}_casing`, {
    type: "minecraft:crafting_shapeless",
    ingredients: [
      { tag: "c:plates/iron" },
      { item: "createdeco:brass_coin" },
    ],
    result: {
      id: "createdieselgenerators:mold",
      components: {
        "createdieselgenerators:mold_type": `kubejs:${ammo.casingMold}`,
      },
    },
  });

  add(`molds/${ammo.key}_bullet`, {
    type: "minecraft:crafting_shapeless",
    ingredients: [
      { tag: "c:plates/iron" },
      { item: "createdeco:copper_coin" },
    ],
    result: {
      id: "createdieselgenerators:mold",
      components: {
        "createdieselgenerators:mold_type": `kubejs:${ammo.bulletMold}`,
      },
    },
  });

  add(`components/empty_${ammo.key}_casing`, {
    type: "createdieselgenerators:compression_molding",
    ingredients: [{ tag: ammo.casingBlankTag }],
    mold: `kubejs:${ammo.casingMold}`,
    results: [{ id: ammo.casing }],
  });

  add(`components/rough_${ammo.key}_bullets`, {
    type: "createdieselgenerators:compression_molding",
    ingredients: [{ tag: ammo.bulletBlankTag }],
    mold: `kubejs:${ammo.bulletMold}`,
    results: [{ id: ammo.roughBullet, count: 2 }],
  });

  add(`components/polished_${ammo.key}_bullet`, {
    type: "create:sandpaper_polishing",
    ingredients: [{ item: ammo.roughBullet }],
    results: [{ id: ammo.polishedBullet }],
  });

  add("components/small_arms_primers", {
    type: "create:pressing",
    ingredients: [{ tag: "c:nuggets/iron" }],
    results: [{ id: ammo.primer, count: 10 }],
  });

  add("components/light_propellant_charges", {
    type: "create:mixing",
    ingredients: [{ tag: "c:gunpowders" }],
    results: [{ id: ammo.propellant, count: 25 }],
  });

  add(`ammo/${ammo.key}_sequenced_assembly`, {
    type: "create:sequenced_assembly",
    ingredient: { item: ammo.casing },
    transitional_item: { id: ammo.transitional },
    sequence: [
      {
        type: "create:deploying",
        ingredients: [
          { item: ammo.transitional },
          { item: ammo.primer },
        ],
        results: [{ id: ammo.transitional }],
      },
      {
        type: "create:deploying",
        ingredients: [
          { item: ammo.transitional },
          { item: ammo.propellant },
        ],
        results: [{ id: ammo.transitional }],
      },
      {
        type: "create:deploying",
        ingredients: [
          { item: ammo.transitional },
          { item: ammo.polishedBullet },
        ],
        results: [{ id: ammo.transitional }],
      },
      {
        type: "create:pressing",
        ingredients: [{ item: ammo.transitional }],
        results: [{ id: ammo.transitional }],
      },
    ],
    results: [
      {
        id: ammo.final,
        components: {
          "minecraft:custom_data": { AmmoId: ammo.ammoId },
        },
      },
    ],
  });
});
