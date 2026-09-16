package com.naicringo.createtaczrecipe;

import org.slf4j.Logger;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

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
import net.neoforged.neoforge.event.BuildCreativeModeTabContentsEvent;
import net.neoforged.neoforge.registries.DeferredHolder;
import net.neoforged.neoforge.registries.DeferredRegister;

@Mod(CreateTacZrecipe.MOD_ID)
public final class CreateTacZrecipe {
    public static final String MOD_ID = "createtaczrecipe";
    private static final Logger LOGGER = LogUtils.getLogger();
    private static final ResourceLocation DIESEL_GENERATORS_TAB =
        ResourceLocation.fromNamespaceAndPath("createdieselgenerators", "cdg_creative_tab");
    private static final ResourceLocation MOLD_ITEM =
        ResourceLocation.fromNamespaceAndPath("createdieselgenerators", "mold");
    private static final ResourceLocation MOLD_TYPE_COMPONENT =
        ResourceLocation.fromNamespaceAndPath("createdieselgenerators", "mold_type");
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
        modEventBus.addListener(CreateTacZrecipe::filterDieselGeneratorsTab);
        LOGGER.info("CreateTacZrecipe native module loaded");
    }

    private static void addCreativeItems(CreativeModeTab.Output output) {
        addItem(output, "createtaczrecipe:small_arms_primer");
        addItem(output, "createtaczrecipe:primer_compound");
        addItem(output, "createtaczrecipe:loose_propellant");
        addItem(output, "createtaczrecipe:brass_casing_blank");
        addItem(output, "createtaczrecipe:copper_projectile_blank");
        addItem(output, "createtaczrecipe:light_propellant_charge");
        addItem(output, "createtaczrecipe:standard_propellant_charge");
        addItem(output, "createtaczrecipe:heavy_propellant_charge");
        List<String> calibers = discoverCalibers();
        addMold(output, "createtaczrecipe_metal_blank");
        for (String caliber : calibers) {
            // Built-in calibers have their own charge item and dedicated molds.
            // Gun-pack adapters deliberately share the two external mold types.
            if (!itemStack("createtaczrecipe:" + caliber + "_propellant_charge").isEmpty()) {
                addMold(output, "createtaczrecipe_" + caliber + "_casing");
                addMold(output, "createtaczrecipe_" + caliber + "_bullet");
            }
        }
        addMold(output, "createtaczrecipe_external_casing");
        addMold(output, "createtaczrecipe_external_bullet");
        for (String caliber : calibers) {
            addItem(output, "createtaczrecipe:" + caliber + "_propellant_charge");
            addItem(output, "createtaczrecipe:empty_" + caliber + "_casing");
            addItem(output, "createtaczrecipe:rough_" + caliber + "_bullet");
            addItem(output, "createtaczrecipe:polished_" + caliber + "_bullet");
            addItem(output, "createtaczrecipe:incomplete_" + caliber + "_round");
        }
    }

    private static ItemStack itemStack(String id) {
        Item item = BuiltInRegistries.ITEM.get(ResourceLocation.parse(id));
        return item == Items.AIR ? ItemStack.EMPTY : new ItemStack(item);
    }

    private static void addItem(CreativeModeTab.Output output, String id) {
        ItemStack stack = itemStack(id);
        if (!stack.isEmpty()) {
            output.accept(stack);
        }
    }

    private static List<String> discoverCalibers() {
        List<String> calibers = new ArrayList<>();
        for (ResourceLocation id : BuiltInRegistries.ITEM.keySet()) {
            String path = id.getPath();
            if (!id.getNamespace().equals(MOD_ID) || !path.startsWith("empty_") || !path.endsWith("_casing")) {
                continue;
            }
            String caliber = path.substring("empty_".length(), path.length() - "_casing".length());
            if (!caliber.isEmpty()) {
                calibers.add(caliber);
            }
        }
        calibers.sort(Comparator.naturalOrder());
        return calibers;
    }

    private static void addMold(CreativeModeTab.Output output, String moldType) {
        Item mold = BuiltInRegistries.ITEM.get(MOLD_ITEM);
        DataComponentType<ResourceLocation> component = moldTypeComponent();
        if (mold == Items.AIR || component == null) {
            return;
        }
        ItemStack stack = new ItemStack(mold);
        stack.set(component, ResourceLocation.parse("kubejs:" + moldType));
        output.accept(stack);
    }

    private static void filterDieselGeneratorsTab(BuildCreativeModeTabContentsEvent event) {
        if (!event.getTabKey().location().equals(DIESEL_GENERATORS_TAB)) {
            return;
        }
        DataComponentType<ResourceLocation> component = moldTypeComponent();
        Item mold = BuiltInRegistries.ITEM.get(MOLD_ITEM);
        if (mold == Items.AIR || component == null) {
            return;
        }
        List<ItemStack> entries = List.copyOf(event.getParentEntries());
        for (ItemStack stack : entries) {
            if (!stack.is(mold)) {
                continue;
            }
            ResourceLocation moldType = stack.get(component);
            if (moldType != null
                && moldType.getNamespace().equals("kubejs")
                && moldType.getPath().startsWith("createtaczrecipe_")) {
                event.remove(stack, CreativeModeTab.TabVisibility.PARENT_TAB_ONLY);
            }
        }
    }

    @SuppressWarnings("unchecked")
    private static DataComponentType<ResourceLocation> moldTypeComponent() {
        return (DataComponentType<ResourceLocation>) (DataComponentType<?>)
            BuiltInRegistries.DATA_COMPONENT_TYPE.get(MOLD_TYPE_COMPONENT);
    }
}
