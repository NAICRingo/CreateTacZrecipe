ServerEvents.recipes((event) => {
  const add = (id, recipe) => event.custom(recipe).id(`lo2900r:${id}`);

  // New gunpacks can be added by copying this spec and changing only IDs,
  // tags, counts and the final TaCZ AmmoId.
  const ammo = {
    key: "9mm",
    casingMold: "lo2900r_9mm_casing",
    bulletMold: "lo2900r_9mm_bullet",
    casingBlankTag: "lo2900r:metal_blanks/brass",
    bulletBlankTag: "lo2900r:metal_blanks/copper",
    casing: "lo2900r:empty_9mm_casing",
    roughBullet: "lo2900r:rough_9mm_bullet",
    polishedBullet: "lo2900r:polished_9mm_bullet",
    primer: "lo2900r:small_arms_primer",
    propellant: "lo2900r:light_propellant_charge",
    transitional: "lo2900r:incomplete_9mm_round",
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
