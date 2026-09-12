package com.naicringo.createtaczrecipe;

import org.slf4j.Logger;

import com.mojang.logging.LogUtils;

import net.neoforged.bus.api.IEventBus;
import net.neoforged.fml.common.Mod;

@Mod(CreateTacZrecipe.MOD_ID)
public final class CreateTacZrecipe {
    public static final String MOD_ID = "createtaczrecipe";
    private static final Logger LOGGER = LogUtils.getLogger();

    public CreateTacZrecipe(IEventBus modEventBus) {
        LOGGER.info("CreateTacZrecipe native module loaded");
    }
}
