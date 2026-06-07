import * as api from "@libs/api";
import * as buffers from "@libs/buffers";
import * as plugins from "@libs/plugins";
import * as std from "@libs/std";
import * as themes from "@libs/themes";

import { AskFileNameWidget } from "./widget.ts";

let buffer: buffers.Buffer;
let widget: AskFileNameWidget;

export default {
  init(toy: api.Toy): void {
    buffer = new buffers.Buffer();
    widget = new AskFileNameWidget(buffer);

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
  register: {
    fileNameModal(toy: api.Toy): api.FileNameModal {
      return {
        async open(fileName: string): Promise<string | undefined> {
          let opened = true;
          let result: string | undefined;

          buffer.text = fileName;
          buffer.resetUndo();

          const offRender = toy.io.signals.on("render", 1000)(() => widget.render());

          const offKeyPress = toy.io.events.on("key.press", -1000)(
            async (data) => {
              data.cancel = true;

              switch (data.key.name) {
                case "ESC":
                  result = undefined;
                  opened = false;
                  break;
                case "ENTER": {
                  if (buffer.text) {
                    result = buffer.text;
                    opened = false;
                  }
                  break;
                }
                default:
                  widget.children.editor.onKeyPress(data.key);
              }

              if (opened) {
                return;
              }

              offRender();
              offKeyPress();
            },
          );

          await toy.io.loop(() => !opened);

          return result;
        },
      };
    },
  },
} satisfies plugins.Plugin;
