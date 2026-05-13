import * as api from "@libs/api";
import * as plugins from "@libs/plugins";
import * as themes from "@libs/themes";

import { HeaderWidget } from "./widget.ts";

export default class HeaderPlugin extends plugins.Plugin {
  #widget = new HeaderWidget();

  override init(api: api.API): void {
    api.doc.events.react("change.name", (x) => this.#widget.fileName = x);
    api.theme.events.react(
      "change",
      (x) => this.#widget.setTheme(themes.Themes[x]),
    );

    api.io.events.react("resize", () => {
      const { columns } = Deno.consoleSize();

      this.#widget.resize(columns, 1, 0, 0);
    });

    api.io.events.react("render", () => {
      if (api.zen.enabled()) {
        return;
      }

      this.#widget.render();
    });

    api.doc.events.react(
      "change",
      ({ modified }) => this.#widget.modified = modified,
    );
  }
}
