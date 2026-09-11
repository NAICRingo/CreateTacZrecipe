StartupEvents.registry("item", (event) => {
  const items = [
    ["empty_9mm_casing", "createdeco:item/brass_coin"],
    ["rough_9mm_bullet", "createdeco:item/copper_coin"],
    ["polished_9mm_bullet", "minecraft:item/copper_ingot"],
    ["small_arms_primer", "minecraft:item/iron_nugget"],
    ["light_propellant_charge", "minecraft:item/gunpowder"],
    ["incomplete_9mm_round", "createdeco:item/brass_coin"],
  ];

  items.forEach(([id, texture]) => {
    event.create(`lo2900r:${id}`).texture(texture).maxStackSize(64);
  });
});
