# 枪包弹药配方接口

通用生成器位于 `src/kubejs/server_scripts/createtaczrecipe/00_ammo_framework.js`。
口径脚本只负责声明数据并调用 `global.createtaczrecipe.registerAmmo(definition)`；9mm
示例位于同目录的 `ammo_9mm.js`，默认常规口径位于 `ammo_standard.js`。`docs/GUNPACK-RECIPE-TEMPLATE.js` 是不会实际加载的示例定义。

## 定义字段

- `key`：弹药短名，用于生成 `createtaczrecipe:*` 配方 ID。
- `materials.casing`、`materials.bullet`：物品或标签输入，例如 `{tag: "c:plates/brass"}`。
- `counts`：`casing` 和 `roughBullet` 的成型产量。
- `moldMaterials.casing`、`moldMaterials.bullet`：制作 CDG 模具的配方输入；不再由生成器写死。
- `casingMold`、`bulletMold`：CDG 模具类型；模具是 Basin 配方的专用输入，不是普通消耗材料。
- `casing`、`roughBullet`、`polishedBullet`、`primer`、`propellant`、`transitional`：中间物品。
- 以上字段可以直接改为已安装模组的物品 ID；框架会直接使用该物品，不生成转换配方。
  如果任一中间物品不存在，整个该口径定义会被跳过，并记录缺失 ID。
- `polishing`：砂纸配方输入和输出。
- `primerRecipe`、`propellantRecipe`：底火和装药的完整 Create 配方对象。
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
- `createtaczrecipe:primers/small_arms`
- `createtaczrecipe:propellants/light`
- `createtaczrecipe:cartridges/incomplete`

材料输入继续使用 `createtaczrecipe:metal_blanks/<key>/brass` 和 `/copper` 等按口径标签，
避免 9mm 与其他口径混用；`createtaczrecipe:metal_blanks/brass` 等通用标签仍保留给兼容层。
中间产物还提供通用用途标签及 `createtaczrecipe:<key>/...` 口径标签。将外部物品加入对应标签即可参与输入，
而 `casing`、`roughBullet`、`polishedBullet`、`primer`、`propellant`、`transitional` 字段仍可直接替换产物 ID。

## 添加常规口径

在 `ammo_standard.js` 的数据表增加 `[key, casingYield, bulletYield, powderCount, sourceBatch]`，
再调用 `standardAmmo`。`powderCount` 对应 TaCZ 默认枪匠台配方的火药消耗；`sourceBatch` 仅记录原始批量，
因为 TaCZ 并未规定 CDG 模具的单次壳体/弹头产量。不要为同一 AmmoId 再注册第二条定义。

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
