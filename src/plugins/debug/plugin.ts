import * as api from "@libs/api";
import * as plugins from "@libs/plugins";
import * as std from "@libs/std";
import * as themes from "@libs/themes";

import { DebugWidget } from "./widget.ts";

export default class DebugPlugin extends plugins.Plugin {
  #widget = new DebugWidget();

  override init(api: api.Host): void {
    this.#widget.version = api.about.version;

    api.io.events.reactOrdered("render", 1000, () => this.#widget.render());
    api.theme.events.react(
      "change",
      (x) => this.#widget.setTheme(themes.Themes[x]),
    );

    api.io.events.react("resize", () => {
      const { columns, rows } = Deno.consoleSize();

      const w = std.clamp(30, 0, columns);
      const h = std.clamp(10, 0, rows);
      const y = api.zen.enabled() ? rows - h : rows - 1 - h;
      const x = columns - w;

      this.#widget.resize(w, h, y, x);
    });
  }

  override initDebug(): api.DebugAPI {
    return {
      toggle: () => {
        this.#widget.visible = !this.#widget.visible;
      },
      setRender: (x) => {
        this.#widget.renderElapsed = x;
      },
      setInput: (x) => {
        this.#widget.inputElapsed = x;
      },
    };
  }
}
