import * as buffers from "@libs/buffers";

import { BufferAPI } from "@plugins/buffer";
import { CoreAPI } from "@plugins/core";
import { DebugAPI } from "@plugins/debug";
import { FileAPI } from "@plugins/file";
import { ThemesAPI } from "@plugins/themes";
import { ViewAPI } from "@plugins/view";
import { ZenAPI } from "@plugins/zen";

import { OptionResult, options } from "./options.ts";
import { PaletteWidget } from "./widget.ts";

export type PaletteAPI = ReturnType<typeof PalettePlugin>;

export function PalettePlugin(...api: ConstructorParameters<typeof Palette>) {
  return {
    palette: new Palette(...api),
  };
}

class Palette {
  private readonly buffer = new buffers.Buffer();
  private readonly widget = new PaletteWidget(this.buffer);

  constructor(
    private readonly api:
      & CoreAPI
      & ViewAPI
      & BufferAPI
      & ThemesAPI
      & ZenAPI
      & FileAPI
      & DebugAPI,
  ) {
    api.core.signals.on("resize")(() => {
      const { columns, rows } = Deno.consoleSize();

      if (api.zen.enabled) {
        this.widget.resize(columns, rows, 0, 0);
      } else {
        this.widget.resize(columns, rows - 2, 1, 0);
      }
    });

    api.theme.signals.on("change")((x) => this.widget.setTheme(x));
  }

  async open(): Promise<void> {
    let opened = true;
    let result: OptionResult | undefined;

    this.buffer.text = "";
    this.widget.children.list.items = options;

    const offRender = this.api.core.signals.on("render", 1000)(() => this.widget.render());

    const offKeyPress = this.api.core.events.on("input", -1000)(
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
            this.widget.children.editor.handleInput(data.key);
            this.widget.filter();
        }

        if (opened) {
          return;
        }

        offRender();
        offKeyPress();
      },
    );

    await this.api.core.loop(() => {
      this.api.core.resize();

      return !opened;
    });

    if (typeof result !== "undefined") {
      await result(this.api);
    }
  }
}
