import * as buffers from "@libs/buffers";
import * as std from "@libs/std";
import * as libThemes from "@libs/themes";

import { IOAPI } from "@plugins/io";
import * as themes from "@plugins/themes";

import { AskFileNameWidget } from "./widget.ts";

export type FileNameModalAPI = {
  fileNameModal: {
    open(_: string): Promise<string | undefined>;
  };
};

export function FileNameModalPlugin(api: themes.API & IOAPI): FileNameModalAPI {
  const buffer = new buffers.Buffer();
  const widget = new AskFileNameWidget(buffer);

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
    fileNameModal: {
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
    },
  };
}
