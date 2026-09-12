// Conventional metal cartridge definitions. The shared factory keeps this list data-only.
const standardCalibers = [
  ["22wmr", 1, 2, 2, 100], ["45acp", 1, 2, 2, 30], ["46x30", 1, 2, 2, 48], ["57x28", 1, 2, 2, 48], ["762x25", 1, 2, 2, 45],
  ["357mag", 1, 1, 6, 48], ["500mag", 1, 1, 10, 32], ["50ae", 1, 1, 7, 36], ["545x39", 1, 1, 3, 45], ["556x45", 1, 1, 3, 45],
  ["58x42", 1, 1, 3, 40], ["68x51fury", 1, 1, 5, 40], ["762x39", 1, 1, 3, 35], ["30_06", 1, 1, 6, 32], ["308", 1, 1, 10, 60],
  ["338", 1, 1, 8, 18], ["45_70", 1, 1, 7, 36], ["762x54", 1, 1, 8, 60], ["792x57", 1, 1, 6, 48], ["50bmg", 1, 1, 20, 24],
];

standardCalibers.forEach((row) => {
  const key = row[0];
  const casing = row[1];
  const roughBullet = row[2];
  const powderCount = row[3];
  const sourceBatch = row[4];
  const lapis = { "57x28": 5, "500mag": 5, "50ae": 5, "308": 1, "338": 4, "45_70": 5, "50bmg": 12 }[key] || 0;
  const extraOperations = lapis ? [{ type: "create:deploying", ingredients: [{ ref: "transitional" }, { item: "minecraft:lapis_lazuli", count: lapis }], results: [{ ref: "transitional" }] }] : [];
  if (key === "50bmg") extraOperations.push({ type: "create:deploying", ingredients: [{ ref: "transitional" }, { item: "minecraft:blaze_rod" }], results: [{ ref: "transitional" }] });
  global.createtaczrecipe.registerAmmo(global.createtaczrecipe.standardAmmo({
    key: key,
    ammoId: `tacz:${key}`,
    counts: { casing: casing, roughBullet: roughBullet },
    powderCount: powderCount,
    sourceBatch: sourceBatch,
    extraOperations: extraOperations,
    casingMaterialTag: `createtaczrecipe:metal_blanks/${key}/brass`,
    bulletMaterialTag: `createtaczrecipe:metal_blanks/${key}/copper`,
  }));
});
