// Data-driven Create/TaCZ ammunition recipe registration.
(() => {
  // These are the Create operation types supported inside sequenced assembly here.
  const allowed = { "create:deploying": true, "create:pressing": true, "create:cutting": true };
  const componentAllowed = { "create:deploying": true, "create:pressing": true, "create:cutting": true, "create:mixing": true, "create:sandpaper_polishing": true, "createdieselgenerators:compression_molding": true };
  let seen = {};
  const log = (message) => console.log(`[CreateTacZrecipe] ${message}`);
  const hasText = (value) => typeof value === "string" && value.length > 0;
  const validIngredient = (value) => value && (hasText(value.item) || hasText(value.tag) || hasText(value.ref));
  const validResult = (value) => value && (hasText(value.id) || hasText(value.ref));
  const resolveStack = (stack, ammo, result) => {
    const resolved = {};
    for (const field in stack) if (field !== "ref") resolved[field] = stack[field];
    if (stack.ref) resolved[result ? "id" : "item"] = ammo[stack.ref];
    return resolved;
  };
  const resolveRecipe = (recipe, ammo) => {
    const resolved = {};
    for (const field in recipe) resolved[field] = recipe[field];
    if (recipe.ingredients) resolved.ingredients = recipe.ingredients.map((stack) => resolveStack(stack, ammo, false));
    if (recipe.results) resolved.results = recipe.results.map((stack) => resolveStack(stack, ammo, true));
    return resolved;
  };
  const itemExists = (id) => {
    try { return !Item.of(id).isEmpty(); } catch (error) { log(`unable to inspect item ${id}: ${error}`); return false; }
  };
  const recipeId = (key) => { const id = `createtaczrecipe:${key}`; if (seen[id]) throw new Error(`duplicate recipe id ${id}`); seen[id] = true; return id; };
  const emit = (event, key, recipe) => {
    const id = `createtaczrecipe:${key}`;
    try {
      event.custom(recipe).id(recipeId(key));
      return true;
    } catch (error) {
      log(`failed recipe ${id}: ${error && error.stack ? error.stack : error}`);
      return false;
    }
  };
  const validateStep = (step, index, key) => {
    if (!step || !allowed[step.type]) { log(`skipped ${key}: invalid operation type at index ${index}: ${step && step.type}`); return false; }
    if (!Array.isArray(step.ingredients) || step.ingredients.some((item) => !validIngredient(item))) { log(`skipped ${key}: invalid ingredients at operation ${index}`); return false; }
    if (!Array.isArray(step.results) || step.results.some((item) => !validResult(item))) { log(`skipped ${key}: invalid results at operation ${index}`); return false; }
    return true;
  };
  const validateComponent = (recipe, name, key) => {
    if (!recipe) return true;
    if (!recipe.type || !componentAllowed[recipe.type]) { log(`skipped ${key}: unsupported ${name} recipe type ${recipe.type}`); return false; }
    if (recipe.ingredients && (!Array.isArray(recipe.ingredients) || recipe.ingredients.some((item) => !validIngredient(item)))) { log(`skipped ${key}: invalid ${name} ingredients`); return false; }
    if (recipe.results && (!Array.isArray(recipe.results) || recipe.results.some((item) => !validResult(item)))) { log(`skipped ${key}: invalid ${name} results`); return false; }
    return true;
  };
  const validate = (ammo) => {
    if (!ammo || typeof ammo !== "object") {
      log("skipped definition: expected an object");
      return false;
    }
    const required = ["key", "casingMold", "bulletMold", "casing", "roughBullet", "polishedBullet", "primer", "propellant", "transitional", "final", "ammoId"];
    const missing = required.filter((field) => !hasText(ammo[field]));
    if (missing.length || !ammo.materials || !validIngredient(ammo.materials.casing) || !validIngredient(ammo.materials.bullet) || !Array.isArray(ammo.operations)) { log(`skipped definition: missing or invalid fields (${missing.join(", ") || "materials/operations"})`); return false; }
    const outputs = [ammo.casing, ammo.roughBullet, ammo.polishedBullet, ammo.primer, ammo.propellant, ammo.transitional, ammo.final];
    const absent = outputs.filter((id) => !itemExists(id));
    if (absent.length) { log(`skipped ${ammo.key}: output item(s) not found: ${absent.join(", ")}`); return false; }
    if (!ammo.moldMaterials || !Array.isArray(ammo.moldMaterials.casing) || !Array.isArray(ammo.moldMaterials.bullet)) { log(`skipped ${ammo.key}: moldMaterials.casing and moldMaterials.bullet are required arrays`); return false; }
    if (!validateComponent(ammo.polishing, "polishing", ammo.key) || !validateComponent(ammo.primerRecipe, "primer", ammo.key) || !validateComponent(ammo.propellantRecipe, "propellant", ammo.key)) return false;
    for (let i = 0; i < ammo.operations.length; i++) if (!validateStep(ammo.operations[i], i, ammo.key)) return false;
    return true;
  };
  ServerEvents.recipes((event) => {
    seen = {};
    global.createtaczrecipe.definitions.forEach((ammo) => {
      if (!validate(ammo)) return;
      const base = `ammo/${ammo.key}`;
      let registered = 0;
      if (emit(event, `molds/${ammo.key}_casing`, { type: "minecraft:crafting_shapeless", ingredients: ammo.moldMaterials.casing, result: { id: "createdieselgenerators:mold", components: { "createdieselgenerators:mold_type": `kubejs:${ammo.casingMold}` } } })) registered++;
      if (emit(event, `molds/${ammo.key}_bullet`, { type: "minecraft:crafting_shapeless", ingredients: ammo.moldMaterials.bullet, result: { id: "createdieselgenerators:mold", components: { "createdieselgenerators:mold_type": `kubejs:${ammo.bulletMold}` } } })) registered++;
      if (emit(event, `components/${ammo.key}_casing`, { type: "createdieselgenerators:compression_molding", ingredients: [ammo.materials.casing], mold: `kubejs:${ammo.casingMold}`, results: [{ id: ammo.outputItem && ammo.outputItem.casing || ammo.casing, count: ammo.counts && ammo.counts.casing || 1 }] })) registered++;
      if (emit(event, `components/${ammo.key}_rough_bullet`, { type: "createdieselgenerators:compression_molding", ingredients: [ammo.materials.bullet], mold: `kubejs:${ammo.bulletMold}`, results: [{ id: ammo.outputItem && ammo.outputItem.roughBullet || ammo.roughBullet, count: ammo.counts && ammo.counts.roughBullet || 1 }] })) registered++;
      if (ammo.polishing && emit(event, `components/${ammo.key}_polishing`, { type: "create:sandpaper_polishing", ingredients: [resolveStack(ammo.polishing.input, ammo, false)], results: [resolveStack(ammo.polishing.output, ammo, true)] })) registered++;
      if (ammo.primerRecipe && emit(event, `components/${ammo.key}_primer`, resolveRecipe(ammo.primerRecipe, ammo))) registered++;
      if (ammo.propellantRecipe && emit(event, `components/${ammo.key}_propellant`, resolveRecipe(ammo.propellantRecipe, ammo))) registered++;
      const sequence = ammo.operations.map((step) => {
        const operation = {};
        for (const field in step) operation[field] = step[field];
        operation.ingredients = step.ingredients.map((stack) => resolveStack(stack, ammo, false));
        operation.results = step.results.map((stack) => resolveStack(stack, ammo, true));
        return operation;
      });
      if (emit(event, `${base}_sequenced_assembly`, { type: "create:sequenced_assembly", ingredient: ammo.inputIngredient && ammo.inputIngredient.casing || { item: ammo.casing }, transitional_item: { id: ammo.outputItem && ammo.outputItem.transitional || ammo.transitional }, sequence: sequence, results: [{ id: ammo.final, components: { "minecraft:custom_data": { AmmoId: ammo.ammoId } } }] })) registered++;
      log(`registered ${registered} recipes for ammo key ${ammo.key}`);
    });
  });
})();
