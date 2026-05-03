import * as commands from "@libs/commands";
import * as kitty from "@libs/kitty";
import * as plugins from "@libs/plugins";

export class CommandsPlugin extends plugins.Plugin {
  constructor(host: plugins.Host) {
    super(host);

    host.onIntercept("key.press", this.onKey, -1000);
  }

  onKey = async (data: { cancel?: boolean; key: kitty.Key }) => {
    const name = commands.ShortcutToCommand[kitty.shortcut(data.key)];
    if (!name) {
      return;
    }

    data.cancel = true;

    await this.host.emitCommand({ name } as commands.Command);
  };

  override async onCommand(cmd: commands.Command): Promise<void> {
    switch (cmd.name) {
      case "Exit":
        await this.host.stop();
        return;

      case "Save":
        await this.host.files.save();
        return;
    }
  }
}
