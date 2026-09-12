CDGEvents.molds((event) => {
  global.createtaczrecipe.caliberKeys.forEach((key) => {
    event.create(`createtaczrecipe_${key}_casing`, `${key} Casing Mold`);
    event.create(`createtaczrecipe_${key}_bullet`, `${key} Bullet Mold`);
  });
});
