StartupEvents.registry("item", (event) => {
  const items = [
    ["empty_9mm_casing", "createtaczrecipe:item/empty_casing"],
    ["rough_9mm_bullet", "createtaczrecipe:item/rough_projectile"],
    ["polished_9mm_bullet", "createtaczrecipe:item/polished_projectile"],
    ["small_arms_primer", "createtaczrecipe:item/small_arms_primer"],
    ["primer_compound", "createtaczrecipe:item/primer_compound"],
    ["brass_casing_blank", "createtaczrecipe:item/brass_casing_blank"],
    ["copper_projectile_blank", "createtaczrecipe:item/copper_projectile_blank"],
    ["loose_propellant", "createtaczrecipe:item/loose_propellant"],
    ["light_propellant_charge", "createtaczrecipe:item/light_propellant_charge"],
    ["standard_propellant_charge", "createtaczrecipe:item/standard_propellant_charge"],
    ["heavy_propellant_charge", "createtaczrecipe:item/heavy_propellant_charge"],
    ["incomplete_9mm_round", "createtaczrecipe:item/incomplete_cartridge"],
  ];
  global.createtaczrecipe.defaultCaliberKeys.forEach((key) => {
    items.push([`${key}_propellant_charge`, `createtaczrecipe:item/propellant_charge/${key}`]);
    if (key === "9mm") return;
    items.push([`empty_${key}_casing`, "createtaczrecipe:item/empty_casing"]);
    items.push([`rough_${key}_bullet`, "createtaczrecipe:item/rough_projectile"]);
    items.push([`polished_${key}_bullet`, "createtaczrecipe:item/polished_projectile"]);
    items.push([`incomplete_${key}_round`, "createtaczrecipe:item/incomplete_cartridge"]);
  });

  // External definitions may choose project-namespace item IDs. Register only
  // those IDs; IDs owned by another mod are intentionally left untouched.
  (global.createtaczrecipe.externalAmmo || []).forEach((ammo) => {
    const externalItems = [
      [ammo.casing, ammo.visuals.casing || "createtaczrecipe:item/empty_casing"],
      [ammo.roughBullet, ammo.visuals.roughBullet || "createtaczrecipe:item/rough_projectile"],
      [ammo.polishedBullet, ammo.visuals.polishedBullet || "createtaczrecipe:item/polished_projectile"],
      [ammo.transitional, ammo.visuals.transitional || "createtaczrecipe:item/incomplete_cartridge"],
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
