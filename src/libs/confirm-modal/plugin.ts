import "@libs/plugins";
import * as plugins from "@libs/plugins";
import * as std from "@libs/std";
import * as themes from "@libs/themes";

import { AskWidget } from "./widget.ts";

declare module "@libs/plugins" {
  export interface API {
    confirmModal: {
      open(_: string): Promise<boolean>;
    };
  }
}

export function plugin(api: plugins.API): plugins.Result {
  const widget = new AskWidget();

  return {
    confirmModal: {
      async open(message: string): Promise<boolean> {
        let opened = true;
        let result = false;

        widget.children.text.value = message;

        const offRender = api.io.signals.on("render", 1000)(() => widget.render());

        const offKeyPress = api.io.events.on("key.press", -1000)(
          async (data) => {
            data.cancel = true;

            switch (data.key.name) {
              case "ESC":
                result = false;
                opened = false;
                break;
              case "ENTER":
                result = true;
                opened = false;
                break;
            }

            if (opened) {
              return;
            }

            offRender();
            offKeyPress();
          },
        );

        await api.io.loop(() => !opened);

        return result;
      },
    },

    init(): void {
      api.theme.signals.on("change")((x) => widget.setTheme(themes.Themes[x]));

      api.io.signals.on("resize")(() => {
        const { columns, rows } = Deno.consoleSize();

        const w = std.clamp(60, 0, columns);
        const h = std.clamp(7, 0, rows);
        const y = Math.trunc((rows - h) / 2);
        const x = Math.trunc((columns - w) / 2);

        widget.resize(w, h, y, x);
      });
    },
  };
}
