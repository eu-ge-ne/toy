import * as api from "@libs/api";
import * as plugins from "@libs/plugins";
import * as themes from "@libs/themes";

import { PaletteWidget } from "./widget.ts";

let widget: PaletteWidget;

export default {
  init(toy: api.Toy): void {
    widget = new PaletteWidget();

    toy.theme.signals.on("change")((x) => widget.setTheme(themes.Themes[x]));

    toy.io.signals.on("resize")(() => {
      const { columns, rows } = Deno.consoleSize();

      if (toy.zen.enabled) {
        widget.resize(columns, rows, 0, 0);
      } else {
        widget.resize(columns, rows - 2, 1, 0);
      }
    });
  },
  register: {
    paletteModal(toy: api.Toy): api.PaletteModal {
      return {
        async open(): Promise<void> {
          widget.open();

          const offRender = toy.io.signals.on("render", 1000)(() => widget.render());

          const offKeyPress = toy.io.events.on("key.press", -1000)(
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

          await toy.io.loop((ctx) => {
            ctx.continue = widget.opened;
            ctx.layoutChanged = true;
          });

          if (typeof widget.result !== "undefined") {
            await widget.result(toy);
          }
        },
      };
    },
  },
} satisfies plugins.Plugin;
