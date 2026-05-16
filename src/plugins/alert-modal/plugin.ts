import * as api from "@libs/api";
import * as plugins from "@libs/plugins";
import * as std from "@libs/std";
import * as themes from "@libs/themes";

import { AlertWidget } from "./widget.ts";

let widget: AlertWidget;

export default {
  init(toy: api.Toy): void {
    widget = new AlertWidget();

    toy.theme.signals.on("change")((x) => widget.setTheme(themes.Themes[x]));

    toy.io.signals.on("resize")(() => {
      const { columns, rows } = Deno.consoleSize();

      const w = std.clamp(60, 0, columns);
      const h = std.clamp(10, 0, rows);
      const y = Math.trunc((rows - h) / 2);
      const x = Math.trunc((columns - w) / 2);

      widget.resize(w, h, y, x);
    });
  },
  register: {
    alertModal(toy: api.Toy): api.AlertModal {
      return {
        async open(message: string): Promise<void> {
          widget.open(message);

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

          await toy.io.loop((ctx) => ctx.continue = widget.opened);
        },
      };
    },
  },
} satisfies plugins.Plugin;
