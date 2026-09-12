# 枪包弹药配方接口

通用生成器位于 `src/kubejs/server_scripts/createtaczrecipe/00_ammo_framework.js`。
口径脚本只负责声明数据并调用 `global.createtaczrecipe.registerAmmo(definition)`；9mm
示例位于同目录的 `ammo_9mm.js`。`docs/GUNPACK-RECIPE-TEMPLATE.js` 是不会实际加载的示例定义。

## 定义字段

- `key`：弹药短名，用于生成 `createtaczrecipe:*` 配方 ID。
- `materials.casing`、`materials.bullet`：物品或标签输入，例如 `{tag: "c:plates/brass"}`。
- `counts`：`casing` 和 `roughBullet` 的成型产量。
- `casingMold`、`bulletMold`：CDG 模具类型；模具是 Basin 配方的专用输入，不是普通消耗材料。
- `casing`、`roughBullet`、`polishedBullet`、`primer`、`propellant`、`transitional`：中间物品。
- `polishing`：砂纸配方输入和输出。
- `primerRecipe`、`propellantRecipe`：底火和装药的完整 Create 配方对象。
- `operations`：序列组装步骤数组。当前允许 `create:deploying`、`create:pressing`、`create:cutting`、
  `create:mixing`、`create:sandpaper_polishing` 和 `createdieselgenerators:compression_molding`，
  每步包含 `ingredients` 与 `results`。
- `final`、`ammoId`：成品物品和 TaCZ AmmoId。成品自动写入 `minecraft:custom_data.AmmoId`。

缺字段、非法工序或重复配方 ID 会记录 `[CreateTacZrecipe]` 日志并跳过该定义/配方，不会阻止其他口径加载。

## 装配实现参考

测试整合包中的“傀儡装配”参考对象是 `modulargolems-3.1.43.jar`，不是
Kaleidoscope。它只用于观察自定义输入、输出和中间状态的组织方式；本项目仍使用
Create 的序列组装配方，不添加 ModularGolems 依赖，也不复制其 Java 实现。
