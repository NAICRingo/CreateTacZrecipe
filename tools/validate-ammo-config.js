const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
function check(condition, message) { if (!condition) throw new Error(message); }
function runScenario(read) {
  const messages = [];
  const context = vm.createContext({
    console: { log: (message) => messages.push(String(message)) },
    global: {},
    JsonIO: { read: read },
    Item: { of: (id) => ({ isEmpty: () => id === "missing:item" }) },
  });
  for (const relativePath of [
    "src/kubejs/startup_scripts/createtaczrecipe/00_ammo_api.js",
    "src/kubejs/startup_scripts/createtaczrecipe/01_ammo_catalog.js",
    "src/kubejs/server_scripts/createtaczrecipe/ammo_definitions.js",
  ]) {
    const filename = path.join(root, relativePath);
    vm.runInContext(fs.readFileSync(filename, "utf8"), context, { filename: filename });
  }
  return { definitions: context.global.createtaczrecipe.definitions, messages: messages };
}

const missing = runScenario(() => null);
check(missing.definitions.length === 21, "missing config did not preserve all defaults");
check(missing.definitions.find((entry) => entry.key === "9mm").economy.casingMetalUnits === 5, "missing config changed 9mm default");

const valid = runScenario(() => ({ overrides: [
  { key: "9mm", casingMetalUnits: 6, counts: { casing: 49 } },
  { key: "50bmg", unsupportedField: 1 },
  { key: "308", bulletMetalUnits: 64 },
] }));
check(valid.definitions.length === 21, `invalid entries affected other definitions: ${valid.definitions.length}`);
const nine = valid.definitions.find((entry) => entry.key === "9mm");
check(nine.economy.casingMetalUnits === 6, "valid 9mm material override was not applied");
check(nine.counts.casing === 49 && nine.counts.roughBullet === 50, "partial stage output override did not preserve defaults");
check(valid.definitions.find((entry) => entry.key === "50bmg").economy.casingMetalUnits === 60, "invalid .50 BMG entry changed defaults");
check(valid.definitions.find((entry) => entry.key === "308").economy.bulletMetalUnits === 15, "over-limit .308 entry changed defaults");
check(valid.messages.some((line) => line.includes("overrides[1]") && line.includes("50bmg") && line.includes("unsupportedField")), "invalid field log lacks entry, caliber, or field");
check(valid.messages.some((line) => line.includes("overrides[2]") && line.includes("308") && line.includes("bulletMetalUnits/bulletExtraIngredients")), "cross-field log lacks entry, caliber, or field");

const damaged = runScenario(() => { throw new Error("malformed JSON"); });
check(damaged.definitions.length === 21, "damaged config did not preserve all defaults");
check(damaged.messages.some((line) => line.includes("ammo_overrides.json") && line.includes("using all defaults") && line.includes("malformed JSON")), "damaged config fallback log is unclear");

console.log("CreateTacZrecipe JsonIO config validation passed: missing/damaged files preserve defaults; valid and invalid entries are isolated.");
