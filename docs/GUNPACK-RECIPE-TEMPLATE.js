// Copy this JSON object into config/createtaczrecipe/<name>.json.
// It overrides an existing caliber only; omitted fields retain catalog defaults.
const existingCaliberOverride = {
  "key": "9mm",
  "ammoId": "tacz:9mm",
  "casingMaterial": { "tag": "createtaczrecipe:materials/brass_blanks" },
  "bulletMaterial": { "tag": "createtaczrecipe:materials/copper_blanks" },
  "casingMetalUnits": 6,
  "bulletMetalUnits": 5,
  "chargeLevel": "light",
  "casingMold": "createtaczrecipe_9mm_casing",
  "bulletMold": "createtaczrecipe_9mm_bullet",
  "counts": {
    "casing": 50,
    "roughBullet": 50,
    "polishedBullet": 1,
    "assembly": 1
  }
};
