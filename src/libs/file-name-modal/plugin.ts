import * as buffers from "@libs/buffers";
import * as plugins from "@libs/plugins";
import * as std from "@libs/std";
import * as themes from "@libs/themes";

import { FileNameModalAPI } from "./api.ts";
import { AskFileNameWidget } from "./widget.ts";

let buffer: buffers.BufferAPI;
let widget: AskFileNameWidget;

export const plugin = {
  register: {
    fileNameModal(api: plugins.API): FileNameModalAPI {
      return {
        async open(fileName: string): Promise<string | undefined> {
          let opened = true;
          let result: string | undefined;

          buffer.text = fileName;

          const offRender = api.io.signals.on("render", 1000)(() => widget.render());

          const offKeyPress = api.io.events.on("key.press", -1000)(
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

          await api.io.loop(() => !opened);

          return result;
        },
      };
    },
  },

  init(api: plugins.API): void {
    buffer = new buffers.BufferAPI();
    widget = new AskFileNameWidget(buffer);

    api.theme.signals.on("change")((x) => widget.setTheme(themes.Themes[x]));

    api.io.signals.on("resize")(() => {
      const { columns, rows } = Deno.consoleSize();

      const w = std.clamp(60, 0, columns);
      const h = std.clamp(10, 0, rows);
      const y = Math.trunc((rows - h) / 2);
      const x = Math.trunc((columns - w) / 2);

      widget.resize(w, h, y, x);
    });
  },
} satisfies plugins.Plugin;
