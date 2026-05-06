import * as plugins from "@libs/plugins";
import * as std from "@libs/std";
import * as themes from "@libs/themes";

import { DebugWidget } from "./widget.ts";

export function register(host: plugins.Host): void {
  const widget = new DebugWidget();

  let zen = true;

  host.onReact("resize", () => {
    const { columns, rows } = Deno.consoleSize();

    const w = std.clamp(30, 0, columns);
    const h = std.clamp(10, 0, rows);
    const y = zen ? rows - h : rows - 1 - h;
    const x = columns - w;

    widget.resize(w, h, y, x);
  });

  host.onReact("render", () => widget.render(), 1000);
  host.onReact("debug.version", (x) => widget.version = x);
  host.onReact("debug.render", (x) => widget.renderElapsed = x);
  host.onReact("debug.input", (x) => widget.inputElapsed = x);

  host.onIntercept("command", async ({ cmd }) => {
    switch (cmd.name) {
      case "Zen":
        zen = !zen;
        host.resize();
        return;

      case "Debug":
        widget.visible = !widget.visible;
        return;

      case "Theme":
        widget.setTheme(themes.Themes[cmd.data]);
        return;
    }
  });
}
