import * as kitty from "@libs/kitty";
import * as plugins from "@libs/plugins";
import * as themes from "@libs/themes";

import { PaletteWidget } from "./widget.ts";

export default {
  init(api: plugins.Api): void {
    const widget = new PaletteWidget();

    let zen = true;

    api.onReact("resize", () => {
      const { columns, rows } = Deno.consoleSize();

      if (zen) {
        widget.resize(columns, rows, 0, 0);
      } else {
        widget.resize(columns, rows - 2, 1, 0);
      }
    });

    api.onIntercept("command", async ({ cmd }) => {
      switch (cmd.name) {
        case "Zen":
          zen = !zen;
          return;

        case "Theme":
          widget.setTheme(themes.Themes[cmd.data]);
          return;

        case "Palette":
          await run();
          return;
      }
    });

    async function run(): Promise<void> {
      widget.open();

      const onRender = () => widget.render();

      const onKeyPress = async (data: { cancel?: boolean; key: kitty.Key }) => {
        data.cancel = true;

        widget.onKeyPress(data.key);

        if (!widget.opened) {
          api.offReact("render", onRender);
          api.offIntercept("key.press", onKeyPress);
          return;
        }
      };

      api.onReact("render", onRender, 1000);
      api.onIntercept("key.press", onKeyPress, -1000);

      await api.run((ctx) => {
        ctx.continue = widget.opened;
        ctx.layoutChanged = true;
      });

      const cmd = widget.result;
      if (cmd) {
        await api.emitCommand(cmd);
      }
    }
  },
} satisfies plugins.Plugin;
