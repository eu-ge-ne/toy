import * as commands from "@libs/commands";
import * as kitty from "@libs/kitty";
import * as plugins from "@libs/plugins";

export class CommandsPlugin extends plugins.Plugin {
  override async onKeyPress(key: kitty.Key): Promise<boolean> {
    const name = commands.ShortcutToCommand[kitty.shortcut(key)];
    if (!name) {
      return false;
    }

    await this.host.command({ name } as commands.Command);
    return true;
  }

  override async onCommand(cmd: commands.Command): Promise<boolean> {
    switch (cmd.name) {
      case "Exit":
        await this.host.stop();
        return true;

      case "Save":
        await this.host.emitDocSave();
        return true;
    }

    return false;
  }
}
