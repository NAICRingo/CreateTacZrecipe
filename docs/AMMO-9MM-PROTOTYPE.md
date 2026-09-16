# 9mm ammunition prototype

## Test boundary

- Source instance: `C:\PCL\.minecraft\versions\Mechanomania11120`
- Isolated instance: `C:\PCL\.minecraft\versions\Mechanomania11120-CreateTacZrecipe-Test`
- Project namespace: `createtaczrecipe`
- Tested on: 2026-09-11

The source instance is not a deployment target. Release builds embed the project's
KubeJS scripts and resources in the mod JAR. `tools/Deploy-KubeJsModule.ps1` is a
development-only helper for testing unbundled script changes.

## Production chain

The current release uses a reusable Create Diesel Generators metal-blank mold,
followed by caliber-specific casing and projectile molds:

- Eight `#c:nuggets/brass` plus the common mold produce one brass casing blank.
- Eight `#c:nuggets/copper` plus the common mold produce one copper projectile blank.
- The 9mm molds convert those blanks into the caliber-specific intermediates.

The consumable chain is:

1. Compression-mold the 9mm batch of brass blanks into empty casings.
2. Compression-mold the 9mm batch of copper blanks into rough projectiles.
3. Polish each rough bullet with sandpaper.
4. Produce primer compound and small-arms primers through the shared primer chain.
5. Produce the caliber-specific 9mm measured propellant charge.
6. Run the empty casing through three deployers and one press: primer, propellant,
   polished bullet, then final crimping.
7. Output one `tacz:ammo` carrying `AmmoId: tacz:9mm`.

Create Deco is not used by the current recipe economy and is not a dependency.
Raw metal enters through the common brass/copper nugget tags. Caliber-specific
intermediate tags remain available for compatibility without allowing calibers to
consume one another's casings or projectiles.

## Initial balance

The current 50-round 9mm batch preserves the TaCZ source recipe as its economic
baseline while applying the documented automation discount:

| Material | Amount |
| --- | ---: |
| Brass casing blank | 5 |
| Copper projectile blank | 5 |
| Primer + measured-charge gunpowder equivalent | See generated catalog data |

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
2. Put the release JAR in the cloned instance's `mods` directory. For development
   only, `tools/Deploy-KubeJsModule.ps1` may deploy unbundled scripts instead.
3. Let the dependency checks stop deployment if a relevant mod version no longer matches.
4. Test startup, recipe reload and a copied world before changing the main instance.
5. Update tags or individual adapters when item IDs change; keep recipe IDs and the
   `createtaczrecipe` namespace stable whenever possible.
