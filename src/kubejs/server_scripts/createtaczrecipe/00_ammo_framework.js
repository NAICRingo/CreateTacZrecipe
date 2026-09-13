// Data-driven Create/TaCZ ammunition recipe registration.
(() => {
  // These are the Create operation types supported inside sequenced assembly here.
  const allowed = { "create:deploying": true, "create:pressing": true, "create:cutting": true };
  const componentAllowed = { "create:deploying": true, "create:pressing": true, "create:cutting": true, "create:mixing": true, "create:compacting": true, "create:sandpaper_polishing": true, "createdieselgenerators:compression_molding": true };
  const compressionMoldingInputLimit = 64;
  let seen = {};
  const log = (message) => console.log(`[CreateTacZrecipe] ${message}`);
  const hasText = (value) => typeof value === "string" && value.length > 0;
  const validIngredient = (value) => value && (hasText(value.item) || hasText(value.tag) || hasText(value.ref));
  const validResult = (value) => value && (hasText(value.id) || hasText(value.ref));
  const validCount = (value) => value === undefined || (Number.isInteger(value) && value >= 1 && value <= 99);
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
  const repeatIngredient = (ingredient, amount) => {
    const repeated = [];
    for (let i = 0; i < amount; i++) {
      const copy = {};
      for (const field in ingredient) if (field !== "amount" && field !== "count") copy[field] = ingredient[field];
      repeated.push(copy);
    }
    return repeated;
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
    if (recipe.results && (!Array.isArray(recipe.results) || recipe.results.some((item) => !validResult(item) || !validCount(item.count)))) { log(`skipped ${key}: invalid ${name} results/count`); return false; }
    return true;
  };
  const validateCompressionMoldingInputs = (ammo) => {
    const casingCount = ammo.economy.casingMetalUnits;
    const bulletCount = ammo.economy.bulletMetalUnits + ammo.materials.bulletExtras.reduce((total, ingredient) => total + ingredient.amount, 0);
    const recipes = [
      { id: `createtaczrecipe:components/${ammo.key}_casing`, count: casingCount },
      { id: `createtaczrecipe:components/${ammo.key}_rough_bullet`, count: bulletCount },
    ];
    let valid = true;
    recipes.forEach((recipe) => {
      if (recipe.count > compressionMoldingInputLimit) {
        log(`skipped ${ammo.key}: compression molding recipe ${recipe.id} has ${recipe.count} item inputs; maximum is ${compressionMoldingInputLimit}`);
        valid = false;
      }
    });
    return valid;
  };
  const validate = (ammo) => {
    if (!ammo || typeof ammo !== "object") {
      log("skipped definition: expected an object");
      return false;
    }
    const required = ["key", "casingMold", "bulletMold", "casing", "roughBullet", "polishedBullet", "primer", "propellant", "transitional", "final", "ammoId"];
    const missing = required.filter((field) => !hasText(ammo[field]));
    if (missing.length || !ammo.materials || !validIngredient(ammo.materials.casing) || !validIngredient(ammo.materials.bullet) || !ammo.inputIngredient || !validIngredient(ammo.inputIngredient.casing) || !validIngredient(ammo.inputIngredient.polishedBullet) || !validIngredient(ammo.inputIngredient.primer) || !validIngredient(ammo.inputIngredient.propellant) || !Array.isArray(ammo.operations)) { log(`skipped definition: missing or invalid fields (${missing.join(", ") || "materials/inputIngredient/operations"})`); return false; }
    const outputs = [ammo.casing, ammo.roughBullet, ammo.polishedBullet, ammo.primer, ammo.propellant, ammo.transitional, ammo.final];
    const absent = outputs.filter((id) => !itemExists(id));
    if (absent.length) { log(`skipped ${ammo.key}: output item(s) not found: ${absent.join(", ")}`); return false; }
    if (!ammo.moldMaterials || !Array.isArray(ammo.moldMaterials.casing) || !Array.isArray(ammo.moldMaterials.bullet)) { log(`skipped ${ammo.key}: moldMaterials.casing and moldMaterials.bullet are required arrays`); return false; }
    if (!Array.isArray(ammo.materials.bulletExtras) || ammo.materials.bulletExtras.some((ingredient) => !validIngredient(ingredient) || !Number.isInteger(ingredient.amount) || ingredient.amount < 1 || ingredient.amount > 99)) { log(`skipped ${ammo.key}: invalid bulletExtraIngredients`); return false; }
    if (!ammo.counts || !validCount(ammo.counts.casing) || !validCount(ammo.counts.roughBullet) || !ammo.economy || !validCount(ammo.economy.sourceBatch)) { log(`skipped ${ammo.key}: result counts must be integers in range 1..99`); return false; }
    if (["light", "standard", "heavy"].indexOf(ammo.chargeLevel) < 0) { log(`skipped ${ammo.key}: invalid chargeLevel ${ammo.chargeLevel}`); return false; }
    if (!validateCompressionMoldingInputs(ammo)) return false;
    if (!validateComponent(ammo.polishing, "polishing", ammo.key) || !validateComponent(ammo.primerRecipe, "primer", ammo.key) || !validateComponent(ammo.propellantRecipe, "propellant", ammo.key)) return false;
    for (let i = 0; i < ammo.operations.length; i++) if (!validateStep(ammo.operations[i], i, ammo.key)) return false;
    return true;
  };
  ServerEvents.recipes((event) => {
    seen = {};
    let commonRegistered = 0;
    if (emit(event, "components/loose_propellant", { type: "create:mixing", ingredients: [{ tag: "createtaczrecipe:materials/propellants" }], results: [{ id: "createtaczrecipe:loose_propellant", count: 24 }] })) commonRegistered++;
    if (emit(event, "components/light_propellant", { type: "create:pressing", ingredients: [{ tag: "createtaczrecipe:propellants/loose" }], results: [{ id: "createtaczrecipe:light_propellant_charge" }] })) commonRegistered++;
    if (emit(event, "components/standard_propellant", { type: "create:compacting", ingredients: repeatIngredient({ tag: "createtaczrecipe:propellants/loose" }, 4), results: [{ id: "createtaczrecipe:standard_propellant_charge" }] })) commonRegistered++;
    if (emit(event, "components/heavy_propellant", { type: "create:compacting", heat_requirement: "heated", ingredients: repeatIngredient({ tag: "createtaczrecipe:propellants/standard" }, 5), results: [{ id: "createtaczrecipe:heavy_propellant_charge" }] })) commonRegistered++;
    if (emit(event, "components/small_arms_primer", { type: "create:pressing", ingredients: [{ tag: "createtaczrecipe:materials/iron_plates" }], results: [{ id: "createtaczrecipe:small_arms_primer", count: 10 }] })) commonRegistered++;
    log(`registered ${commonRegistered} common component recipes`);
    global.createtaczrecipe.definitions.forEach((ammo) => {
      if (!validate(ammo)) return;
      const base = `ammo/${ammo.key}`;
      let registered = 0;
      if (emit(event, `molds/${ammo.key}_casing`, { type: "minecraft:crafting_shapeless", ingredients: ammo.moldMaterials.casing, result: { id: "createdieselgenerators:mold", components: { "createdieselgenerators:mold_type": `kubejs:${ammo.casingMold}` } } })) registered++;
      if (emit(event, `molds/${ammo.key}_bullet`, { type: "minecraft:crafting_shapeless", ingredients: ammo.moldMaterials.bullet, result: { id: "createdieselgenerators:mold", components: { "createdieselgenerators:mold_type": `kubejs:${ammo.bulletMold}` } } })) registered++;
      const casingIngredients = repeatIngredient(ammo.materials.casing, ammo.economy.casingMetalUnits);
      const bulletIngredients = repeatIngredient(ammo.materials.bullet, ammo.economy.bulletMetalUnits);
      ammo.materials.bulletExtras.forEach((ingredient) => repeatIngredient(ingredient, ingredient.amount).forEach((copy) => bulletIngredients.push(copy)));
      if (emit(event, `components/${ammo.key}_casing`, { type: "createdieselgenerators:compression_molding", ingredients: casingIngredients, mold: `kubejs:${ammo.casingMold}`, results: [{ id: ammo.outputItem && ammo.outputItem.casing || ammo.casing, count: ammo.counts && ammo.counts.casing || ammo.economy && ammo.economy.sourceBatch || 1 }] })) registered++;
      if (emit(event, `components/${ammo.key}_rough_bullet`, { type: "createdieselgenerators:compression_molding", ingredients: bulletIngredients, mold: `kubejs:${ammo.bulletMold}`, results: [{ id: ammo.outputItem && ammo.outputItem.roughBullet || ammo.roughBullet, count: ammo.counts && ammo.counts.roughBullet || ammo.economy && ammo.economy.sourceBatch || 1 }] })) registered++;
      if (ammo.polishing && emit(event, `components/${ammo.key}_polishing`, { type: ammo.polishing.type, ingredients: [resolveStack(ammo.polishing.input, ammo, false)], results: [resolveStack(ammo.polishing.output, ammo, true)] })) registered++;
      if (ammo.primerRecipe && emit(event, `components/${ammo.key}_primer`, resolveRecipe(ammo.primerRecipe, ammo))) registered++;
      if (ammo.propellantRecipe && emit(event, `components/${ammo.key}_propellant`, resolveRecipe(ammo.propellantRecipe, ammo))) registered++;
      const sequence = ammo.operations.map((step) => {
        const operation = {};
        for (const field in step) operation[field] = step[field];
        operation.ingredients = step.ingredients.map((stack) => resolveStack(stack, ammo, false));
        operation.results = step.results.map((stack) => resolveStack(stack, ammo, true));
        return operation;
      });
      if (emit(event, `${base}_sequenced_assembly`, { type: "create:sequenced_assembly", ingredient: ammo.inputIngredient && ammo.inputIngredient.casing || { item: ammo.casing }, transitional_item: { id: ammo.outputItem && ammo.outputItem.transitional || ammo.transitional }, sequence: sequence, results: [{ id: ammo.final, count: ammo.economy && ammo.economy.assemblyOutputCount || 1, components: { "minecraft:custom_data": { AmmoId: ammo.ammoId } } }] })) registered++;
      log(`registered ${registered} recipes for ammo key ${ammo.key}`);
    });
  });
})();
