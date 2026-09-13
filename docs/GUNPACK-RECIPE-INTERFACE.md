# 枪包弹药配方接口

通用生成器位于 `src/kubejs/server_scripts/createtaczrecipe/00_ammo_framework.js`。
口径脚本只负责声明数据并调用 `global.createtaczrecipe.registerAmmo(definition)`；9mm
示例位于同目录的 `ammo_9mm.js`，默认常规口径位于 `ammo_standard.js`。`docs/GUNPACK-RECIPE-TEMPLATE.js` 是不会实际加载的示例定义。

## 定义字段

- `key`：弹药短名，用于生成 `createtaczrecipe:*` 配方 ID。
- `materials.casing`、`materials.bullet`：物品或标签输入，例如 `{tag: "c:plates/brass"}`。
- `counts`：`casing` 和 `roughBullet` 的成型产量。
- `sourceBatch`、`powderCount`：原版枪匠台批量与火药单位，保存于 `economy` 供平衡核对。
  装药由下述公共链生产，不再为每个口径重复生成相同输出的混合配方。
  当前 Create/CDG 配方结果遵守 Minecraft 单堆上限 99；因此 22 WMR 的原始 100 发批量转换为 96 发合法批次，
  不使用未经确认的多结果堆拆分格式。
- `casingMetalUnits`、`bulletMetalUnits`：分别覆盖弹壳和弹头压铸所需的重复材料输入数。
  未填写时由 `metalUnits` 近似均分。CDG 1.3.15 的一条 `compression_molding` 配方最多接受
  64 个物品输入；附加弹头材料也计入这个上限。框架会在注册该口径的任何配方前检查两条压铸配方，
  超限时记录口径、配方 ID 和实际输入数，并只跳过该口径。.50 BMG 明确使用 60 份黄铜坯制作弹壳，
  50 份铜坯加 12 个青金石和 1 根烈焰棒制作弹头，输入数分别为 60 和 63。
- `chargeLevel`：`light`、`standard` 或 `heavy`。三档使用独立装药物品和标签，避免大口径配方
  通过共用轻装药套利；默认按 TaCZ 火药单位自动分档，9mm 为轻装药、.308 为标准装药、.50 BMG 为重装药。
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
  `createtaczrecipe:components/small_arms_primer`（1 份铁板压制为 10 个小型枪械底火）。
  只有定义显式提供 `primerRecipe` 时才会额外生成 `<key>_primer`。`propellantRecipe` 同样仅供显式覆盖；
  默认使用公共装药链。
- `operations`：序列组装步骤数组。当前仅允许已确认的 `create:deploying`、
  `create:pressing`、`create:cutting`。每步保留定义中的额外字段（例如
  `keep_held_item`），并原样传给 Create。输入和输出可以用 `{ref: "primer"}`、
  `{ref: "transitional"}` 等引用定义字段；更换实际物品 ID 后所有工序会自动跟随。
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
- 1 份松散推进药辊压为 1 份轻型定量装药。
- 4 份松散推进药压实为 1 份标准定量装药。
- 5 份标准定量装药加热压实为 1 份重型定量装药。

多件材料使用重复 ingredient 表达，因此材料不足时不会匹配。轻型用于 22 WMR、9mm、.45 ACP、
4.6x30mm、5.7x28mm、7.62x25mm；重型仅用于 .50 BMG；其余当前口径使用标准装药。

## 添加常规口径

在 `ammo_standard.js` 的数据表增加 `[key, powderCount, sourceBatch, metalUnits]`，
再调用 `standardAmmo`。`powderCount` 对应 TaCZ 默认枪匠台配方的火药消耗；`sourceBatch` 仅记录原始批量，
因为 TaCZ 并未规定 CDG 模具的单次壳体/弹头产量。不要为同一 AmmoId 再注册第二条定义。

符合现有命名规则的新口径物品（至少注册 `createtaczrecipe:empty_<key>_casing`）会由原生创造栏
动态发现；随后按稳定的 key 排序加入该口径的弹壳模具、弹头模具、弹壳、粗制弹头、抛光弹头和
未完成弹药。模具类型必须保持 `kubejs:createtaczrecipe_<key>_casing` / `_bullet`。框架会把这些模具
从 Create Diesel Generators 自己的创造栏父级内容中移除，但不会删除物品、配方、JEI 条目或创造搜索，
它们仍显示在“机械动力 × TaCZ 配方”专属创造栏中。这样新增口径无需再维护一份 Java 口径数组。

未来特殊弹药可在 `primerRecipe`、`propellantRecipe` 或独立组件配方中使用已确认的
`create:mixing`、`create:cutting`、`create:sandpaper_polishing` 等类型；序列工序列表目前只允许
`create:deploying`、`create:pressing`、`create:cutting`，未经当前 Create 版本验证的类型不会被接受。

## 外部视觉资源

默认物品模型由 `ammo_items.js` 的 `.texture(...)` 引用生成。整合包作者可以使用
标准资源包覆盖机制：

1. 在资源包中覆盖 `assets/createtaczrecipe/models/item/<name>.json`，改变模型父级、显示变换或纹理引用。
2. 在资源包中覆盖 `assets/kubejs/textures/item/createtaczrecipe_<name>.png`，替换默认贴图。
3. 模型纹理可以写成已安装模组的标准资源位置，例如
   `othermod:item/metal_slug`；不需要复制其他模组素材，也不需要额外加载系统。

## 装配实现参考

测试整合包中的“傀儡装配”参考对象是 `modulargolems-3.1.43.jar`，不是
Kaleidoscope。它只用于观察自定义输入、输出和中间状态的组织方式；本项目仍使用
Create 的序列组装配方，不添加 ModularGolems 依赖，也不复制其 Java 实现。
