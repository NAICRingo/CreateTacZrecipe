const fs = require("fs");
const path = require("path");
const child = require("child_process");

const root = path.resolve(__dirname, "..");
const jarPath = path.resolve(process.argv[2] || path.join(root, "build/libs/createtaczrecipe-0.2.0-rc1.jar"));
const fail = (message) => { console.error(`[release:FAIL] ${message}`); process.exitCode = 1; };
const check = (condition, message) => condition ? console.log(`[release:OK] ${message}`) : fail(message);

check(fs.existsSync(jarPath), `candidate JAR exists: ${jarPath}`);
if (!fs.existsSync(jarPath)) process.exit(1);
const files = new Set(child.execFileSync("jar", ["tf", jarPath], { encoding: "utf8" }).split(/\r?\n/).filter(Boolean));
const required = [
  "META-INF/neoforge.mods.toml", "kubejs.plugins.txt",
  "com/naicringo/createtaczrecipe/CreateTacZrecipe.class",
  "com/naicringo/createtaczrecipe/CreateTacZrecipeKubeJSPlugin.class",
  "kubejs_scripts/startup_scripts/createtaczrecipe/00_ammo_api.js",
  "kubejs_scripts/startup_scripts/createtaczrecipe/01_ammo_catalog.js",
  "kubejs_scripts/startup_scripts/createtaczrecipe/02_gunpack_catalog.js",
  "kubejs_scripts/startup_scripts/createtaczrecipe/ammo_items.js",
  "kubejs_scripts/startup_scripts/createtaczrecipe/molds.js",
  "kubejs_scripts/server_scripts/createtaczrecipe/00_ammo_framework.js",
  "assets/createtaczrecipe/lang/en_us.json", "assets/createtaczrecipe/lang/zh_cn.json",
];
required.forEach((entry) => check(files.has(entry), `JAR contains ${entry}`));
check(![...files].some((entry) => entry.startsWith("references/")), "JAR excludes references/");
check(![...files].some((entry) => /(^|\/)(tacz|gunpack|decompiled)(\/|$)/i.test(entry)), "JAR excludes third-party pack snapshots and decompiled trees");

const startup = fs.readFileSync(path.join(root, "src/kubejs/startup_scripts/createtaczrecipe/01_ammo_catalog.js"), "utf8");
const gunpacks = fs.readFileSync(path.join(root, "src/kubejs/startup_scripts/createtaczrecipe/02_gunpack_catalog.js"), "utf8");
const defaultKeys = [...startup.matchAll(/\["([a-z0-9_]+)",\s*\d+,\s*\d+,\s*\d+,\s*"(?:light|standard|heavy)"\]/g)].map((m) => m[1]);
const gunpackIds = [...gunpacks.matchAll(/ammoId:\s*"([^"]+)"/g)].map((m) => m[1]);
check(defaultKeys.length === 22 && new Set(defaultKeys).size === 22, "default catalog contains 22 unique calibers");
check(gunpackIds.length === 6 && new Set(gunpackIds).size === 6, "gun-pack catalog contains six unique conventional AmmoIds");
check(!gunpacks.includes('ammoId: "cib:58x21"') && !gunpacks.includes('ammoId: "cib:8x22"'), "cib:58x21 and cib:8x22 remain deferred");

const languages = ["en_us", "zh_cn"].map((locale) => JSON.parse(fs.readFileSync(path.join(root, `src/kubejs/assets/createtaczrecipe/lang/${locale}.json`), "utf8")));
const modelsDir = path.join(root, "src/kubejs/assets/createtaczrecipe/models/item");
const modelFiles = fs.readdirSync(modelsDir).filter((name) => name.endsWith(".json"));
const modelErrors = [];
for (const name of modelFiles) {
  const id = name.slice(0, -5);
  if (!languages.every((lang) => typeof lang[`item.createtaczrecipe.${id}`] === "string")) modelErrors.push(`${id}: missing language key`);
  const model = JSON.parse(fs.readFileSync(path.join(modelsDir, name), "utf8"));
  const texture = model.textures && model.textures.layer0;
  const match = /^([^:]+):(.+)$/.exec(texture || "");
  const textureFile = match && `assets/${match[1]}/textures/${match[2]}.png`;
  if (!textureFile || !files.has(textureFile)) modelErrors.push(`${id}: missing texture ${texture || "<none>"}`);
  if (!files.has(`assets/createtaczrecipe/models/item/${name}`)) modelErrors.push(`${id}: model missing from JAR`);
}
check(modelErrors.length === 0, `${modelFiles.length} item models have complete en_us/zh_cn keys and packaged textures${modelErrors.length ? ` (${modelErrors.join("; ")})` : ""}`);

const forbidden = [...files].filter((entry) => entry.endsWith(".jar") || entry.endsWith(".zip") || entry.endsWith(".class.java"));
check(forbidden.length === 0, "JAR contains no nested archives or decompiled-source artifacts");
if (!process.exitCode) console.log(`[release] validated ${files.size} JAR entries and ${modelFiles.length} item models`);
