import * as buffers from "@libs/buffers";
import * as std from "@libs/std";

import { CoreAPI } from "@plugins/core";
import { ThemesAPI } from "@plugins/themes";

import { SaveAsWidget } from "./widget.ts";

export type SaveAsAPI = ReturnType<typeof SaveAsPlugin>;

export function SaveAsPlugin(...api: ConstructorParameters<typeof SaveAs>) {
  return {
    saveAs: new SaveAs(...api),
  };
}

class SaveAs {
  private readonly buffer = new buffers.Buffer();
  private readonly widget = new SaveAsWidget(this.buffer);

  constructor(private readonly api: CoreAPI & ThemesAPI) {
    api.core.signals.on("resize")(() => {
      const { columns, rows } = Deno.consoleSize();

      const w = std.clamp(60, 0, columns);
      const h = std.clamp(10, 0, rows);
      const y = Math.trunc((rows - h) / 2);
      const x = Math.trunc((columns - w) / 2);

      this.widget.resize(w, h, y, x);
    });

    api.theme.signals.on("change")((x) => this.widget.setTheme(x));
  }

  async open(fileName: string): Promise<string | undefined> {
    let opened = true;
    let result: string | undefined;

    this.buffer.chunks = [fileName].values();

    const offRender = this.api.core.signals.on("render", 1000)(() => this.widget.render());

    const offKeyPress = this.api.core.events.on("input", -1000)(
      async (data) => {
        data.cancel = true;

        switch (data.key.name) {
          case "ESC":
            result = undefined;
            opened = false;
            break;
          case "ENTER": {
            result = [...this.buffer.chunks].join("");
            if (result) {
              opened = false;
            }
            break;
          }
          default:
            this.widget.children.editor.handleInput(data.key);
        }

        if (opened) {
          return;
        }

        offRender();
        offKeyPress();
      },
    );

    await this.api.core.loop(() => !opened);

    return result;
  }
}
