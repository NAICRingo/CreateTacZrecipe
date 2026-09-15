# Related Mechanomania components

Versions observed in `Mechanomania11120` on 2026-09-11:

| Role | File |
|---|---|
| TaCZ runtime | `tacz-neoforge-1.21.1-1.1.8-hotfix-r6.jar` |
| TaCZ pack conversion | `tacz-pack-upgrader-2.1.3.jar` |
| Arcana compatibility build | `Arcana1.2.9-NeoForge1.21.1-Tacz1.1.8.jar` |
| Kotlin runtime | `kotlinforforge-5.12.0-all.jar` |
| Create | `create-1.21.1-6.0.10.jar` |
| KubeJS | `kubejs-neoforge-2101.7.2-build.368.jar` |
| LootJS | `lootjs-neoforge-1.21.1-3.7.0.jar` |
| Create Deco (optional material mapping) | `createdeco-2.1.3.jar` |
| Create Diesel Generators (required for casing/projectile molding) | `createdieselgenerators-*.jar` |
| Create Prism | `createprism-1.2.2.jar` |
| Iris compile/runtime compatibility | `iris-neoforge-1.8.14-beta.1+mc1.21.1.jar` |
| Sodium compile/runtime compatibility | `sodium-neoforge-0.8.13+mc1.21.1.jar` |

TaCZ, the pack upgrader and the Arcana artifact are archived under the sibling `ArcanaNeoForge/` project because they belong to its tested runtime set. Create, KubeJS, LootJS, KotlinForForge, Iris, Sodium and the Create addons belong to the Mechanomania base instance and should normally come from the updated modpack rather than be overwritten with this snapshot.

The `references/instance-snapshot/kubejs/` directory is a reference copy of the current pack's scripts and data. It must be compared with a future Mechanomania release instead of blindly replacing the future release's KubeJS directory.
