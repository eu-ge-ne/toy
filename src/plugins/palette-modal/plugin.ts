import * as buffers from "@libs/buffers";
import * as libThemes from "@libs/themes";

import { IOAPI } from "@plugins/io";
import * as themes from "@plugins/themes";
import * as zen from "@plugins/zen";

import { options } from "./options.ts";
import { PaletteWidget } from "./widget.ts";

export type API = {
  paletteModal: {
    open(): Promise<void>;
  };
};

export function plugin(api: themes.API & IOAPI & zen.API): API {
  const buffer = new buffers.Buffer();
  const widget = new PaletteWidget(buffer);

  api.theme.signals.on("change")((x) => widget.setTheme(libThemes.Themes[x]));

  api.io.signals.on("resize")(() => {
    const { columns, rows } = Deno.consoleSize();

    if (api.zen.enabled) {
      widget.resize(columns, rows, 0, 0);
    } else {
      widget.resize(columns, rows - 2, 1, 0);
    }
  });

  return {
    paletteModal: {
      async open(): Promise<void> {
        let opened = true;
        let result: ((_: unknown) => Promise<void>) | undefined;

        buffer.text = "";
        widget.children.list.items = options;

        const offRender = api.io.signals.on("render", 1000)(() => widget.render());

        const offKeyPress = api.io.events.on("key.press", -1000)(
          async (data) => {
            data.cancel = true;

            switch (data.key.name) {
              case "ESC":
                result = undefined;
                opened = false;
                break;
              case "ENTER":
                result = widget.children.list.items[widget.children.list.index]?.value;
                opened = false;
                break;
              case "UP":
                if (widget.children.list.items.length > 0) {
                  widget.children.list.index = Math.max(widget.children.list.index - 1, 0);
                }
                break;
              case "DOWN":
                if (widget.children.list.items.length > 0) {
                  widget.children.list.index = Math.min(
                    widget.children.list.index + 1,
                    widget.children.list.items.length - 1,
                  );
                }
                break;
              default:
                widget.children.editor.onKeyPress(data.key);
                widget.filter();
            }

            if (opened) {
              return;
            }

            offRender();
            offKeyPress();
          },
        );

        await api.io.loop(() => {
          api.io.resize();
          return !opened;
        });

        if (typeof result !== "undefined") {
          await result(api);
        }
      },
    },
  };
}
