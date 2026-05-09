import * as plugins from "@libs/plugins";
import * as std from "@libs/std";
import * as themes from "@libs/themes";

import { AlertWidget } from "./widget.ts";

let widget: AlertWidget;

export default {
  init(api: plugins.Api): void {
    widget = new AlertWidget();

    api.react("resize", () => {
      const { columns, rows } = Deno.consoleSize();

      const w = std.clamp(60, 0, columns);
      const h = std.clamp(10, 0, rows);
      const y = Math.trunc((rows - h) / 2);
      const x = Math.trunc((columns - w) / 2);

      widget.resize(w, h, y, x);
    });

    api.intercept("command", async ({ cmd }) => {
      switch (cmd.name) {
        case "Theme":
          widget.setTheme(themes.Themes[cmd.data]);
          return;
      }
    });
  },
  initAlert(api: plugins.Api): plugins.Alert {
    return {
      async open(message: string): Promise<void> {
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

        await api.run((ctx) => ctx.continue = widget.opened);
      },
    };
  },
} satisfies plugins.Plugin;
