const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const lang = JSON.parse(fs.readFileSync(path.join(root, "src/kubejs/assets/createtaczrecipe/lang/en_us.json"), "utf8"));
const output = path.join(root, "src/kubejs/assets/createtaczrecipe/models/item");
fs.mkdirSync(output, { recursive: true });

const textureFor = (id) => {
  if (id === "small_arms_primer" || id === "primer_compound" || id === "brass_casing_blank" ||
      id === "copper_projectile_blank" || id === "loose_propellant" ||
      id === "light_propellant_charge" || id === "standard_propellant_charge" || id === "heavy_propellant_charge") {
    return `createtaczrecipe:item/${id}`;
  }
  if (id.endsWith("_propellant_charge")) return `createtaczrecipe:item/propellant_charge/${id.slice(0, -"_propellant_charge".length)}`;
  if (id.startsWith("empty_") && id.endsWith("_casing")) return "createtaczrecipe:item/empty_casing";
  if (id.startsWith("rough_") && id.endsWith("_bullet")) return "createtaczrecipe:item/rough_projectile";
  if (id.startsWith("polished_") && id.endsWith("_bullet")) return "createtaczrecipe:item/polished_projectile";
  if (id.startsWith("incomplete_") && id.endsWith("_round")) return "createtaczrecipe:item/incomplete_cartridge";
  throw new Error(`No release texture mapping for item ${id}`);
};

const itemIds = Object.keys(lang)
  .filter((key) => key.startsWith("item.createtaczrecipe."))
  .map((key) => key.substring("item.createtaczrecipe.".length))
  .sort();

for (const id of itemIds) {
  const model = { parent: "minecraft:item/generated", textures: { layer0: textureFor(id) } };
  fs.writeFileSync(path.join(output, `${id}.json`), `${JSON.stringify(model, null, 2)}\n`);
}
console.log(`Generated ${itemIds.length} release item models.`);
