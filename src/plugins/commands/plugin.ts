import * as commands from "@libs/commands";
import * as kitty from "@libs/kitty";
import * as plugins from "@libs/plugins";

export function register(host: plugins.Host): void {
  host.onIntercept("key.press", async (data) => {
    const name = commands.ShortcutToCommand[kitty.shortcut(data.key)];
    if (!name) {
      return;
    }

    data.cancel = true;

    await host.command({ name } as commands.Command);
  }, -1000);

  host.onIntercept("command", async ({ cmd }) => {
    switch (cmd.name) {
      case "Exit":
        await host.stop();
        return;

      case "Save":
        await host.files.save();
        return;
    }
  });
}
