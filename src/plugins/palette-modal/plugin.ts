import * as api from "@libs/api";
import * as buffers from "@libs/buffers";
import * as plugins from "@libs/plugins";
import * as themes from "@libs/themes";

import { options } from "./options.ts";
import { PaletteWidget } from "./widget.ts";

let buffer: buffers.Buffer;
let widget: PaletteWidget;

export default {
  init(toy: api.Toy): void {
    buffer = new buffers.Buffer();
    widget = new PaletteWidget(buffer);

    toy.theme.signals.on("change")((x) => widget.setTheme(themes.Themes[x]));

    toy.io.signals.on("resize")(() => {
      const { columns, rows } = Deno.consoleSize();

      if (toy.zen.enabled) {
        widget.resize(columns, rows, 0, 0);
      } else {
        widget.resize(columns, rows - 2, 1, 0);
      }
    });
  },
  register: {
    paletteModal(toy: api.Toy): api.PaletteModal {
      return {
        async open(): Promise<void> {
          let opened = true;
          let result: ((_: api.Toy) => Promise<void>) | undefined;

          buffer.text = "";
          buffer.resetHistory();
          widget.children.editor.resetCursor();
          widget.children.list.items = options;

          const offRender = toy.io.signals.on("render", 1000)(() => widget.render());

          const offKeyPress = toy.io.events.on("key.press", -1000)(
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

          await toy.io.loop(() => {
            toy.io.resize();
            return !opened;
          });

          if (typeof result !== "undefined") {
            await result(toy);
          }
        },
      };
    },
  },
} satisfies plugins.Plugin;
