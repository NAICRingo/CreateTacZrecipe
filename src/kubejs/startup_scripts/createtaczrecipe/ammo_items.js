StartupEvents.registry("item", (event) => {
  const items = [
    ["empty_9mm_casing", "kubejs:item/createtaczrecipe_empty_9mm_casing"],
    ["rough_9mm_bullet", "kubejs:item/createtaczrecipe_rough_9mm_bullet"],
    ["polished_9mm_bullet", "kubejs:item/createtaczrecipe_polished_9mm_bullet"],
    ["small_arms_primer", "kubejs:item/createtaczrecipe_small_arms_primer"],
    ["primer_compound", "kubejs:item/createtaczrecipe_small_arms_primer"],
    ["brass_casing_blank", "kubejs:item/createtaczrecipe_empty_9mm_casing"],
    ["copper_projectile_blank", "kubejs:item/createtaczrecipe_rough_9mm_bullet"],
    ["loose_propellant", "kubejs:item/createtaczrecipe_light_propellant_charge"],
    ["light_propellant_charge", "kubejs:item/createtaczrecipe_light_propellant_charge"],
    ["standard_propellant_charge", "kubejs:item/createtaczrecipe_light_propellant_charge"],
    ["heavy_propellant_charge", "kubejs:item/createtaczrecipe_light_propellant_charge"],
    ["incomplete_9mm_round", "kubejs:item/createtaczrecipe_incomplete_9mm_round"],
  ];
  global.createtaczrecipe.defaultCaliberKeys.forEach((key) => {
    items.push([`${key}_propellant_charge`, "kubejs:item/createtaczrecipe_light_propellant_charge"]);
    if (key === "9mm") return;
    items.push([`empty_${key}_casing`, "kubejs:item/createtaczrecipe_empty_9mm_casing"]);
    items.push([`rough_${key}_bullet`, "kubejs:item/createtaczrecipe_rough_9mm_bullet"]);
    items.push([`polished_${key}_bullet`, "kubejs:item/createtaczrecipe_polished_9mm_bullet"]);
    items.push([`incomplete_${key}_round`, "kubejs:item/createtaczrecipe_incomplete_9mm_round"]);
  });

  // External definitions may choose project-namespace item IDs. Register only
  // those IDs; IDs owned by another mod are intentionally left untouched.
  (global.createtaczrecipe.externalAmmo || []).forEach((ammo) => {
    const externalItems = [
      [ammo.casing, ammo.visuals.casing || "kubejs:item/createtaczrecipe_empty_9mm_casing"],
      [ammo.roughBullet, ammo.visuals.roughBullet || "kubejs:item/createtaczrecipe_rough_9mm_bullet"],
      [ammo.polishedBullet, ammo.visuals.polishedBullet || "kubejs:item/createtaczrecipe_polished_9mm_bullet"],
      [ammo.transitional, ammo.visuals.transitional || "kubejs:item/createtaczrecipe_incomplete_9mm_round"],
    ];
    externalItems.forEach(([id, texture]) => {
      if (id.indexOf("createtaczrecipe:") === 0 && !items.some((entry) => `createtaczrecipe:${entry[0]}` === id)) {
        items.push([id.substring("createtaczrecipe:".length), texture]);
      }
    });
  });

  items.forEach(([id, texture, displayName]) => {
    const item = event.create(`createtaczrecipe:${id}`).texture(texture).maxStackSize(64);
    if (displayName) item.displayName(displayName);
  });
});
