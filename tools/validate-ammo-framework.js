const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const recipes = [];
const withoutOptional = process.env.NO_OPTIONAL === "1";
const tags = new Map();
let recipeCallback;
let tagCallback;

const context = vm.createContext({
  console: console,
  global: {},
  JsonIO: { read: () => null },
  Item: { of: (id) => ({ isEmpty: () => withoutOptional && /^createdeco:/.test(id) }) },
  CDGEvents: withoutOptional ? undefined : { molds: () => {} },
  ServerEvents: {
    recipes: (callback) => { recipeCallback = callback; },
    tags: (type, callback) => { if (type === "item") tagCallback = callback; },
  },
});

function load(relativePath) {
  const filename = path.join(root, relativePath);
  vm.runInContext(fs.readFileSync(filename, "utf8"), context, { filename: filename });
}

function check(condition, message) {
  if (!condition) throw new Error(message);
}

load("src/kubejs/startup_scripts/createtaczrecipe/00_ammo_api.js");
load("src/kubejs/startup_scripts/createtaczrecipe/01_ammo_catalog.js");
load("src/kubejs/startup_scripts/createtaczrecipe/02_gunpack_catalog.js");
load("src/kubejs/server_scripts/createtaczrecipe/ammo_9mm.js");
load("src/kubejs/server_scripts/createtaczrecipe/ammo_standard.js");
load("src/kubejs/server_scripts/createtaczrecipe/ammo_definitions.js");
load("src/kubejs/server_scripts/createtaczrecipe/00_ammo_framework.js");
load("src/kubejs/server_scripts/createtaczrecipe/ammo_tags.js");

tagCallback({ add: (tag, value) => {
  if (!tags.has(tag)) tags.set(tag, []);
  tags.get(tag).push(value);
} });
recipeCallback({ custom: (recipe) => ({ id: (id) => recipes.push({ id: id, recipe: recipe }) }) });

const definitions = context.global.createtaczrecipe.definitions;
check(definitions.length === 30, `expected 30 definitions (22 core + 8 gunpack), got ${definitions.length}`);
check(recipes.length === (withoutOptional ? 65 : 185), `unexpected recipe count for optional dependency mode: ${recipes.length}`);
check(new Set(definitions.map((definition) => definition.ammoId)).size === 30, "duplicate AmmoId");
check(new Set(recipes.map((entry) => entry.id)).size === recipes.length, "duplicate recipe id");

for (const definition of definitions) {
  const key = definition.key;
  check(recipes.filter((entry) => entry.id.startsWith(`createtaczrecipe:molds/${key}_`) || entry.id.startsWith(`createtaczrecipe:components/${key}_`) || entry.id === `createtaczrecipe:ammo/${key}_sequenced_assembly`).length === 6, `${key} must register exactly six caliber-specific recipes`);
  for (const tag of [`createtaczrecipe:casings/empty/${key}`, `createtaczrecipe:projectiles/rough/${key}`, `createtaczrecipe:projectiles/polished/${key}`, `createtaczrecipe:cartridges/incomplete/${key}`]) {
    const values = tags.get(tag) || [];
    check(values.length === 1, `${tag} must contain exactly one default item`);
    check(values[0].includes(key), `${tag} contains another caliber: ${values[0]}`);
  }
  const assembly = recipes.find((entry) => entry.id === `createtaczrecipe:ammo/${key}_sequenced_assembly`).recipe;
  check(assembly.ingredient.tag === `createtaczrecipe:casings/empty/${key}`, `${key} casing tag mismatch`);
  check(assembly.results[0].components["minecraft:custom_data"].AmmoId === definition.ammoId, `${key} AmmoId mismatch`);
}

const common = {
  loose: recipes.find((entry) => entry.id === "createtaczrecipe:components/loose_propellant").recipe,
  light: recipes.find((entry) => entry.id === "createtaczrecipe:components/light_propellant").recipe,
  standard: recipes.find((entry) => entry.id === "createtaczrecipe:components/standard_propellant").recipe,
  heavy: recipes.find((entry) => entry.id === "createtaczrecipe:components/heavy_propellant").recipe,
  primer: recipes.find((entry) => entry.id === "createtaczrecipe:components/small_arms_primer").recipe,
};
check(common.loose.type === "create:mixing" && common.loose.ingredients.length === 1 && common.loose.results[0].count === 24, "loose propellant recipe mismatch");
check(common.light.type === "create:pressing" && common.light.ingredients.length === 1, "light charge recipe mismatch");
check(common.standard.type === "create:compacting" && common.standard.ingredients.length === 4, "standard charge must require four repeated ingredients");
check(common.heavy.type === "create:compacting" && common.heavy.ingredients.length === 5 && common.heavy.heat_requirement === "heated", "heavy charge must require five repeated ingredients and heat");
check(common.primer.type === "create:pressing" && common.primer.ingredients.length === 1 && common.primer.results[0].count === 10, "shared primer recipe mismatch");
check(recipes.filter((entry) => entry.id.endsWith("_primer")).length === 1, "default primer recipe must be registered exactly once");
check(recipes.filter((entry) => entry.recipe.type === "create:mixing").length === 1, "basin mixing must only produce loose propellant");
const commonPropellantIds = new Set([
  "createtaczrecipe:components/loose_propellant", "createtaczrecipe:components/light_propellant",
  "createtaczrecipe:components/standard_propellant", "createtaczrecipe:components/heavy_propellant",
]);
check(!recipes.some((entry) => /_propellant$/.test(entry.id) && !commonPropellantIds.has(entry.id)), "per-caliber propellant recipe remains");

