import * as api from "@libs/api";
import * as plugins from "@libs/plugins";
import * as std from "@libs/std";
import * as themes from "@libs/themes";

import { AskFileNameWidget } from "./widget.ts";

let widget: AskFileNameWidget;

export default {
  init(api: api.API): void {
    widget = new AskFileNameWidget();

    api.theme.events.react("change", (x) => widget.setTheme(themes.Themes[x]));

    api.io.events.react("resize", () => {
      const { columns, rows } = Deno.consoleSize();

      const w = std.clamp(60, 0, columns);
      const h = std.clamp(10, 0, rows);
      const y = Math.trunc((rows - h) / 2);
      const x = Math.trunc((columns - w) / 2);

      widget.resize(w, h, y, x);
    });
  },
  initFileNameModal(api: api.API): api.FileNameModalAPI {
    return {
      async open(fileName: string): Promise<string | undefined> {
        widget.open(fileName);

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

        await api.io.runLoop((ctx) => ctx.continue = widget.opened);

        return widget.result;
      },
    };
  },
} satisfies plugins.Plugin;
