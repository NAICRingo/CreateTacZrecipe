const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const messages = [];
const files = {
  "10-valid.json": '{"key":"9mm","casingMetalUnits":6,"counts":{"casing":49}}',
  "20-broken.json": '{"key":"308","casingMetalUnits":',
  "30-invalid.json": '{"key":"50bmg","unsupportedField":1}',
  "40-over-limit.json": '{"key":"308","bulletMetalUnits":64}',
};
const paths = Object.keys(files).map((name) => ({
  name: name,
  getFileName() { return this.name; },
  toString() { return this.name; },
}));
const Files = {
  createDirectories() {},
  readString(file) { return files[file.name]; },
  newDirectoryStream() {
    let index = 0;
    return {
      iterator() { return { hasNext: () => index < paths.length, next: () => paths[index++] }; },
      close() {},
    };
  },
};
const context = vm.createContext({
  console: { log: (message) => messages.push(String(message)) },
  global: {},
  Item: { of: (id) => ({ isEmpty: () => id === "missing:item" }) },
  Java: { loadClass: (name) => {
    if (name === "java.nio.file.Files") return Files;
    if (name === "java.nio.file.Paths") return { get: () => "config/createtaczrecipe" };
    if (name === "java.nio.charset.StandardCharsets") return { UTF_8: "UTF-8" };
    throw new Error(`unexpected Java class ${name}`);
  } },
});
function load(relativePath) {
  const filename = path.join(root, relativePath);
  vm.runInContext(fs.readFileSync(filename, "utf8"), context, { filename: filename });
}
function check(condition, message) { if (!condition) throw new Error(message); }

load("src/kubejs/startup_scripts/createtaczrecipe/00_ammo_api.js");
load("src/kubejs/startup_scripts/createtaczrecipe/01_ammo_catalog.js");
load("src/kubejs/server_scripts/createtaczrecipe/ammo_definitions.js");

const definitions = context.global.createtaczrecipe.definitions;
check(definitions.length === 21, `one bad config affected other definitions: ${definitions.length}`);
const nine = definitions.find((entry) => entry.key === "9mm");
check(nine.economy.casingMetalUnits === 6, "valid 9mm material override was not applied");
check(nine.counts.casing === 49 && nine.counts.roughBullet === 50, "partial stage output override did not preserve defaults");
check(definitions.find((entry) => entry.key === "308").economy.casingMetalUnits === 15, "broken .308 file changed defaults");
check(definitions.find((entry) => entry.key === "50bmg").economy.casingMetalUnits === 60, "invalid .50 BMG file changed defaults");
check(messages.some((line) => line.includes("20-broken.json") && line.includes("308") && line.includes("<json>")), "broken JSON log lacks file, caliber, or field");
check(messages.some((line) => line.includes("30-invalid.json") && line.includes("50bmg") && line.includes("unsupportedField")), "invalid field log lacks file, caliber, or field");
check(messages.some((line) => line.includes("40-over-limit.json") && line.includes("308") && line.includes("bulletMetalUnits/bulletExtraIngredients")), "cross-field error log lacks file, caliber, or field");
console.log("CreateTacZrecipe config override validation passed: valid override applied; malformed and invalid files isolated.");
