# CreateTacZrecipe

TaCZ integration and automation project for Mechanomania, using The Legend Of 2900 as a behavioral and recipe reference.

## Scope

- Define which TaCZ and gunpack weapons are available.
- Adjust weapon, ammunition and progression values where required.
- Recreate multi-stage weapon and ammunition recipes with the interfaces available in Mechanomania.
- Implement Create-based processing and automation through KubeJS/data recipes where practical.
- Keep Arcana compatibility work isolated in the sibling `ArcanaNeoForge/` project.

## Current state

The first isolated prototype implements a 9mm component chain and Create sequenced assembly under `src/kubejs/`. It is deployed only to the cloned `Mechanomania11120-CreateTacZrecipe-Test` instance. The original TaCZ gunsmith recipe remains available.

Deploy the owned module files with:

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\Deploy-KubeJsModule.ps1
```

`references/` is a read-only working snapshot of the current Mechanomania KubeJS data, TaCZ-generated files and four gunpacks. Compare against this material when implementing new scripts; do not replace a future modpack's KubeJS directory wholesale.

See `docs/AUTOMATION-PLAN.md` for the current feasibility assessment and
`docs/AMMO-9MM-PROTOTYPE.md` for the implemented recipe chain, balance and test record.

The consolidated development scope, quality-ammo design and update strategy are in
`docs/DEVELOPMENT-SPEC.md`.

Use `docs/PROJECT-DEVELOPMENT-PROMPT.md` as the starting prompt in the project
development conversation. It keeps implementation scope open and requires a pause
for unresolved design decisions.

For adding another gunpack without rewriting the processing chain, use
`docs/GUNPACK-RECIPE-INTERFACE.md` and `docs/GUNPACK-RECIPE-TEMPLATE.js`.

Runtime dependencies are Minecraft 1.21.1, NeoForge 21.1.248, Create 6.0.10,
KubeJS 2101.7.2, TaCZ 1.1.8 and Create Diesel Generators 1.3.15. CDG supplies the
actual mold item and `compression_molding` recipe type used by the casing and
projectile stages, so the complete production flow cannot run without it. The
scripts still guard its API and log skipped compatibility content if a broken or
partial installation is encountered. Create Deco is optional and no longer changes
default recipe costs. Default metal blanks use `c:nuggets/brass` and
`c:nuggets/copper`: eight nuggets plus the reusable CDG metal-blank mold produce
one project-owned blank. Primers and caliber-specific charges share the original
TaCZ powder budget; legacy light/standard/heavy charge IDs remain registered for
save and gunpack compatibility.

The current isolated test profile also includes the separate
`02_gunpack_catalog.js` source. It adds six clearly conventional ammunition
found in the enabled CIBR and Gunpowder Revolution packs; explosive, incendiary,
rocket, energy and special-payload AmmoIds remain intentionally unregistered.
The deliberately low-cost `cib:58x21` and `cib:8x22` economies are also deferred
rather than forced through the generic two-blank production model.
Gunpack definitions use project-owned intermediate items and the same six-step
Create/CDG chain as the core catalog. To disable an individual profile without
touching the core 22 calibers, create `config/createtaczrecipe/gunpack_overrides.json`
with a `disabled` array containing its key (for example `cib_32acp`). The
definitions are kept in a separate startup file so removing a gunpack does not
remove or alter the core catalog.
