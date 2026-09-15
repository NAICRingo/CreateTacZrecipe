if (typeof CDGEvents !== "undefined") CDGEvents.molds((event) => {
  global.createtaczrecipe.defaultCaliberKeys.forEach((key) => {
    const name = global.createtaczrecipe.caliberDisplayNames[key];
    event.create(`createtaczrecipe_${key}_casing`, `${name} Casing Mold`);
    event.create(`createtaczrecipe_${key}_bullet`, `${name} Projectile Mold`);
  });
  event.create("createtaczrecipe_external_casing", "External Caliber Casing Mold");
  event.create("createtaczrecipe_external_bullet", "External Caliber Projectile Mold");
  (global.createtaczrecipe.externalAmmo || []).forEach((ammo) => {
    if (ammo.casingMold !== "createtaczrecipe_external_casing") event.create(ammo.casingMold, `${ammo.displayName} Casing Mold`);
    if (ammo.bulletMold !== "createtaczrecipe_external_bullet") event.create(ammo.bulletMold, `${ammo.displayName} Projectile Mold`);
  });
});
