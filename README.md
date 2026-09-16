# CreateTacZrecipe

Create-powered manufacturing recipes for TaCZ ammunition on Minecraft 1.21.1
NeoForge. The release JAR embeds its owned KubeJS startup/server scripts and all
assets, so normal installation does **not** require copying a `kubejs` directory.

## Installation

Install the matching versions of the required dependencies, then place the
CreateTacZrecipe JAR in the instance `mods` folder on both client and server.

Required runtime:

- Minecraft 1.21.1
- NeoForge 21.1.248 or later in the 21.1 line
- Create 6.0.10 or later compatible 1.21.1 build
- KubeJS 2101.7.2 build 368 or later compatible build
- TaCZ 1.1.8 or later compatible 1.21.1 build
- Create Diesel Generators 1.3.15 or later compatible build

Create Diesel Generators supplies the reusable mold item and
`compression_molding` recipe type. KubeJS loads the read-only scripts embedded in
this JAR through its official plugin entry point. Create Deco is not a dependency.
Missing required dependencies are reported by NeoForge before the mod initializes.

The legacy `tools/Deploy-KubeJsModule.ps1` command remains only for script
development and must not be used for a normal release installation. Do not install
both an external development copy of these scripts and the release JAR: doing so
would register the same content twice.

## Current content

- 22 TaCZ default ammunition definitions, including 12 Gauge.
- Six conservative conventional gun-pack adapters for the locally audited CIBR and
  Gunpowder Revolution AmmoIds.
- Reusable metal-blank molding, primers, caliber charges, projectile polishing and
  Create sequenced assembly.
- Project creative tab, English and Simplified Chinese names, original 16x16 assets,
  and JEI-visible Create/CDG recipes.
- Stable public `createtaczrecipe:*` item and recipe IDs retained from the prototype.

`cib:58x21` and `cib:8x22` are intentionally not automated because their source
packs use special low-cost economies that do not map safely to the common two-blank
chain. Explosive, incendiary, energy, rocket and other effect-bearing ammunition is
also outside the current release scope.

## Configuration and gun packs

Configuration is read at startup from:

- `config/createtaczrecipe/ammo_overrides.json`
- `config/createtaczrecipe/gunpack_overrides.json`

Examples are kept under the repository `config/createtaczrecipe/` directory. A
configuration or gun-pack catalog change requires a full game restart because it
can affect startup-time item and mold registration. Invalid entries are skipped
without removing the built-in catalog.

See [the gun-pack interface](docs/GUNPACK-RECIPE-INTERFACE.md) for the supported
fields, conventional/shotgun/custom process presets, tag integration and resource
overrides. Resource packs may replace any model, texture or language key using
standard Minecraft resource-pack precedence.

## Server and client

The mod and all required dependencies are required on both physical sides because
it registers items and recipes. Client resources provide the creative tab, models,
textures and translations; recipe and configuration logic also runs on a dedicated
server. Client-only UI classes are not loaded from the common mod initializer.

## Development and verification

Run the static checks and build with:

```powershell
node .\tools\validate-ammo-framework.js
node .\tools\validate-ammo-framework.js --without-optional
.\gradlew.bat clean build
node .\tools\validate-release.js .\build\libs\createtaczrecipe-0.2.0-rc1.jar
```

Local compatibility snapshots belong in ignored `references/`; third-party packs,
generated TaCZ resources and decompiled sources are not part of the public source or
release artifacts. See `CREDITS.md` and `LICENSE` for attribution and terms.

## Known limitations

- Balance and operation visibility still require final in-game sampling in JEI and
  a powered Create line.
- Gun-pack availability is detected through configured definitions; removing a pack
  can leave harmless hidden intermediate registry entries until a clean restart.
- The known unrelated crash when closing the game with certain JEI screens open is
  not addressed here.
- Special ammunition effects, weapon/attachment automation, quality systems and
  cross-version migration are not implemented.
