import * as kitty from "@libs/kitty";
import * as plugins from "@libs/plugins";
import * as std from "@libs/std";
import * as themes from "@libs/themes";

import { AskFileNameWidget } from "./widget.ts";

const widget = new AskFileNameWidget();

export default {
  register(api: plugins.Api): void {
    api.onReact("resize", () => {
      const { columns, rows } = Deno.consoleSize();

      const w = std.clamp(60, 0, columns);
      const h = std.clamp(10, 0, rows);
      const y = Math.trunc((rows - h) / 2);
      const x = Math.trunc((columns - w) / 2);

      widget.resize(w, h, y, x);
    });

    api.onIntercept("command", async ({ cmd }) => {
      switch (cmd.name) {
        case "Theme":
          widget.setTheme(themes.Themes[cmd.data]);
          return;
      }
    });
  },
  registerAskFileName(api: plugins.Api): plugins.AskFileName {
    return {
      async open(fileName: string): Promise<string | undefined> {
        widget.open(fileName);

        const onRender = () => widget.render();

        const onKeyPress = async (
          data: { cancel?: boolean; key: kitty.Key },
        ) => {
          data.cancel = true;

          widget.onKeyPress(data.key);

          if (!widget.opened) {
            api.offReact("render", onRender);
            api.offIntercept("key.press", onKeyPress);
            return;
          }
        };

        api.onReact("render", onRender, 1000);
        api.onIntercept("key.press", onKeyPress, -1000);

        await api.loop((ctx) => ctx.continue = widget.opened);

        return widget.result;
      },
    };
  },
};
