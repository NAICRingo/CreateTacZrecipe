// Data-driven Create/TaCZ ammunition recipe registration.
(() => {
  const allowed = { "create:deploying": true, "create:pressing": true, "create:cutting": true, "create:mixing": true, "create:sandpaper_polishing": true, "createdieselgenerators:compression_molding": true };
  const definitions = [];
  const seen = {};
  const log = (message) => console.log(`[CreateTacZrecipe] ${message}`);
  global.createtaczrecipe = global.createtaczrecipe || {};
  global.createtaczrecipe.registerAmmo = (definition) => definitions.push(definition);
  const hasText = (value) => typeof value === "string" && value.length > 0;
  const validIngredient = (value) => value && (hasText(value.item) || hasText(value.tag));
  const validResult = (value) => value && hasText(value.id);
  const recipeId = (key) => { const id = `createtaczrecipe:${key}`; if (seen[id]) throw new Error(`duplicate recipe id ${id}`); seen[id] = true; return id; };
  const emit = (event, key, recipe) => { try { event.custom(recipe).id(recipeId(key)); } catch (error) { log(`skipped ${key}: ${error}`); } };
  const validateStep = (step, index, key) => {
    if (!step || !allowed[step.type]) { log(`skipped ${key}: invalid operation type at index ${index}: ${step && step.type}`); return false; }
    if (!Array.isArray(step.ingredients) || step.ingredients.some((item) => !validIngredient(item))) { log(`skipped ${key}: invalid ingredients at operation ${index}`); return false; }
    if (!Array.isArray(step.results) || step.results.some((item) => !validResult(item))) { log(`skipped ${key}: invalid results at operation ${index}`); return false; }
    return true;
  };
  const validate = (ammo) => {
    const required = ["key", "casingMold", "bulletMold", "casing", "roughBullet", "polishedBullet", "primer", "propellant", "transitional", "final", "ammoId"];
    const missing = required.filter((field) => !hasText(ammo[field]));
    if (missing.length || !ammo.materials || !validIngredient(ammo.materials.casing) || !validIngredient(ammo.materials.bullet) || !Array.isArray(ammo.operations)) { log(`skipped definition: missing or invalid fields (${missing.join(", ") || "materials/operations"})`); return false; }
    for (let i = 0; i < ammo.operations.length; i++) if (!validateStep(ammo.operations[i], i, ammo.key)) return false;
    return true;
  };
  ServerEvents.recipes((event) => {
    definitions.forEach((ammo) => {
      if (!validate(ammo)) return;
      const base = `ammo/${ammo.key}`;
      emit(event, `molds/${ammo.key}_casing`, { type: "minecraft:crafting_shapeless", ingredients: [{ tag: "c:plates/iron" }, { item: "createdeco:brass_coin" }], result: { id: "createdieselgenerators:mold", components: { "createdieselgenerators:mold_type": `kubejs:${ammo.casingMold}` } } });
      emit(event, `molds/${ammo.key}_bullet`, { type: "minecraft:crafting_shapeless", ingredients: [{ tag: "c:plates/iron" }, { item: "createdeco:copper_coin" }], result: { id: "createdieselgenerators:mold", components: { "createdieselgenerators:mold_type": `kubejs:${ammo.bulletMold}` } } });
      emit(event, `components/${ammo.key}_casing`, { type: "createdieselgenerators:compression_molding", ingredients: [ammo.materials.casing], mold: `kubejs:${ammo.casingMold}`, results: [{ id: ammo.casing, count: ammo.counts && ammo.counts.casing || 1 }] });
      emit(event, `components/${ammo.key}_rough_bullet`, { type: "createdieselgenerators:compression_molding", ingredients: [ammo.materials.bullet], mold: `kubejs:${ammo.bulletMold}`, results: [{ id: ammo.roughBullet, count: ammo.counts && ammo.counts.roughBullet || 1 }] });
      if (ammo.polishing) emit(event, `components/${ammo.key}_polishing`, { type: "create:sandpaper_polishing", ingredients: [ammo.polishing.input], results: [ammo.polishing.output] });
      if (ammo.primerRecipe) emit(event, `components/${ammo.key}_primer`, ammo.primerRecipe);
      if (ammo.propellantRecipe) emit(event, `components/${ammo.key}_propellant`, ammo.propellantRecipe);
      const sequence = ammo.operations.map((step) => ({ type: step.type, ingredients: step.ingredients, results: step.results }));
      emit(event, `${base}_sequenced_assembly`, { type: "create:sequenced_assembly", ingredient: { item: ammo.casing }, transitional_item: { id: ammo.transitional }, sequence, results: [{ id: ammo.final, components: { "minecraft:custom_data": { AmmoId: ammo.ammoId } } }] });
    });
  });
})();
