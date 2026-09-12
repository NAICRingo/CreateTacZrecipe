StartupEvents.registry("item", (event) => {
  const items = [
    ["empty_9mm_casing", "kubejs:item/createtaczrecipe_empty_9mm_casing"],
    ["rough_9mm_bullet", "kubejs:item/createtaczrecipe_rough_9mm_bullet"],
    ["polished_9mm_bullet", "kubejs:item/createtaczrecipe_polished_9mm_bullet"],
    ["small_arms_primer", "kubejs:item/createtaczrecipe_small_arms_primer"],
    ["light_propellant_charge", "kubejs:item/createtaczrecipe_light_propellant_charge"],
    ["incomplete_9mm_round", "kubejs:item/createtaczrecipe_incomplete_9mm_round"],
  ];

  items.forEach(([id, texture]) => {
    event.create(`createtaczrecipe:${id}`).texture(texture).maxStackSize(64);
  });
});
