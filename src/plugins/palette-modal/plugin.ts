import * as api from "@libs/api";
import * as plugins from "@libs/plugins";
import * as themes from "@libs/themes";

import { PaletteWidget } from "./widget.ts";

let widget: PaletteWidget;
let zen = true;

export default {
  init(api: api.Api): void {
    widget = new PaletteWidget();

    api.io.events.react("resize", () => {
      const { columns, rows } = Deno.consoleSize();

      if (zen) {
        widget.resize(columns, rows, 0, 0);
      } else {
        widget.resize(columns, rows - 2, 1, 0);
      }
    });

    api.react("theme.set", (name) => widget.setTheme(themes.Themes[name]));
    api.react("zen.toggle", () => zen = !zen);
  },
  paletteModalApi(api: api.Api): api.PaletteModalApi {
    return {
      async open(): Promise<void> {
        widget.open();

        const offRender = api.io.events.reactOrdered(
          "render",
          1000,
          () => widget.render(),
        );

        const offKeyPress = api.io.events.interceptOrdered(
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

        await api.io.runLoop((ctx) => {
          ctx.continue = widget.opened;
          ctx.layoutChanged = true;
        });

        if (typeof widget.result !== "undefined") {
          await widget.result(api);
        }
      },
    };
  },
} satisfies plugins.Plugin;
