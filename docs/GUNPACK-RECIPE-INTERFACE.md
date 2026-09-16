# 枪包弹药配方接口

通用生成器位于 `src/kubejs/server_scripts/createtaczrecipe/00_ammo_framework.js`。22 种默认口径（含 12G）的
唯一数据源是 `src/kubejs/startup_scripts/createtaczrecipe/01_ammo_catalog.js`；物品、模具、标签和配方注册
都从该 catalog 的 key 派生。`ammo_9mm.js` 与 `ammo_standard.js` 只保留兼容说明，不再重复注册数据。

## 用户 JSON 覆盖

把固定文件 `ammo_overrides.json` 放入实例的 `config/createtaczrecipe`，重启游戏后会通过 KubeJS
安全接口 `JsonIO.read(...)` 读取。文件中的 `overrides` 每一项覆盖一个已有口径，未写字段继续使用默认值；
`additions` 可声明全新口径。
可复制仓库中的 `config/createtaczrecipe/ammo_overrides.json.example` 并去掉 `.example` 后缀：

```json
{
  "overrides": [
    {
      "key": "9mm",
      "casingMetalUnits": 6
    }
  ]
}
```

支持覆盖：`ammoId`、`casingMetalUnits`、`bulletMetalUnits`、`chargeLevel`、
`casingMaterial`、`bulletMaterial`、`bulletExtraIngredients`、
`casingMold`、`bulletMold` 和 `counts`。材料使用 `{ "item": "namespace:id" }` 或
`{ "tag": "namespace:path" }`。`counts` 可分别设置 `casing`、`roughBullet`、`polishedBullet`、
`assembly`，例如 `{ "counts": { "casing": 40 } }` 只改变弹壳产量。

每条覆盖或新增定义独立校验。未知口径、未知字段、错误类型或越界数量只跳过该条，日志记录数组下标、口径、
字段和原因。文件不存在、JSON 损坏、读取失败或根结构错误时，加载器会明确记录日志并使用全部默认
口径。新增定义在 startup 阶段读取，只有 `createtaczrecipe:` 物品 ID 会由本项目注册；其他命名空间的
中间物品必须已由对应模组注册。新增定义需要 `key`、`ammoId`、`outputItem`、`materials`、
`chargeLevel` 和 `counts`，可复制 `config/createtaczrecipe/ammo_addition_test.json.example`。

外部新增示例用独立 key `custom_test` 引用默认枪包真实存在的 `tacz:12g`，不会与默认 12G 配方 ID 冲突。
最终 `tacz:ammo` 的名称和图标由 TaCZ 根据
`minecraft:custom_data.AmmoId` 解析，框架不会复制枪包视觉资源。

## 定义字段

- `key`：弹药短名，用于生成 `createtaczrecipe:*` 配方 ID。
- `materials.casing`、`materials.bullet`：物品或标签输入，例如 `{tag: "c:plates/brass"}`。
- `counts`：`casing`、`roughBullet`、`polishedBullet` 和 `assembly` 各阶段产量。
- `sourceBatch`、`powderCount`、`metalUnits`：默认 catalog 中保存的原版枪匠台批量、火药单位和
  总金属成本，只用于平衡核对，不是 JSON 可覆盖字段，也不会单独改变实际压铸消耗。
  装药由下述公共链生产，不再为每个口径重复生成相同输出的混合配方。
  当前 Create/CDG 配方结果遵守 Minecraft 单堆上限 99；因此 22 WMR 的原始 100 发批量转换为 96 发合法批次，
  不使用未经确认的多结果堆拆分格式。
- `casingMetalUnits`、`bulletMetalUnits`：分别覆盖弹壳和弹头压铸所需的重复材料输入数。
  catalog 建立默认数据时由 `metalUnits` 近似均分；实际配方只读取这两个分配字段。CDG 1.3.15 的一条 `compression_molding` 配方最多接受
  64 个物品输入；附加弹头材料也计入这个上限。框架会在注册该口径的任何配方前检查两条压铸配方，
  超限时记录口径、配方 ID 和实际输入数，并只跳过该口径。.50 BMG 明确使用 60 份黄铜坯制作弹壳，
  50 份铜坯加 12 个青金石和 1 根烈焰棒制作弹头，输入数分别为 60 和 63。
- `chargeLevel`：保留给枪包和旧配置使用的 `light`、`standard` 或 `heavy` 分类。默认22种口径已改用
  `caliberCharge` 指定的口径专用定量装药，三级旧物品ID继续注册但不再决定默认经济。
- `bulletExtraIngredients`：口径专用弹头压铸的附加材料，使用 `{item/tag, amount}`；框架把 `amount`
  展开为重复 ingredient，避免依赖普通物品 ingredient 上无效的 `count`。
