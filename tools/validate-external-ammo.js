const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const config = JSON.parse(fs.readFileSync(path.join(root, "config/createtaczrecipe/ammo_addition_test.json.example"), "utf8"));
const recipes = [];
const tags = new Map();
let recipeCallback;
let tagCallback;
const context = vm.createContext({
  console: console,
  global: {},
  JsonIO: { read: () => config },
  Item: { of: () => ({ isEmpty: () => false }) },
  ServerEvents: {
    recipes: (callback) => { recipeCallback = callback; },
    tags: (type, callback) => { if (type === "item") tagCallback = callback; },
  },
});
const load = (relative) => vm.runInContext(fs.readFileSync(path.join(root, relative), "utf8"), context, { filename: relative });
const check = (condition, message) => { if (!condition) throw new Error(message); };

load("src/kubejs/startup_scripts/createtaczrecipe/00_ammo_api.js");
load("src/kubejs/startup_scripts/createtaczrecipe/01_ammo_catalog.js");
load("src/kubejs/server_scripts/createtaczrecipe/ammo_definitions.js");
load("src/kubejs/server_scripts/createtaczrecipe/00_ammo_framework.js");
load("src/kubejs/server_scripts/createtaczrecipe/ammo_tags.js");
tagCallback({ add: (tag, value) => { if (!tags.has(tag)) tags.set(tag, []); tags.get(tag).push(value); } });
recipeCallback({ custom: (recipe) => ({ id: (id) => recipes.push({ id: id, recipe: recipe }) }) });

check(context.global.createtaczrecipe.definitions.length === 23, "external caliber did not preserve 22 defaults");
check(recipes.length === 143, `expected 143 recipes with one external caliber, got ${recipes.length}`);
check(recipes.filter((entry) => entry.id.includes("/custom_test_") || entry.id.includes("/custom_test")).length === 6, "custom_test must generate six recipes");
const assembly = recipes.find((entry) => entry.id === "createtaczrecipe:ammo/custom_test_sequenced_assembly").recipe;
check(assembly.results[0].id === "tacz:ammo", "custom_test final item is not tacz:ammo");
check(assembly.results[0].components["minecraft:custom_data"].AmmoId === "tacz:12g", "custom_test AmmoId component mismatch");
check((tags.get("createtaczrecipe:casings/empty/custom_test") || []).includes("createtaczrecipe:empty_custom_test_casing"), "custom_test casing tag is empty");
check(assembly.sequence.map((step) => step.type).join(",") === "create:deploying,create:deploying,create:filling,create:cutting,create:deploying,create:deploying,create:pressing", "custom sequence order mismatch");
check(assembly.sequence[1].keep_held_item === true, "custom keep_held_item was not preserved");
check(assembly.sequence[2].ingredients[1].type === "neoforge:single" && assembly.sequence[2].ingredients[1].fluid === "minecraft:water" && assembly.sequence[2].ingredients[1].amount === 250, "custom filling ingredient mismatch");
for (const name of ["createtaczrecipe_external_casing.png", "createtaczrecipe_external_bullet.png"]) {
  check(fs.existsSync(path.join(root, "src/kubejs/assets/kubejs/textures/item/mold", name)), `missing mold fallback ${name}`);
}
console.log("CreateTacZrecipe external ammo validation passed: 23 definitions, 143 recipes, custom sequence and fallback resources present.");
