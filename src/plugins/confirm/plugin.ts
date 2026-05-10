import * as plugins from "@libs/plugins";
import * as std from "@libs/std";
import * as themes from "@libs/themes";

import { AskWidget } from "./widget.ts";

let widget: AskWidget;

export default {
  init(api: plugins.Api): void {
    widget = new AskWidget();

    api.react("resize", () => {
      const { columns, rows } = Deno.consoleSize();

      const w = std.clamp(60, 0, columns);
      const h = std.clamp(7, 0, rows);
      const y = Math.trunc((rows - h) / 2);
      const x = Math.trunc((columns - w) / 2);

      widget.resize(w, h, y, x);
    });

    api.react("theme.set", (name) => widget.setTheme(themes.Themes[name]));
  },
  confirmApi(api: plugins.Api): plugins.ConfirmApi {
    return {
      async open(message: string): Promise<boolean> {
        widget.open(message);

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

        await api.runInputLoop((ctx) => ctx.continue = widget.opened);

        return widget.result;
      },
    };
  },
} satisfies plugins.Plugin;
