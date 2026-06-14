import * as buffers from "@libs/buffers";
import * as libThemes from "@libs/themes";

import { BufferAPI } from "@plugins/buffer";
import { DebugAPI } from "@plugins/debug";
import { FileAPI } from "@plugins/file";
import { IOAPI } from "@plugins/io";
import { RuntimeAPI } from "@plugins/runtime";
import { ThemesAPI } from "@plugins/themes";
import { ViewAPI } from "@plugins/view";
import { ZenAPI } from "@plugins/zen";

import { OptionResult, options } from "./options.ts";
import { PaletteWidget } from "./widget.ts";

export type PaletteModalAPI = ReturnType<typeof PaletteModalPlugin>;

export function PaletteModalPlugin(...api: ConstructorParameters<typeof PaletteModal>) {
  return {
    paletteModal: new PaletteModal(...api),
  };
}

class PaletteModal {
  private readonly buffer = new buffers.Buffer();
  private readonly widget = new PaletteWidget(this.buffer);

  constructor(
    private readonly api:
      & IOAPI
      & ViewAPI
      & RuntimeAPI
      & BufferAPI
      & ThemesAPI
      & ZenAPI
      & FileAPI
      & DebugAPI,
  ) {
    api.theme.signals.on("change")((x) => this.widget.setTheme(libThemes.Themes[x]));

    api.io.signals.on("resize")(() => {
      const { columns, rows } = Deno.consoleSize();

      if (api.zen.enabled) {
        this.widget.resize(columns, rows, 0, 0);
      } else {
        this.widget.resize(columns, rows - 2, 1, 0);
      }
    });
  }

  async open(): Promise<void> {
    let opened = true;
    let result: OptionResult | undefined;

    this.buffer.text = "";
    this.widget.children.list.items = options;

    const offRender = this.api.io.signals.on("render", 1000)(() => this.widget.render());

    const offKeyPress = this.api.io.events.on("key.press", -1000)(
      async (data) => {
        data.cancel = true;

        switch (data.key.name) {
          case "ESC":
            result = undefined;
            opened = false;
            break;
          case "ENTER":
            result = this.widget.children.list.items[this.widget.children.list.index]?.value;
            opened = false;
            break;
          case "UP":
            if (this.widget.children.list.items.length > 0) {
              this.widget.children.list.index = Math.max(this.widget.children.list.index - 1, 0);
            }
            break;
          case "DOWN":
            if (this.widget.children.list.items.length > 0) {
              this.widget.children.list.index = Math.min(
                this.widget.children.list.index + 1,
                this.widget.children.list.items.length - 1,
              );
            }
            break;
          default:
            this.widget.children.editor.onKeyPress(data.key);
            this.widget.filter();
        }

        if (opened) {
          return;
        }

        offRender();
        offKeyPress();
      },
    );

    await this.api.io.loop(() => {
      this.api.io.resize();
      return !opened;
    });

    if (typeof result !== "undefined") {
      await result(this.api);
    }
  }
}