- `extraOperations`：在基础步骤与最终压合之间插入额外序列工序；不用于原版批量材料成本。
- `moldMaterials.casing`、`moldMaterials.bullet`：制作 CDG 模具的配方输入；不再由生成器写死。
- `casingMold`、`bulletMold`：CDG 模具类型；模具是 Basin 配方的专用输入，不是普通消耗材料。
- `casing`、`roughBullet`、`polishedBullet`、`primer`、`propellant`、`transitional`：中间物品。
- 以上字段可以直接改为已安装模组的物品 ID；框架会直接使用该物品，不生成转换配方。
  如果任一中间物品不存在，整个该口径定义会被跳过，并记录缺失 ID。
- `polishing`：砂纸配方输入和输出。
- `primerRecipe`：可选的口径专用底火配方。默认不生成口径专用配方，而只使用公共的
  `createtaczrecipe:components/small_arms_primer`（1份底火药剂压制为1个小型枪械底火）。
  只有定义显式提供 `primerRecipe` 时才会额外生成 `<key>_primer`。`propellantRecipe` 同样仅供显式覆盖；
  默认使用公共装药链。
- `operations`：序列组装步骤数组。当前仅允许已确认的 `create:deploying`、
  `create:pressing`、`create:cutting`、`create:filling`。每步保留定义中的额外字段（例如
  `keep_held_item`），并原样传给 Create。输入和输出可以用 `{ref: "primer"}`、
  `{ref: "transitional"}` 等引用定义字段；更换实际物品 ID 后所有工序会自动跟随。注液的第二个
  ingredient 使用 `{ "type": "neoforge:single", "fluid": "namespace:id", "amount": 250 }`；
  `amount` 是 mB，必须为正整数。
- `processPreset`：`conventional` 使用原有三次部署加最终辊压；`shotgun` 在弹丸部署后增加切割，
  再最终辊压；`custom` 完全读取 `operations`。选择 `custom` 时必须提供非空、合法的工序数组。
- `final`、`ammoId`：成品物品和 TaCZ AmmoId。成品自动写入 `minecraft:custom_data.AmmoId`。

缺字段、非法工序或重复配方 ID 会记录 `[CreateTacZrecipe]` 日志并跳过该定义/配方，不会阻止其他口径加载。

## 用途标签

本项目为默认中间物品加入以下稳定标签，外部模组可以直接把自己的物品加入这些标签：

- `createtaczrecipe:casings/empty`
- `createtaczrecipe:projectiles/rough`
- `createtaczrecipe:projectiles/polished`
- `createtaczrecipe:materials/brass_blanks`
- `createtaczrecipe:materials/copper_blanks`
- `createtaczrecipe:materials/iron_plates`
- `createtaczrecipe:materials/primers`
- `createtaczrecipe:materials/propellants`
- `createtaczrecipe:propellants/loose`
- `createtaczrecipe:propellants/light`
- `createtaczrecipe:propellants/standard`
- `createtaczrecipe:propellants/heavy`
- `createtaczrecipe:cartridges/incomplete`

原材料使用通用 `materials/*` 标签；中间产物使用
`casings/empty/<key>`、`projectiles/rough/<key>`、`projectiles/polished/<key>`、
`cartridges/incomplete/<key>` 口径标签，避免不同口径互相混用。将外部物品加入对应标签即可参与输入，
而 `casing`、`roughBullet`、`polishedBullet`、`primer`、`propellant`、`transitional` 字段仍可直接替换产物 ID。

## 公共装药链

- 1 份 `materials/propellants` 搅拌为 24 份松散推进药。
- 1份松散推进药搅拌为8份底火药剂，1份药剂压制为1个底火。
- 默认口径把剩余松散推进药批量压实为对应口径的定量装药，底火与装药总成本为原TaCZ火药的约94%至96%。
- 旧轻型、标准、重型装药配方和物品暂时保留供旧存档及枪包兼容，不再作为默认22口径的经济依据。

多件材料使用重复 ingredient 表达，因此材料不足时不会匹配。

## 默认金属坯

- 8份 `#c:nuggets/brass` 加通用金属坯模具，经CDG压铸为1份黄铜弹壳坯。
- 8份 `#c:nuggets/copper` 加同一模具，经CDG压铸为1份铜质弹头坯。
- 默认口径的弹壳/弹头成型消耗上述金属坯；坯总数等于TaCZ原配方金属锭数。
- 不使用Create Deco硬币，也不注册9粒普通压块配方。.22 WMR因96/100产量限制实际每发金属折扣约7.4%；其余默认口径为8/9，即约11.1%。

