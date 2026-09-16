package com.naicringo.createtaczrecipe;

import dev.latvian.mods.kubejs.plugin.KubeJSPlugin;
import dev.latvian.mods.kubejs.script.ScriptManager;
import net.neoforged.fml.ModList;

import java.nio.file.Path;

/** Loads this mod's read-only bundled scripts without copying files into the instance. */
public final class CreateTacZrecipeKubeJSPlugin implements KubeJSPlugin {
    @Override
    public void beforeScriptsLoaded(ScriptManager manager) {
        String directory = manager.scriptType.isStartup() ? "startup_scripts"
            : manager.scriptType.isServer() ? "server_scripts" : null;
        if (directory == null) {
            return;
        }

        var modFile = ModList.get().getModFileById(CreateTacZrecipe.MOD_ID);
        if (modFile == null) {
            throw new IllegalStateException("CreateTacZrecipe mod file is unavailable");
        }

        // Use the project directory as the pack root. KubeJS keys packs by the
        // root directory name; using startup_scripts/server_scripts directly
        // would collide with and be replaced by the user's normal script pack.
        Path root = modFile.getFile().findResource("kubejs_scripts", directory, CreateTacZrecipe.MOD_ID);
        manager.loadPackFromDirectory(root, CreateTacZrecipe.MOD_ID + "_builtin", true);
    }
}
