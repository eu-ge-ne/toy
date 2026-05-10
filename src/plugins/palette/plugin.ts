import * as plugins from "@libs/plugins";
import * as themes from "@libs/themes";

import { PaletteWidget } from "./widget.ts";

let widget: PaletteWidget;

export default {
  init(api: plugins.Api): void {
    widget = new PaletteWidget();

    let zen = true;

    api.react("resize", () => {
      const { columns, rows } = Deno.consoleSize();

      if (zen) {
        widget.resize(columns, rows, 0, 0);
      } else {
        widget.resize(columns, rows - 2, 1, 0);
      }
    });

    api.intercept("command", async ({ cmd }) => {
      switch (cmd.name) {
        case "Zen":
          zen = !zen;
          return;

        case "Theme":
          widget.setTheme(themes.Themes[cmd.data]);
          return;
      }
    });
  },
  initPalette(api: plugins.Api): plugins.Palette {
    return {
      async open(): Promise<void> {
        widget.open();

        const offRender = api.reactOrdered(
          "render",
          1000,
          () => widget.render(),
        );

        const offKeyPress = api.interceptOrdered(
          "key.press",
          -1000,
          async (data) => {
            data.cancel = true;

            widget.onKeyPress(data.key);
            if (widget.opened) {
              return;
            }

            offRender();
            offKeyPress();
          },
        );

        await api.runInputLoop((ctx) => {
          ctx.continue = widget.opened;
          ctx.layoutChanged = true;
        });

        if (typeof widget.result === "function") {
          await widget.result(api);
        } else if (widget.result) {
          await api.emitCommand(widget.result);
        }
      },
    };
  },
} satisfies plugins.Plugin;
