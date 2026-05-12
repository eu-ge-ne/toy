import * as api from "@libs/api";
import * as plugins from "@libs/plugins";
import * as std from "@libs/std";
import * as themes from "@libs/themes";

import { DebugWidget } from "./widget.ts";

let widget: DebugWidget;

export default {
  init(api: api.API): void {
    widget = new DebugWidget();

    widget.version = api.about.version;

    api.io.events.reactOrdered("render", 1000, () => widget.render());
    api.theme.events.react("change", (x) => widget.setTheme(themes.Themes[x]));

    api.io.events.react("resize", () => {
      const { columns, rows } = Deno.consoleSize();

      const w = std.clamp(30, 0, columns);
      const h = std.clamp(10, 0, rows);
      const y = api.zen.enabled ? rows - h : rows - 1 - h;
      const x = columns - w;

      widget.resize(w, h, y, x);
    });
  },
  initDebug(): api.DebugAPI {
    return {
      toggle(): void {
        widget.visible = !widget.visible;
      },
      setRender(x): void {
        widget.renderElapsed = x;
      },
      setInput(x): void {
        widget.inputElapsed = x;
      },
    };
  },
} satisfies plugins.Plugin;
