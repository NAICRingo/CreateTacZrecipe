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

check(context.global.createtaczrecipe.definitions.length === 22, "external caliber did not preserve 21 defaults");
check(recipes.length === 137, `expected 137 recipes with one external caliber, got ${recipes.length}`);
check(recipes.filter((entry) => entry.id.includes("/12g_") || entry.id.includes("/12g")).length === 6, "12g must generate six recipes");
const assembly = recipes.find((entry) => entry.id === "createtaczrecipe:ammo/12g_sequenced_assembly").recipe;
check(assembly.results[0].id === "tacz:ammo", "12g final item is not tacz:ammo");
check(assembly.results[0].components["minecraft:custom_data"].AmmoId === "tacz:12g", "12g AmmoId component mismatch");
check((tags.get("createtaczrecipe:casings/empty/12g") || []).includes("createtaczrecipe:empty_12g_casing"), "12g casing tag is empty");
for (const name of ["createtaczrecipe_external_casing.png", "createtaczrecipe_external_bullet.png"]) {
  check(fs.existsSync(path.join(root, "src/kubejs/assets/kubejs/textures/item/mold", name)), `missing mold fallback ${name}`);
}
console.log("CreateTacZrecipe external ammo validation passed: 22 definitions, 137 recipes, AmmoId tacz:12g, fallback resources present.");
