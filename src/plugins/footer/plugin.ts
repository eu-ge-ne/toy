import * as api from "@libs/api";
import * as plugins from "@libs/plugins";
import * as themes from "@libs/themes";

import { FooterWidget } from "./widget.ts";

export default class FooterPlugin extends plugins.Plugin {
  #widget = new FooterWidget();

  override init(api: api.Host): void {
    api.theme.events.react(
      "change",
      (x) => this.#widget.setTheme(themes.Themes[x]),
    );

    api.io.events.react("resize", () => {
      const { columns, rows } = Deno.consoleSize();

      this.#widget.resize(columns, 1, rows - 1, 0);
    });

    api.io.events.react("render", () => {
      if (api.zen.enabled()) {
        return;
      }

      this.#widget.render();
    });

    api.cursor.events.react("change", ({ ln, col }) => {
      this.#widget.ln = ln;
      this.#widget.col = col;
    });

    api.doc.events.react(
      "change",
      ({ lineCount }) => this.#widget.lineCount = lineCount,
    );
  }
}