for (const entry of recipes) {
  for (const result of entry.recipe.results || []) check(!result.count || result.count <= 99, `${entry.id} output exceeds 99`);
  for (const ingredient of entry.recipe.ingredients || []) check(ingredient.count === undefined, `${entry.id} uses unsupported ingredient count`);
  if (entry.recipe.type === "createdieselgenerators:compression_molding") {
    check(entry.recipe.ingredients.length <= 64, `${entry.id} has ${entry.recipe.ingredients.length} compression molding inputs; maximum is 64`);
  }
}

const grades = { "9mm": "light", "308": "standard", "50bmg": "heavy" };
for (const key in grades) {
  const definition = definitions.find((value) => value.key === key);
  check(definition.inputIngredient.propellant.tag === `createtaczrecipe:propellants/${grades[key]}`, `${key} charge grade mismatch`);
}
const lightKeys = new Set(["22wmr", "9mm", "45acp", "46x30", "57x28", "762x25"]);
for (const definition of definitions) {
  if (definition.gunpack) continue;
  const expected = definition.key === "50bmg" ? "heavy" : (lightKeys.has(definition.key) ? "light" : "standard");
  check(definition.chargeLevel === expected, `${definition.key} expected ${expected}, got ${definition.chargeLevel}`);
}
check(definitions.find((value) => value.key === "9mm").economy.chargeCapacity === 48, "9mm charge capacity mismatch");
check(definitions.find((value) => value.key === "308").economy.chargeCapacity === 60, ".308 charge capacity mismatch");
check(definitions.find((value) => value.key === "50bmg").economy.chargeCapacity === 24, ".50 BMG charge capacity mismatch");

const bullet308 = recipes.find((entry) => entry.id === "createtaczrecipe:components/308_rough_bullet").recipe;
const bullet50 = recipes.find((entry) => entry.id === "createtaczrecipe:components/50bmg_rough_bullet").recipe;
const casing50 = recipes.find((entry) => entry.id === "createtaczrecipe:components/50bmg_casing").recipe;
check(bullet308.ingredients.filter((ingredient) => ingredient.item === "minecraft:lapis_lazuli").length === 1, ".308 lapis must be in bullet molding");
check(bullet50.ingredients.filter((ingredient) => ingredient.item === "minecraft:lapis_lazuli").length === 12, ".50 BMG lapis must be in bullet molding");
check(bullet50.ingredients.filter((ingredient) => ingredient.item === "minecraft:blaze_rod").length === 1, ".50 BMG blaze rod must be in bullet molding");
check(casing50.ingredients.length === 60, `.50 BMG casing molding must have 60 inputs, got ${casing50.ingredients.length}`);
check(bullet50.ingredients.length === 63, `.50 BMG bullet molding must have 63 inputs, got ${bullet50.ingredients.length}`);

const ammo9mm = definitions.find((value) => value.key === "9mm");
const ammo12g = definitions.find((value) => value.key === "12g");
check(ammo9mm.processPreset === "conventional" && ammo9mm.operations.length === 4, "9mm conventional sequence changed");
check(ammo12g.processPreset === "shotgun" && ammo12g.ammoId === "tacz:12g", "12G preset or AmmoId mismatch");
check(ammo12g.operations.map((step) => step.type).join(",") === "create:deploying,create:deploying,create:deploying,create:cutting,create:pressing", "12G shotgun operation order mismatch");
const casing12g = recipes.find((entry) => entry.id === "createtaczrecipe:components/12g_casing").recipe;
const bullet12g = recipes.find((entry) => entry.id === "createtaczrecipe:components/12g_rough_bullet").recipe;
check(casing12g.ingredients.length === 9 && casing12g.results[0].count === 18, "12G casing balance mismatch");
check(bullet12g.ingredients.length === 24 && bullet12g.results[0].count === 18, "12G projectile balance mismatch");
check(bullet12g.ingredients.filter((ingredient) => ingredient.tag === "c:nuggets/iron").length === 18, "12G iron input mismatch");

for (const key of ["hamster_compact_ammo", "hamster_medium_ammo", "hamster_long_ammo", "cib_32acp", "cib_58x21", "cib_65x50", "cib_8x22", "cib_9x39mm"]) {
  const definition = definitions.find((value) => value.key === key);
  check(definition && definition.dynamic && definition.gunpack, `${key} gunpack definition missing`);
  check(recipes.filter((entry) => entry.id.startsWith(`createtaczrecipe:molds/${key}_`) || entry.id.startsWith(`createtaczrecipe:components/${key}_`) || entry.id === `createtaczrecipe:ammo/${key}_sequenced_assembly`).length === 6, `${key} must register six gunpack recipes`);
}

console.log(`CreateTacZrecipe static validation passed: ${definitions.length} definitions, ${recipes.length} recipes, ${tags.size} item tags.`);
