# 枪包配方接口

`src/kubejs/server_scripts/createtaczrecipe/ammo_9mm.js` 顶部的 `ammo` 对象是新增枪包
弹药的统一入口。复制一份对象，修改其中的 ID、材料标签和 `ammoId`，再为它
补充同样的注册调用即可，不需要重写序列组装步骤。

## 字段

| 字段 | 用途 |
| --- | --- |
| `key` | 配方路径的短名，例如 `45acp`、`12g` |
| `casingMold` / `bulletMold` | Create Diesel Generators 模具类型 |
| `casing` | 空弹壳物品 ID |
| `roughBullet` / `polishedBullet` | 粗制、抛光弹头 ID |
| `primer` / `propellant` | 底火和定量装药 ID |
| `transitional` | 序列组装过程中的中间物品 ID |
| `final` | 成品物品，通常是 `tacz:ammo` |
| `ammoId` | TaCZ 弹药标识，例如 `tacz:9mm` 或枪包自定义值 |

材料来源应优先使用 `c:` 或项目自己的标签，避免绑定到某个整合包版本的单一
物品 ID。每个中间物品都可以在 `src/kubejs/startup_scripts/createtaczrecipe/` 中注册，
并在 `src/kubejs/assets/` 下提供自定义模型和贴图。

## 贴图与表现

中间物品贴图放在：

```text
src/kubejs/assets/<namespace>/textures/item/<name>.png
```

在 `ammo_items.js` 的 `.texture("<namespace>:item/<name>")` 中引用。这样可以
替换空弹壳、粗制弹头、装药和未完成弹药的外观，而不影响配方逻辑。建议使用
16x16 或 32x32 PNG，并保留旧文件名作为兼容别名，方便整合包更新后继续使用。

## 新增枪包流程

1. 从 `ammo` 对象复制模板并填写枪包的 `AmmoId`。
2. 在 `ammo_items.js` 添加中间物品和贴图引用。
3. 在 `ammo_tags.js` 添加材料标签映射。
4. 用 KubeJS 重载并在 JEI 中检查每个阶段，再测试机械手逐件加工。

接口只描述数据和配方，不复制枪包本体；枪包仍需由用户按其许可证单独安装。
