import * as api from "@libs/api";
import * as plugins from "@libs/plugins";
import * as std from "@libs/std";
import * as themes from "@libs/themes";

import { DebugWidget } from "./widget.ts";

let widget: DebugWidget;
let zen = true;

export default {
  init(api: api.Api): void {
    widget = new DebugWidget();

    api.intercept("start", async ({ version }) => {
      widget.version = version;
    });

    api.io.events.react("resize", () => {
      const { columns, rows } = Deno.consoleSize();

      const w = std.clamp(30, 0, columns);
      const h = std.clamp(10, 0, rows);
      const y = zen ? rows - h : rows - 1 - h;
      const x = columns - w;

      widget.resize(w, h, y, x);
    });

    api.io.events.reactOrdered("render", 1000, () => widget.render());
    api.react("theme.set", (name) => widget.setTheme(themes.Themes[name]));
    api.react("zen.toggle", () => zen = !zen);
  },
  debugApi(): api.DebugApi {
    return {
      toggle(): void {
        widget.visible = !widget.visible;
      },
      render(x): void {
        widget.renderElapsed = x;
      },
      input(x): void {
        widget.inputElapsed = x;
      },
    };
  },
} satisfies plugins.Plugin;
