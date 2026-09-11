# TaCZ automation plan

## Feasible with the current Mechanomania stack

- Shaped and shapeless crafting changes through KubeJS.
- Create processing recipes such as cutting, pressing, deploying, mixing, filling and sequenced assembly.
- Explicit production chains for the TaCZ default ammunition and Create Armorer custom ammunition.
- Recipe removal/replacement and progression gating for selected guns.
- Loot and quest integration using the installed LootJS and FTB Quests facilities where applicable.
- Gunpack data edits for availability and numerical balance, provided the affected pack format remains compatible with TaCZ 1.1.8.

## Requires custom code or a reduced design

- An exact reproduction of Kinetic Pixel's dedicated blueprint/workbench interface and large blueprint inventory.
- Generic runtime generation that preserves arbitrary future gunpack ammunition data without explicit recipe definitions.
- Loader-specific integrations that depend on missing 1.20.1 Forge mods.

## Create: Sentry Mechanical Arm

This mod is relevant to ammunition production and automated supply. Its public implementation demonstrates TaCZ `AmmoId` propagation, Create sequenced assembly, ammunition-box filling and an automated gun-bearing mechanical arm.

It is not a direct dependency for the current project: published builds target Minecraft 1.20.1 Forge, while Mechanomania uses Minecraft 1.21.1 NeoForge. Its recipe concepts can be implemented first with KubeJS. A full sentry port should remain an optional, separate module after the core recipes are stable.

## First implementation milestone

1. [ ] Inventory every currently enabled gun and ammunition identifier.
2. [ ] Select the allowed weapon set and progression tiers.
3. [ ] Define explicit material costs for the TaCZ default and Create Armorer ammunition.
4. [x] Implement the first 9mm chain in the isolated `createtaczrecipe` KubeJS namespace.
5. [x] Verify startup, recipe reload and world loading in the cloned test instance.
6. [ ] Verify the complete 9mm production line and resulting ammunition in normal gameplay.
7. [ ] Add gun assembly recipes only after ammunition production passes the gameplay test.

The 9mm implementation and its current test boundary are recorded in
`AMMO-9MM-PROTOTYPE.md`.
