// Conventional metal cartridge definitions. The shared factory keeps this list data-only.
const standardCalibers = [
  ["22wmr", 2, 96, 10], ["45acp", 2, 30, 10], ["46x30", 2, 48, 12], ["57x28", 2, 48, 15], ["762x25", 2, 45, 10],
  ["357mag", 6, 48, 25], ["500mag", 10, 32, 40], ["50ae", 7, 36, 30], ["545x39", 3, 45, 13], ["556x45", 3, 45, 15],
  ["58x42", 3, 40, 15], ["68x51fury", 5, 40, 15], ["762x39", 3, 35, 15], ["30_06", 6, 32, 20], ["308", 10, 60, 30],
  ["338", 8, 18, 25], ["45_70", 7, 36, 30], ["762x54", 8, 60, 25], ["792x57", 6, 48, 20], ["50bmg", 20, 24, 110],
];

standardCalibers.forEach((row) => {
  const key = row[0];
  const powderCount = row[1];
  const sourceBatch = row[2];
  const metalUnits = row[3];
  const lapis = { "57x28": 5, "500mag": 5, "50ae": 5, "308": 1, "338": 4, "45_70": 5, "50bmg": 12 }[key] || 0;
  const bulletExtraIngredients = lapis ? [{ item: "minecraft:lapis_lazuli", amount: lapis }] : [];
  if (key === "50bmg") bulletExtraIngredients.push({ item: "minecraft:blaze_rod", amount: 1 });
  const chargeLevel = key === "50bmg" ? "heavy" : (key === "22wmr" || key === "45acp" || key === "46x30" || key === "57x28" || key === "762x25" ? "light" : "standard");
  global.createtaczrecipe.registerAmmo(global.createtaczrecipe.standardAmmo({
    key: key,
    ammoId: `tacz:${key}`,
    counts: { casing: sourceBatch, roughBullet: sourceBatch }, metalUnits: metalUnits,
    powderCount: powderCount,
    sourceBatch: sourceBatch,
    bulletExtraIngredients: bulletExtraIngredients,
    chargeLevel: chargeLevel,
    casingMetalUnits: key === "50bmg" ? 60 : undefined,
    bulletMetalUnits: key === "50bmg" ? 50 : undefined,
  }));
});