## 添加常规口径

### 已扫描枪包与独立目录

测试实例中已扫描到 `hamster`（Gunpowder Revolution）、`cib`（CIBR Guns Pack）、
`sfms`（MS-Mobius）和 `create_armorer`（Create Armorer）。可稳定按常规金属弹处理的
枪包定义位于独立启动脚本 `startup_scripts/createtaczrecipe/02_gunpack_catalog.js`，
不会改变核心 22 种口径。当前已接入 `hamster:compact_ammo`、`hamster:medium_ammo`、
`hamster:long_ammo`、`cib:32acp`、`cib:58x21`、`cib:65x50`、`cib:8x22` 和
`cib:9x39mm`；爆炸、燃烧、火箭、能量及特殊弹头变体暂不注册。由于 KubeJS 安全脚本
不能可靠枚举压缩枪包文件，定义按已确认的测试包目录维护；可用
`config/createtaczrecipe/gunpack_overrides.json` 的 `disabled` 数组停用单个 key。

默认口径维护入口是 `startup_scripts/createtaczrecipe/01_ammo_catalog.js`，不再修改
`ammo_standard.js`。新增默认口径需要同时准备固定物品、语言和模具资源；外部 JSON 的 `additions`
可新增 key，并可选择项目命名空间的动态中间物品或引用已安装模组物品。`powderCount`、`sourceBatch` 和 `metalUnits` 是来源经济的记录值；
实际压铸输入由 `casingMetalUnits` / `bulletMetalUnits` 决定，产量由 `counts` 决定。不要为同一 AmmoId
再注册第二条定义。

符合现有命名规则的新口径物品（至少注册 `createtaczrecipe:empty_<key>_casing`）会由原生创造栏
动态发现；随后按稳定的 key 排序加入该口径的弹壳模具、弹头模具、弹壳、粗制弹头、抛光弹头和
未完成弹药。模具类型必须保持 `kubejs:createtaczrecipe_<key>_casing` / `_bullet`。框架会把这些模具
从 Create Diesel Generators 自己的创造栏父级内容中移除，但不会删除物品、配方、JEI 条目或创造搜索，
它们仍显示在“机械动力 × TaCZ 配方”专属创造栏中。这样新增口径无需再维护一份 Java 口径数组。

未来特殊弹药可在 `primerRecipe`、`propellantRecipe` 或独立组件配方中使用已确认的
`create:mixing`、`create:cutting`、`create:sandpaper_polishing` 等类型；Create 6.0.10 的序列工序列表
允许 `create:deploying`、`create:pressing`、`create:cutting`、`create:filling`，其他类型会在加载时明确拒绝。

## 外部视觉资源

默认物品模型由 `ammo_items.js` 的 `.texture(...)` 引用生成。整合包作者可以使用
标准资源包覆盖机制：

- 外部定义的 `visuals.casing`、`visuals.roughBullet`、`visuals.polishedBullet`、
  `visuals.transitional` 可以填写标准纹理资源位置，如 `your_pack:item/ammo/empty_12g_casing`。
- 未填写 `visuals` 时，四种项目自有中间物品分别使用内置弹壳、粗弹头、抛光弹头和未完成弹药备用贴图。
- CDG 1.3.15 的 `CDGEvents.molds.create` 不接受贴图参数。省略 `molds` 或填写
`createtaczrecipe_external_casing` / `createtaczrecipe_external_bullet` 时使用本项目内置的两种通用模具外观。CDG 是核心成型流程的必要前置；缺少 CDG 时脚本会跳过模具和压铸兼容配方并记录日志，不能完成弹壳/弹头生产。
- 独立模具类型仍受支持；其模型路径为 `assets/kubejs/models/item/mold/<type>.json`，纹理路径通常为
  `assets/kubejs/textures/item/mold/<type>.png`，由枪包资源包提供。资源缺失只影响显示，不影响配方注册。

1. 在资源包中覆盖 `assets/createtaczrecipe/models/item/<name>.json`，改变模型父级、显示变换或纹理引用。
2. 在资源包中覆盖 `assets/kubejs/textures/item/createtaczrecipe_<name>.png`，替换默认贴图。
3. 模型纹理可以写成已安装模组的标准资源位置，例如
   `othermod:item/metal_slug`；不需要复制其他模组素材，也不需要额外加载系统。

## 装配实现参考

测试整合包中的“傀儡装配”参考对象是 `modulargolems-3.1.43.jar`，不是
Kaleidoscope。它只用于观察自定义输入、输出和中间状态的组织方式；本项目仍使用
Create 的序列组装配方，不添加 ModularGolems 依赖，也不复制其 Java 实现。
