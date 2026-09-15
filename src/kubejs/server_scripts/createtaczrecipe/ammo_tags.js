ServerEvents.tags("item", (event) => {
  const keys = global.createtaczrecipe.defaultCaliberKeys;
  const hasItem = (id) => { try { return !Item.of(id).isEmpty(); } catch (error) { return false; } };
  if (hasItem("createdeco:brass_coin")) event.add("createtaczrecipe:materials/brass_blanks", "createdeco:brass_coin");
  else event.add("createtaczrecipe:materials/brass_blanks", "#c:ingots/brass");
  if (hasItem("createdeco:copper_coin")) event.add("createtaczrecipe:materials/copper_blanks", "createdeco:copper_coin");
  else event.add("createtaczrecipe:materials/copper_blanks", "#c:ingots/copper");
  event.add("createtaczrecipe:materials/iron_plates", "#c:plates/iron");
  event.add("createtaczrecipe:materials/primers", "createtaczrecipe:small_arms_primer");
  event.add("createtaczrecipe:materials/propellants", "minecraft:gunpowder");
  event.add("createtaczrecipe:propellants/loose", "createtaczrecipe:loose_propellant");
  event.add("createtaczrecipe:propellants/light", "createtaczrecipe:light_propellant_charge");
  event.add("createtaczrecipe:propellants/standard", "createtaczrecipe:standard_propellant_charge");
  event.add("createtaczrecipe:propellants/heavy", "createtaczrecipe:heavy_propellant_charge");
  keys.forEach((key) => {
    event.add("createtaczrecipe:casings/empty", `createtaczrecipe:empty_${key}_casing`);
    event.add("createtaczrecipe:projectiles/rough", `createtaczrecipe:rough_${key}_bullet`);
    event.add("createtaczrecipe:projectiles/polished", `createtaczrecipe:polished_${key}_bullet`);
    event.add("createtaczrecipe:cartridges/incomplete", `createtaczrecipe:incomplete_${key}_round`);
    event.add(`createtaczrecipe:casings/empty/${key}`, `createtaczrecipe:empty_${key}_casing`);
    event.add(`createtaczrecipe:projectiles/rough/${key}`, `createtaczrecipe:rough_${key}_bullet`);
    event.add(`createtaczrecipe:projectiles/polished/${key}`, `createtaczrecipe:polished_${key}_bullet`);
    event.add(`createtaczrecipe:cartridges/incomplete/${key}`, `createtaczrecipe:incomplete_${key}_round`);
  });
  (global.createtaczrecipe.externalAmmo || []).forEach((ammo) => {
    event.add("createtaczrecipe:casings/empty", ammo.casing);
    event.add("createtaczrecipe:projectiles/rough", ammo.roughBullet);
    event.add("createtaczrecipe:projectiles/polished", ammo.polishedBullet);
    event.add("createtaczrecipe:cartridges/incomplete", ammo.transitional);
    event.add(`createtaczrecipe:casings/empty/${ammo.key}`, ammo.casing);
    event.add(`createtaczrecipe:projectiles/rough/${ammo.key}`, ammo.roughBullet);
    event.add(`createtaczrecipe:projectiles/polished/${ammo.key}`, ammo.polishedBullet);
    event.add(`createtaczrecipe:cartridges/incomplete/${ammo.key}`, ammo.transitional);
  });
});
