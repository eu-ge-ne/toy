import * as commands from "@libs/commands";
import * as kitty from "@libs/kitty";
import * as plugins from "@libs/plugins";

export default {
  init(api: plugins.Api): void {
    api.interceptOrdered("key.press", -1000, async (data) => {
      const name = commands.ShortcutToCommand[kitty.shortcut(data.key)];
      if (!name) {
        return;
      }

      data.cancel = true;

      await api.emitCommand({ name } as commands.Command);
    });
  },
} satisfies plugins.Plugin;
