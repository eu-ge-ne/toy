import * as api from "@libs/api";
import * as plugins from "@libs/plugins";
import * as themes from "@libs/themes";

import { PaletteWidget } from "./widget.ts";

let widget: PaletteWidget;

export default {
  init(host: api.Host): void {
    widget = new PaletteWidget();

    host.theme.events.react("change", (x) => widget.setTheme(themes.Themes[x]));

    host.io.events.react("resize", () => {
      const { columns, rows } = Deno.consoleSize();

      if (host.zen.enabled) {
        widget.resize(columns, rows, 0, 0);
      } else {
        widget.resize(columns, rows - 2, 1, 0);
      }
    });
  },
  initPaletteModal(host: api.Host): api.PaletteModal {
    return {
      async open(): Promise<void> {
        widget.open();

        const offRender = host.io.events.reactOrdered(
          "render",
          1000,
          () => widget.render(),
        );

        const offKeyPress = host.io.events.interceptOrdered(
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

        await host.io.runLoop((ctx) => {
          ctx.continue = widget.opened;
          ctx.layoutChanged = true;
        });

        if (typeof widget.result !== "undefined") {
          await widget.result(host);
        }
      },
    };
  },
} satisfies plugins.Plugin;
