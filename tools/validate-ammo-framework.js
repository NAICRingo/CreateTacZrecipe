const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const recipes = [];
const tags = new Map();
let recipeCallback;
let tagCallback;

const context = vm.createContext({
  console: console,
  global: {},
  Item: { of: () => ({ isEmpty: () => false }) },
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
load("src/kubejs/server_scripts/createtaczrecipe/ammo_9mm.js");
load("src/kubejs/server_scripts/createtaczrecipe/ammo_standard.js");
load("src/kubejs/server_scripts/createtaczrecipe/00_ammo_framework.js");
load("src/kubejs/server_scripts/createtaczrecipe/ammo_tags.js");

tagCallback({ add: (tag, value) => {
  if (!tags.has(tag)) tags.set(tag, []);
  tags.get(tag).push(value);
} });
recipeCallback({ custom: (recipe) => ({ id: (id) => recipes.push({ id: id, recipe: recipe }) }) });

const definitions = context.global.createtaczrecipe.definitions;
check(definitions.length === 21, `expected 21 definitions, got ${definitions.length}`);
check(new Set(definitions.map((definition) => definition.ammoId)).size === 21, "duplicate AmmoId");
check(new Set(recipes.map((entry) => entry.id)).size === recipes.length, "duplicate recipe id");

for (const definition of definitions) {
  const key = definition.key;
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
};
check(common.loose.type === "create:mixing" && common.loose.ingredients.length === 1 && common.loose.results[0].count === 24, "loose propellant recipe mismatch");
check(common.light.type === "create:pressing" && common.light.ingredients.length === 1, "light charge recipe mismatch");
check(common.standard.type === "create:compacting" && common.standard.ingredients.length === 4, "standard charge must require four repeated ingredients");
check(common.heavy.type === "create:compacting" && common.heavy.ingredients.length === 5 && common.heavy.heat_requirement === "heated", "heavy charge must require five repeated ingredients and heat");
check(recipes.filter((entry) => entry.recipe.type === "create:mixing").length === 1, "basin mixing must only produce loose propellant");
const commonPropellantIds = new Set([
  "createtaczrecipe:components/loose_propellant", "createtaczrecipe:components/light_propellant",
  "createtaczrecipe:components/standard_propellant", "createtaczrecipe:components/heavy_propellant",
]);
check(!recipes.some((entry) => /_propellant$/.test(entry.id) && !commonPropellantIds.has(entry.id)), "per-caliber propellant recipe remains");

for (const entry of recipes) {
  for (const result of entry.recipe.results || []) check(!result.count || result.count <= 99, `${entry.id} output exceeds 99`);
  for (const ingredient of entry.recipe.ingredients || []) check(ingredient.count === undefined, `${entry.id} uses unsupported ingredient count`);
}

const grades = { "9mm": "light", "308": "standard", "50bmg": "heavy" };
for (const key in grades) {
  const definition = definitions.find((value) => value.key === key);
  check(definition.inputIngredient.propellant.tag === `createtaczrecipe:propellants/${grades[key]}`, `${key} charge grade mismatch`);
}
const lightKeys = new Set(["22wmr", "9mm", "45acp", "46x30", "57x28", "762x25"]);
for (const definition of definitions) {
  const expected = definition.key === "50bmg" ? "heavy" : (lightKeys.has(definition.key) ? "light" : "standard");
  check(definition.chargeLevel === expected, `${definition.key} expected ${expected}, got ${definition.chargeLevel}`);
}
check(definitions.find((value) => value.key === "9mm").economy.chargeCapacity === 48, "9mm charge capacity mismatch");
check(definitions.find((value) => value.key === "308").economy.chargeCapacity === 60, ".308 charge capacity mismatch");
check(definitions.find((value) => value.key === "50bmg").economy.chargeCapacity === 24, ".50 BMG charge capacity mismatch");

const bullet308 = recipes.find((entry) => entry.id === "createtaczrecipe:components/308_rough_bullet").recipe;
const bullet50 = recipes.find((entry) => entry.id === "createtaczrecipe:components/50bmg_rough_bullet").recipe;
check(bullet308.ingredients.filter((ingredient) => ingredient.item === "minecraft:lapis_lazuli").length === 1, ".308 lapis must be in bullet molding");
check(bullet50.ingredients.filter((ingredient) => ingredient.item === "minecraft:lapis_lazuli").length === 12, ".50 BMG lapis must be in bullet molding");
check(bullet50.ingredients.filter((ingredient) => ingredient.item === "minecraft:blaze_rod").length === 1, ".50 BMG blaze rod must be in bullet molding");

console.log(`CreateTacZrecipe static validation passed: ${definitions.length} definitions, ${recipes.length} recipes, ${tags.size} item tags.`);
