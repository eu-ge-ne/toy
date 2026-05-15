import * as api from "@libs/api";
import * as plugins from "@libs/plugins";
import * as std from "@libs/std";
import * as themes from "@libs/themes";

import { DebugWidget } from "./widget.ts";

let widget: DebugWidget;

export default {
  init(host: api.Host): void {
    widget = new DebugWidget();

    widget.version = host.about.version;

    host.io.signals.on("render", 1000)(() => widget.render());
    host.theme.signals.on("change")((x) => widget.setTheme(themes.Themes[x]));

    host.io.signals.on("resize")(() => {
      const { columns, rows } = Deno.consoleSize();

      const w = std.clamp(30, 0, columns);
      const h = std.clamp(10, 0, rows);
      const y = host.zen.enabled ? rows - h : rows - 1 - h;
      const x = columns - w;

      widget.resize(w, h, y, x);
    });
  },
  initDebug(): api.Debug {
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
