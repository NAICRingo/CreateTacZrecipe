ServerEvents.tags("item", (event) => {
  const keys = global.createtaczrecipe.caliberKeys;
  event.add("createtaczrecipe:metal_blanks/brass", "createdeco:brass_coin");
  event.add("createtaczrecipe:metal_blanks/copper", "createdeco:copper_coin");
  event.add("createtaczrecipe:metal_blanks/iron", "createdeco:iron_coin");
  event.add("createtaczrecipe:metal_blanks/industrial_iron", "createdeco:industrial_iron_coin");
  event.add("createtaczrecipe:primers/small_arms", "createtaczrecipe:small_arms_primer");
  event.add("createtaczrecipe:propellants/light", "createtaczrecipe:light_propellant_charge");
  keys.forEach((key) => {
    event.add(`createtaczrecipe:metal_blanks/${key}/brass`, "createdeco:brass_coin");
    event.add(`createtaczrecipe:metal_blanks/${key}/copper`, "createdeco:copper_coin");
    event.add("createtaczrecipe:casings/empty", `createtaczrecipe:empty_${key}_casing`);
    event.add("createtaczrecipe:projectiles/rough", `createtaczrecipe:rough_${key}_bullet`);
    event.add("createtaczrecipe:projectiles/polished", `createtaczrecipe:polished_${key}_bullet`);
    event.add("createtaczrecipe:cartridges/incomplete", `createtaczrecipe:incomplete_${key}_round`);
    event.add(`createtaczrecipe:${key}/casing`, `createtaczrecipe:empty_${key}_casing`);
    event.add(`createtaczrecipe:${key}/rough_bullet`, `createtaczrecipe:rough_${key}_bullet`);
    event.add(`createtaczrecipe:${key}/polished_bullet`, `createtaczrecipe:polished_${key}_bullet`);
    event.add(`createtaczrecipe:${key}/incomplete`, `createtaczrecipe:incomplete_${key}_round`);
  });
});
