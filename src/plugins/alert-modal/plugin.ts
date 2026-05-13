import * as api from "@libs/api";
import * as plugins from "@libs/plugins";
import * as std from "@libs/std";
import * as themes from "@libs/themes";

import { AlertWidget } from "./widget.ts";

export default class AlertModalPlugin extends plugins.Plugin {
  #widget = new AlertWidget();

  override init(api: api.API): void {
    api.theme.events.react(
      "change",
      (x) => this.#widget.setTheme(themes.Themes[x]),
    );

    api.io.events.react("resize", () => {
      const { columns, rows } = Deno.consoleSize();

      const w = std.clamp(60, 0, columns);
      const h = std.clamp(10, 0, rows);
      const y = Math.trunc((rows - h) / 2);
      const x = Math.trunc((columns - w) / 2);

      this.#widget.resize(w, h, y, x);
    });
  }

  override initAlertModal(api: api.API): api.AlertModalAPI {
    return {
      open: async (message: string) => {
        this.#widget.open(message);

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

        await api.io.runLoop((ctx) => ctx.continue = this.#widget.opened);
      },
    };
  }
}
