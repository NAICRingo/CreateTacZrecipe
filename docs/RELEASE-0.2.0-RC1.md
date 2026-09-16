# CreateTacZrecipe 0.2.0-rc1

## Install

Install the required 1.21.1 NeoForge dependencies listed below on both client and
server, then place `createtaczrecipe-0.2.0-rc1.jar` in `mods`. Do not also install
an external development copy of the project's KubeJS scripts.

Required dependencies:

- NeoForge 21.1.248 or later compatible 21.1 build
- Create 6.0.10 or later compatible 1.21.1 build
- KubeJS 2101.7.2 build 368 or later compatible build
- TaCZ 1.1.8 or later compatible 1.21.1 build
- Create Diesel Generators 1.3.15 or later compatible build

## Candidate contents

- 22 default TaCZ ammunition production chains.
- Ten audited conventional gun-pack adapters.
- Bundled item and mold registration, tags, recipes, configuration readers,
  translations, item models and original textures.
- Startup configuration under `config/createtaczrecipe/` when overrides are needed.

## Known limitations

- Gun-pack catalogs and startup item/mold configuration require a full restart.
- Special-effect ammunition, quality effects, weapon/attachment automation and
  cross-version migration are outside this candidate.
- `cib:58x21` and `cib:8x22` remain intentionally deferred because their source
  packs use special low-cost economies.
- A pre-existing unrelated crash when closing with certain JEI screens open is not
  addressed by this release.

## Minimum manual test

1. Start a client with only the candidate JAR supplying CreateTacZrecipe content.
2. Confirm the dedicated creative tab has project parts and molds, without duplicate
   project molds in the Create Diesel Generators tab.
3. Inspect metal blank molding, primer compound, caliber charges and 9mm, .308,
   .50 BMG and 12 Gauge assembly in JEI.
4. Run one conventional and the 12 Gauge production chains; verify AmmoId, loading
   and firing in a matching TaCZ weapon.
5. Confirm a resource-pack model/texture override and one JSON override after a full
   restart if those extension points are part of the pack deployment.
