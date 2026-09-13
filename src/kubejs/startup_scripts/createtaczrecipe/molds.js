CDGEvents.molds((event) => {
  global.createtaczrecipe.caliberKeys.forEach((key) => {
    const name = global.createtaczrecipe.caliberDisplayNames[key];
    event.create(`createtaczrecipe_${key}_casing`, `${name} Casing Mold`);
    event.create(`createtaczrecipe_${key}_bullet`, `${name} Projectile Mold`);
  });
});
