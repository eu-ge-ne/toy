import * as api from "@libs/api";
import * as plugins from "@libs/plugins";
import * as std from "@libs/std";
import * as themes from "@libs/themes";

import { AlertWidget } from "./widget.ts";

export default class AlertModalPlugin extends plugins.Plugin {
  #widget = new AlertWidget();

  override init(host: api.API): void {
    host.theme.events.react(
      "change",
      (x) => this.#widget.setTheme(themes.Themes[x]),
    );

    host.io.events.react("resize", () => {
      const { columns, rows } = Deno.consoleSize();

      const w = std.clamp(60, 0, columns);
      const h = std.clamp(10, 0, rows);
      const y = Math.trunc((rows - h) / 2);
      const x = Math.trunc((columns - w) / 2);

      this.#widget.resize(w, h, y, x);
    });
  }

  override initAlertModal(host: api.API): api.AlertModalAPI {
    const plugin = this;

    return new class extends api.AlertModalAPI {
      async open(message: string): Promise<void> {
        plugin.#widget.open(message);

        const offRender = host.io.events.reactOrdered(
          "render",
          1000,
          () => plugin.#widget.render(),
        );

        const offKeyPress = host.io.events.interceptOrdered(
          "key.press",
          -1000,
          async (data) => {
            data.cancel = true;

            plugin.#widget.onKeyPress(data.key);
            if (plugin.#widget.opened) {
              return;
            }

            offRender();
            offKeyPress();
          },
        );

        await host.io.runLoop((ctx) => ctx.continue = plugin.#widget.opened);
      }
    }();
  }
}
