import * as plugins from "@libs/plugins";
import * as std from "@libs/std";
import * as themes from "@libs/themes";

import { DebugWidget } from "./widget.ts";

export default {
  init(api: plugins.Api): void {
    const widget = new DebugWidget();

    let zen = true;

    api.onIntercept("start", async ({ version }) => {
      widget.version = version;
    });

    api.onReact("resize", () => {
      const { columns, rows } = Deno.consoleSize();

      const w = std.clamp(30, 0, columns);
      const h = std.clamp(10, 0, rows);
      const y = zen ? rows - h : rows - 1 - h;
      const x = columns - w;

      widget.resize(w, h, y, x);
    });

    api.onReact("render", () => widget.render(), 1000);
    api.onReact("debug.render", (x) => widget.renderElapsed = x);
    api.onReact("debug.input", (x) => widget.inputElapsed = x);

    api.onIntercept("command", async ({ cmd }) => {
      switch (cmd.name) {
        case "Zen":
          zen = !zen;
          return;

        case "Debug":
          widget.visible = !widget.visible;
          return;

        case "Theme":
          widget.setTheme(themes.Themes[cmd.data]);
          return;
      }
    });
  },
} satisfies plugins.Plugin;
