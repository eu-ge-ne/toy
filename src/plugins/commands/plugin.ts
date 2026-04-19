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

    await this.host.emitCommand({ name } as commands.Command);
    return true;
  }

  override async onCommand(cmd: commands.Command): Promise<boolean> {
    switch (cmd.name) {
      case "Zen":
        await this.host.zen();
        return false;

      case "Exit":
        await this.host.exit();
        return true;

      case "Palette":
        await this.host.palette();
        return true;

      case "Save":
        await this.host.save();
        return true;

      case "Theme":
        await this.host.theme(themes.Themes[cmd.data]);
        return false;
    }

    return false;
  }
}
