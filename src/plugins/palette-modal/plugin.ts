import * as api from "@libs/api";
import * as plugins from "@libs/plugins";
import * as themes from "@libs/themes";

import { PaletteWidget } from "./widget.ts";

export default class PaletteModalPlugin extends plugins.Plugin {
  #widget = new PaletteWidget();

  override init(api: api.API): void {
    api.theme.events.react(
      "change",
      (x) => this.#widget.setTheme(themes.Themes[x]),
    );

    api.io.events.react("resize", () => {
      const { columns, rows } = Deno.consoleSize();

      if (api.zen.enabled()) {
        this.#widget.resize(columns, rows, 0, 0);
      } else {
        this.#widget.resize(columns, rows - 2, 1, 0);
      }
    });
  }

  override initPaletteModal(api: api.API): api.PaletteModalAPI {
    return {
      open: async () => {
        this.#widget.open();

        const offRender = api.io.events.reactOrdered(
          "render",
          1000,
          () => this.#widget.render(),
        );

        const offKeyPress = api.io.events.interceptOrdered(
          "key.press",
          -1000,
          async (data) => {
            data.cancel = true;

            this.#widget.onKeyPress(data.key);
            if (this.#widget.opened) {
              return;
            }

            offRender();
            offKeyPress();
          },
        );

        await api.io.runLoop((ctx) => {
          ctx.continue = this.#widget.opened;
          ctx.layoutChanged = true;
        });

        if (typeof this.#widget.result !== "undefined") {
          await this.#widget.result(api);
        }
      },
    };
  }
}
