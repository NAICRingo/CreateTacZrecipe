ServerEvents.recipes((event) => {
  const add = (id, recipe) => event.custom(recipe).id(`lo2900r:${id}`);

  add("molds/9mm_casing", {
    type: "minecraft:crafting_shapeless",
    ingredients: [
      { tag: "c:plates/iron" },
      { item: "createdeco:brass_coin" },
    ],
    result: {
      id: "createdieselgenerators:mold",
      components: {
        "createdieselgenerators:mold_type": "kubejs:lo2900r_9mm_casing",
      },
    },
  });

  add("molds/9mm_bullet", {
    type: "minecraft:crafting_shapeless",
    ingredients: [
      { tag: "c:plates/iron" },
      { item: "createdeco:copper_coin" },
    ],
    result: {
      id: "createdieselgenerators:mold",
      components: {
        "createdieselgenerators:mold_type": "kubejs:lo2900r_9mm_bullet",
      },
    },
  });

  add("components/empty_9mm_casing", {
    type: "createdieselgenerators:compression_molding",
    ingredients: [{ tag: "lo2900r:metal_blanks/brass" }],
    mold: "kubejs:lo2900r_9mm_casing",
    results: [{ id: "lo2900r:empty_9mm_casing" }],
  });

  add("components/rough_9mm_bullets", {
    type: "createdieselgenerators:compression_molding",
    ingredients: [{ tag: "lo2900r:metal_blanks/copper" }],
    mold: "kubejs:lo2900r_9mm_bullet",
    results: [{ id: "lo2900r:rough_9mm_bullet", count: 2 }],
  });

  add("components/polished_9mm_bullet", {
    type: "create:sandpaper_polishing",
    ingredients: [{ item: "lo2900r:rough_9mm_bullet" }],
    results: [{ id: "lo2900r:polished_9mm_bullet" }],
  });

  add("components/small_arms_primers", {
    type: "create:pressing",
    ingredients: [{ tag: "c:nuggets/iron" }],
    results: [{ id: "lo2900r:small_arms_primer", count: 10 }],
  });

  add("components/light_propellant_charges", {
    type: "create:mixing",
    ingredients: [{ tag: "c:gunpowders" }],
    results: [{ id: "lo2900r:light_propellant_charge", count: 25 }],
  });

  add("ammo/9mm_sequenced_assembly", {
    type: "create:sequenced_assembly",
    ingredient: { item: "lo2900r:empty_9mm_casing" },
    transitional_item: { id: "lo2900r:incomplete_9mm_round" },
    sequence: [
      {
        type: "create:deploying",
        ingredients: [
          { item: "lo2900r:incomplete_9mm_round" },
          { item: "lo2900r:small_arms_primer" },
        ],
        results: [{ id: "lo2900r:incomplete_9mm_round" }],
      },
      {
        type: "create:deploying",
        ingredients: [
          { item: "lo2900r:incomplete_9mm_round" },
          { item: "lo2900r:light_propellant_charge" },
        ],
        results: [{ id: "lo2900r:incomplete_9mm_round" }],
      },
      {
        type: "create:deploying",
        ingredients: [
          { item: "lo2900r:incomplete_9mm_round" },
          { item: "lo2900r:polished_9mm_bullet" },
        ],
        results: [{ id: "lo2900r:incomplete_9mm_round" }],
      },
      {
        type: "create:pressing",
        ingredients: [{ item: "lo2900r:incomplete_9mm_round" }],
        results: [{ id: "lo2900r:incomplete_9mm_round" }],
      },
    ],
    results: [
      {
        id: "tacz:ammo",
        components: {
          "minecraft:custom_data": { AmmoId: "tacz:9mm" },
        },
      },
    ],
  });
});
