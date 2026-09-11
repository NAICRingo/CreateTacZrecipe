# 9mm ammunition prototype

## Test boundary

- Source instance: `C:\PCL\.minecraft\versions\Mechanomania11120`
- Isolated instance: `C:\PCL\.minecraft\versions\Mechanomania11120-LO2900R-Test`
- Project namespace: `lo2900r`
- Tested on: 2026-09-11

The source instance is not a deployment target. `tools/Deploy-KubeJsModule.ps1`
defaults to the isolated instance and copies only files owned by this module.

## Production chain

Two reusable Create Diesel Generators molds are introduced:

- 9mm casing mold: iron plate plus Create Deco brass coin.
- 9mm bullet mold: iron plate plus Create Deco copper coin.

The consumable chain is:

1. Compression-mold one brass blank into one empty casing.
2. Compression-mold one copper blank into two rough bullets.
3. Polish each rough bullet with sandpaper.
4. Press one iron nugget into ten small-arms primers.
5. Mix one gunpowder into 25 light propellant charges.
6. Run the empty casing through three deployers and one press: primer, propellant,
   polished bullet, then final crimping.
7. Output one `tacz:ammo` carrying `AmmoId: tacz:9mm`.

The current metal-blank tags point to Create Deco coins. They are deliberately
abstracted behind `lo2900r:metal_blanks/*`, so a later pack update can replace the
coin input with another blank or stamped part without rewriting every recipe.
`ultramarine:copper_cash_coin` is not used because it is active merchant currency.

## Initial balance

For 50 completed rounds, the production line consumes:

| Material | Amount |
| --- | ---: |
| Brass coin / nugget blank | 50 |
| Copper coin / nugget blank | 25 |
| Iron nugget | 5 |
| Gunpowder | 2 |

The intermediates solve Create's one-item-per-deployer-step behavior while still
allowing primer and propellant recipes to produce practical batches. The original
TaCZ workbench recipe is intentionally retained for manual production and later
balance comparison.

## Automated verification

The isolated instance was launched directly into a cloned `test` world. KubeJS
reported all startup and server scripts loaded with zero errors and zero warnings.
Recipe processing reported zero failed recipes, the world opened successfully, and
all dimensions were saved during a normal shutdown.

This verifies registration and loading, not the physical production line. The next
gameplay test must still confirm:

- Both molds render and are selectable in JEI.
- Compression molding produces the intended casing and bullet intermediates.
- Belt sequencing consumes exactly one of each component per round.
- The output stacks with existing TaCZ 9mm and can be loaded and fired.
- The production rate and material cost remain reasonable beside manual crafting.

## Updating Mechanomania

1. Clone the updated instance before testing.
2. Run `tools/Deploy-KubeJsModule.ps1 -InstancePath <cloned-instance-path>`.
3. Let the dependency checks stop deployment if a relevant mod version no longer matches.
4. Test startup, recipe reload and a copied world before changing the main instance.
5. Update tags or individual adapters when item IDs change; keep recipe IDs and the
   `lo2900r` namespace stable whenever possible.
