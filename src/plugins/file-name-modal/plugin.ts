import * as api from "@libs/api";
import * as plugins from "@libs/plugins";
import * as std from "@libs/std";
import * as themes from "@libs/themes";

import { AskFileNameWidget } from "./widget.ts";

let widget: AskFileNameWidget;

export default {
  init(api: api.Api): void {
    widget = new AskFileNameWidget();

    api.react("resize", () => {
      const { columns, rows } = Deno.consoleSize();

      const w = std.clamp(60, 0, columns);
      const h = std.clamp(10, 0, rows);
      const y = Math.trunc((rows - h) / 2);
      const x = Math.trunc((columns - w) / 2);

      widget.resize(w, h, y, x);
    });

    api.react("theme.set", (name) => widget.setTheme(themes.Themes[name]));
  },
  fileNameModalApi(api: api.Api): api.FileNameModalApi {
    return {
      async open(fileName: string): Promise<string | undefined> {
        widget.open(fileName);

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
