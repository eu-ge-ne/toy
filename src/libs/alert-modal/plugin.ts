import * as api from "@libs/api";
import * as plugins from "@libs/plugins";
import * as std from "@libs/std";
import * as themes from "@libs/themes";

import { AlertModalAPI } from "./api.ts";
import { AlertWidget } from "./widget.ts";

let widget: AlertWidget;

export const plugin = {
  register: {
    alertModal(toy: api.Toy): AlertModalAPI {
      return {
        async open(message: string): Promise<void> {
          let opened = true;

          widget.children.text.value = message;

          const offRender = toy.io.signals.on("render", 1000)(() => widget.render());

          const offKeyPress = toy.io.events.on("key.press", -1000)(
            async (data) => {
              data.cancel = true;

              switch (data.key.name) {
                case "ESC":
                case "ENTER":
                  opened = false;
              }

              if (opened) {
                return;
              }

              offRender();
              offKeyPress();
            },
          );

          await toy.io.loop(() => !opened);
        },
      };
    },
  },

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
} satisfies plugins.Plugin;
