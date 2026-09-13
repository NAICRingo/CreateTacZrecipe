package com.naicringo.createtaczrecipe;

import org.slf4j.Logger;

import com.mojang.logging.LogUtils;

import net.minecraft.core.component.DataComponentType;
import net.minecraft.core.registries.BuiltInRegistries;
import net.minecraft.core.registries.Registries;
import net.minecraft.network.chat.Component;
import net.minecraft.resources.ResourceLocation;
import net.minecraft.world.item.CreativeModeTab;
import net.minecraft.world.item.Item;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.item.Items;
import net.neoforged.bus.api.IEventBus;
import net.neoforged.fml.common.Mod;
import net.neoforged.neoforge.registries.DeferredHolder;
import net.neoforged.neoforge.registries.DeferredRegister;

@Mod(CreateTacZrecipe.MOD_ID)
public final class CreateTacZrecipe {
    public static final String MOD_ID = "createtaczrecipe";
    private static final Logger LOGGER = LogUtils.getLogger();
    private static final String[] CALIBERS = {
        "22wmr", "9mm", "45acp", "46x30", "57x28", "762x25", "357mag", "500mag", "50ae",
        "545x39", "556x45", "58x42", "68x51fury", "762x39", "30_06", "308", "338", "45_70",
        "762x54", "792x57", "50bmg"
    };
    private static final DeferredRegister<CreativeModeTab> CREATIVE_TABS =
        DeferredRegister.create(Registries.CREATIVE_MODE_TAB, MOD_ID);
    public static final DeferredHolder<CreativeModeTab, CreativeModeTab> MAIN_TAB = CREATIVE_TABS.register("main", () ->
        CreativeModeTab.builder()
            .title(Component.translatable("itemGroup.createtaczrecipe.main"))
            .icon(() -> itemStack("createtaczrecipe:small_arms_primer"))
            .displayItems((parameters, output) -> addCreativeItems(output))
            .build());

    public CreateTacZrecipe(IEventBus modEventBus) {
        CREATIVE_TABS.register(modEventBus);
        LOGGER.info("CreateTacZrecipe native module loaded");
    }

    private static void addCreativeItems(CreativeModeTab.Output output) {
        addItem(output, "createtaczrecipe:small_arms_primer");
        addItem(output, "createtaczrecipe:loose_propellant");
        addItem(output, "createtaczrecipe:light_propellant_charge");
        addItem(output, "createtaczrecipe:standard_propellant_charge");
        addItem(output, "createtaczrecipe:heavy_propellant_charge");
        for (String caliber : CALIBERS) {
            addMold(output, "createtaczrecipe_" + caliber + "_casing");
            addMold(output, "createtaczrecipe_" + caliber + "_bullet");
        }
        for (String caliber : CALIBERS) {
            addItem(output, "createtaczrecipe:empty_" + caliber + "_casing");
            addItem(output, "createtaczrecipe:rough_" + caliber + "_bullet");
            addItem(output, "createtaczrecipe:polished_" + caliber + "_bullet");
            addItem(output, "createtaczrecipe:incomplete_" + caliber + "_round");
        }
    }

    private static ItemStack itemStack(String id) {
        Item item = BuiltInRegistries.ITEM.get(ResourceLocation.parse(id));
        return item == Items.AIR ? new ItemStack(Items.GUNPOWDER) : new ItemStack(item);
    }

    private static void addItem(CreativeModeTab.Output output, String id) {
        ItemStack stack = itemStack(id);
        if (!stack.is(Items.GUNPOWDER) || id.equals("minecraft:gunpowder")) {
            output.accept(stack);
        }
    }

    @SuppressWarnings({"rawtypes", "unchecked"})
    private static void addMold(CreativeModeTab.Output output, String moldType) {
        Item mold = BuiltInRegistries.ITEM.get(ResourceLocation.parse("createdieselgenerators:mold"));
        DataComponentType component = BuiltInRegistries.DATA_COMPONENT_TYPE.get(ResourceLocation.parse("createdieselgenerators:mold_type"));
        if (mold == Items.AIR || component == null) {
            return;
        }
        ItemStack stack = new ItemStack(mold);
        stack.set(component, ResourceLocation.parse("kubejs:" + moldType));
        output.accept(stack);
    }
}
