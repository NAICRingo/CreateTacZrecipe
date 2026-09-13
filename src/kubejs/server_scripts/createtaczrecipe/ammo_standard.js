// Conventional metal cartridge definitions. The shared factory keeps this list data-only.
const standardCalibers = [
  ["22wmr", 1, 1, 2, 96, 10], ["45acp", 1, 1, 2, 30, 10], ["46x30", 1, 1, 2, 48, 12], ["57x28", 1, 1, 2, 48, 15], ["762x25", 1, 1, 2, 45, 10],
  ["357mag", 1, 1, 6, 48, 25], ["500mag", 1, 1, 10, 32, 40], ["50ae", 1, 1, 7, 36, 30], ["545x39", 1, 1, 3, 45, 13], ["556x45", 1, 1, 3, 45, 15],
  ["58x42", 1, 1, 3, 40, 15], ["68x51fury", 1, 1, 5, 40, 15], ["762x39", 1, 1, 3, 35, 15], ["30_06", 1, 1, 6, 32, 20], ["308", 1, 1, 10, 60, 30],
  ["338", 1, 1, 8, 18, 25], ["45_70", 1, 1, 7, 36, 30], ["762x54", 1, 1, 8, 60, 25], ["792x57", 1, 1, 6, 48, 20], ["50bmg", 1, 1, 20, 24, 110],
];

standardCalibers.forEach((row) => {
  const key = row[0];
  const casing = row[1];
  const roughBullet = row[2];
  const powderCount = row[3];
  const sourceBatch = row[4];
  const metalUnits = row[5];
  const lapis = { "57x28": 5, "500mag": 5, "50ae": 5, "308": 1, "338": 4, "45_70": 5, "50bmg": 12 }[key] || 0;
  const propellantExtraIngredients = lapis ? [{ item: "minecraft:lapis_lazuli", count: lapis }] : [];
  if (key === "50bmg") propellantExtraIngredients.push({ item: "minecraft:blaze_rod", count: 1 });
  global.createtaczrecipe.registerAmmo(global.createtaczrecipe.standardAmmo({
    key: key,
    ammoId: `tacz:${key}`,
    counts: { casing: sourceBatch, roughBullet: sourceBatch }, metalUnits: metalUnits,
    powderCount: powderCount,
    sourceBatch: sourceBatch,
    propellantExtraIngredients: propellantExtraIngredients,
    chargeLevel: powderCount >= 8 ? "heavy" : "standard",
  }));
});
