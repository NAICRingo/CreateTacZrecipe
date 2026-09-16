# 当前测试实例枪包弹药审计

审计日期：2026-09-16。来源仅为隔离实例
`Mechanomania11120-CreateTacZrecipe-Test/tacz` 中当前启用的压缩包；未修改、解密或重新打包任何枪包。

## 启用枪包

| 枪包 | 数据命名空间 | 配方状态 |
|---|---|---|
| MS-Mobius Gunspack 1.5.2 | `sfms`、`msapl` | JSON 可读取；同时存在原始材料版和使用 `msapl` 自定义火药/晶体的另一套配方 |
| CIBR Guns Pack 0.3 | `cib` | JSON 可读取 |
| Create Armorer 1.2.0 hotfix | `create_armorer` | JSON 可读取 |
| Gunpowder Revolution 1.5.0 | `hamster` | JSON 可读取 |

本次没有发现加密或无法解析的弹药配方。部分 AmmoId 没有普通金属弹语义，或依赖枪包自定义弹药作为材料，故不自动套用常规模板。

## 当前内置的八种枪包弹药

| AmmoId | 原始配方文件 | 原始材料 → 产量 | 当前状态 |
|---|---|---|---|
| `hamster:compact_ammo` | `data/hamster/recipe/ammo/compact_ammo.json` | 铜锭10、火药2 → 64 | 已校正目录数据 |
| `hamster:medium_ammo` | `.../medium_ammo.json` | 铜锭15、火药3 → 48 | 已校正目录数据 |
| `hamster:long_ammo` | `.../long_ammo.json` | 铜锭24、火药9 → 32 | 已校正目录数据 |
| `cib:32acp` | `data/cib/recipe/ammo/32acp.json` | 铜锭10、火药2 → 50 | 已校正目录数据 |
| `cib:58x21` | `.../58x21.json` | 铁锭11、火药2 → 50 | 现有目录仍使用通用有色金属流程；材料类型不一致，暂不臆造铁制中间坯 |
| `cib:65x50` | `.../65x50.json` | 铜锭15、火药5 → 49 | 已校正目录数据 |
| `cib:8x22` | `.../8x22.json` | 铜锭1、火药1 → 50 | 来源记录已校正；现有弹壳/弹头各至少1坯的模型会实际使用2坯，待后续枪包平衡处理 |
| `cib:9x39mm` | `.../9x39mm.json` | 铜锭12、火药4 → 49 | 已校正目录数据 |

这些枪包定义与核心22种默认弹药分文件维护。枪包被移除后可通过
`gunpack_overrides.json` 停用相应 key；KubeJS 不能安全枚举本地压缩包，因此当前不会自动判断压缩包存在性。

## 其他明确可读的 AmmoId

### CIBR

- 常规或近似常规候选：`cib:18.4`（火药7、铁粒18、铁锭1 → 20）、`cib:127x108`
  （铁锭90、火药17、青金石12、烈焰棒1 → 24）。后者材料量和载荷等级特殊，暂缓。
- 特殊/重型：`cib:35mm`、`cib:80`。
- 非普通弹药：`cib:battery`；`cib:error` 没有对应普通工作台配方。

### Create Armorer

- 可继续评估的常规候选：`create_armorer:gas_pistol_ammo`（铜锭8、火药2 → 60）、
  `create_armorer:rbapb`（铜锭8、火药3 → 32）、`create_armorer:slap`
  （铜锭4、铁锭6、火药3 → 60）。
- 特殊载荷：`create_armorer:40mmhe`、`create_armorer:gernade`。
- `melee_weapon` 有 AmmoId 定义但没有普通弹药工作台配方。

### Gunpowder Revolution

- 基础霰弹：`hamster:12g_buckshot`（铜锭15、火药6、铁粒18 → 20）。
- 由基础弹药转换的特殊载荷：`12g_dart`、`12g_dragonbreath`、`12g_penny`、
  `12g_slug`，以及没有独立工作台 JSON 的 `12g_wire`。
- `compact_ammo`、`medium_ammo`、`long_ammo` 的 FMJ、HP、HV、燃烧和毒性变体均以基础弹药再加工，
  不应当被当作新的普通金属弹直接生产。
- 其他特殊弹药：`flares_ammo`、`harpoon`、`snowball_ammo`。

### MS-Mobius

- 枪包原始配方目录可读取：`sfms:12ap`、`25gl`、`300ms`、`30scp`、`408`、
  `50arms`、`50ich`、`arrow117`、`c812`、`c901`、`m995`。
- 多数配方包含铁、紫水晶、青金石或枪包自定义 `msapl:ms_gunpowder` / `ms_crystal`，并存在两套不同产量；
  在确认枪包作者期望使用哪套经济前暂不接入。
- `sfms:inf` 有 AmmoId 展示/索引但未找到对应普通工作台配方。

## 结论

当前八种内置定义中七种已按真实 JSON 校正批量、金属和火药记录；`cib:58x21` 的真实材料是铁，
与当前通用黄铜/铜中间坯模型冲突，保留为已知问题。下一批最保守的普通弹药候选是
`create_armorer:gas_pistol_ammo` 和 `create_armorer:rbapb`，但本阶段只审计，不新增覆盖。
