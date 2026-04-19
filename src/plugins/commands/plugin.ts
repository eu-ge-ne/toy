import * as commands from "@libs/commands";
import * as kitty from "@libs/kitty";
import * as plugins from "@libs/plugins";
import * as themes from "@libs/themes";

export class CommandsPlugin extends plugins.Plugin {
  override async onKey(key: kitty.Key): Promise<boolean> {
    const name = commands.ShortcutToCommand[kitty.shortcut(key)];
    if (!name) {
      return false;
    }

    return await this.onCommand({ name } as commands.Command);
  }

  override async onCommand(cmd: commands.Command): Promise<boolean> {
    switch (cmd.name) {
      case "Zen":
        await this.host.handleZen();
        return false;

      case "Exit":
        await this.host.handleExit();
        return true;

      case "Palette":
        await this.host.handlePalette();
        return true;

      case "Save":
        await this.host.handleSave();
        return true;

      case "Theme":
        await this.host.handleTheme(themes.Themes[cmd.data]);
        return false;
    }

    return false;
  }
}
