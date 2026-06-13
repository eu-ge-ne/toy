import * as std from "@libs/std";
import * as libThemes from "@libs/themes";

import * as io from "@plugins/io";
import * as themes from "@plugins/themes";

import { AlertWidget } from "./widget.ts";

export type API = {
  alertModal: {
    open(_: string): Promise<void>;
  };
};

export function plugin(api: themes.API & io.API): API {
  const widget = new AlertWidget();

  api.theme.signals.on("change")((x) => widget.setTheme(libThemes.Themes[x]));

  api.io.signals.on("resize")(() => {
    const { columns, rows } = Deno.consoleSize();

    const w = std.clamp(60, 0, columns);
    const h = std.clamp(10, 0, rows);
    const y = Math.trunc((rows - h) / 2);
    const x = Math.trunc((columns - w) / 2);

    widget.resize(w, h, y, x);
  });

  return {
    alertModal: {
      async open(message: string): Promise<void> {
        let opened = true;

        widget.children.text.value = message;

        const offRender = api.io.signals.on("render", 1000)(() => widget.render());

        const offKeyPress = api.io.events.on("key.press", -1000)(
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

        await api.io.loop(() => !opened);
      },
    },
  };
}
