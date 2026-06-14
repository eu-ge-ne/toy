import * as buffers from "@libs/buffers";
import * as std from "@libs/std";
import * as libThemes from "@libs/themes";

import { IOAPI } from "@plugins/io";
import { ThemesAPI } from "@plugins/themes";

import { AskFileNameWidget } from "./widget.ts";

export type FileNameModalAPI = ReturnType<typeof FileNameModalPlugin>;

export function FileNameModalPlugin(...api: ConstructorParameters<typeof FileNameModal>) {
  return {
    fileNameModal: new FileNameModal(...api),
  };
}

class FileNameModal {
  private readonly buffer = new buffers.Buffer();
  private readonly widget = new AskFileNameWidget(this.buffer);

  constructor(private readonly api: ThemesAPI & IOAPI) {
    api.theme.signals.on("change")((x) => this.widget.setTheme(libThemes.Themes[x]));

    api.io.signals.on("resize")(() => {
      const { columns, rows } = Deno.consoleSize();

      const w = std.clamp(60, 0, columns);
      const h = std.clamp(10, 0, rows);
      const y = Math.trunc((rows - h) / 2);
      const x = Math.trunc((columns - w) / 2);

      this.widget.resize(w, h, y, x);
    });
  }

  async open(fileName: string): Promise<string | undefined> {
    let opened = true;
    let result: string | undefined;

    this.buffer.text = fileName;

    const offRender = this.api.io.signals.on("render", 1000)(() => this.widget.render());

    const offKeyPress = this.api.io.events.on("key.press", -1000)(
      async (data) => {
        data.cancel = true;

        switch (data.key.name) {
          case "ESC":
            result = undefined;
            opened = false;
            break;
          case "ENTER": {
            if (this.buffer.text) {
              result = this.buffer.text;
              opened = false;
            }
            break;
          }
          default:
            this.widget.children.editor.onKeyPress(data.key);
        }

        if (opened) {
          return;
        }

        offRender();
        offKeyPress();
      },
    );

    await this.api.io.loop(() => !opened);

    return result;
  }
}
