import * as commands from "@libs/commands";
import * as kitty from "@libs/kitty";
import * as plugins from "@libs/plugins";

export class CommandsPlugin {
  constructor(private readonly host: plugins.Host) {
    host.onIntercept("key.press", this.onKey, -1000);
    host.onIntercept("command", this.onCommand);
  }

  onKey = async (data: { cancel?: boolean; key: kitty.Key }) => {
    const name = commands.ShortcutToCommand[kitty.shortcut(data.key)];
    if (!name) {
      return;
    }

    data.cancel = true;

    await this.host.command({ name } as commands.Command);
  };

  onCommand = async ({ cmd }: { cmd: commands.Command }) => {
    switch (cmd.name) {
      case "Exit":
        await this.host.stop();
        return;

      case "Save":
        await this.host.files.save();
        return;
    }
  };
}
