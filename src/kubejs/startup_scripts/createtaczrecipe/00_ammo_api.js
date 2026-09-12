// KubeJS only permits assigning global values during startup scripts.
global.createtaczrecipe = {
  definitions: [],
  registerAmmo: (definition) => {
    global.createtaczrecipe.definitions.push(definition);
    const key = definition && definition.key ? definition.key : "<missing key>";
    console.log(`[CreateTacZrecipe] received ammo definition: ${key}`);
  },
};
