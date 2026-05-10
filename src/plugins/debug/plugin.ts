import * as plugins from "@libs/plugins";
import * as std from "@libs/std";
import * as themes from "@libs/themes";

import { DebugWidget } from "./widget.ts";

let widget: DebugWidget;

export default {
  init(api: plugins.Api): void {
    widget = new DebugWidget();

    let zen = true;

    api.intercept("start", async ({ version }) => {
      widget.version = version;
    });

    api.react("resize", () => {
      const { columns, rows } = Deno.consoleSize();

      const w = std.clamp(30, 0, columns);
      const h = std.clamp(10, 0, rows);
      const y = zen ? rows - h : rows - 1 - h;
      const x = columns - w;

      widget.resize(w, h, y, x);
    });

    api.reactOrdered("render", 1000, () => widget.render());
    api.react("debug.render", (x) => widget.renderElapsed = x);
    api.react("debug.key.press", (x) => widget.inputElapsed = x);

    api.intercept("command", async ({ cmd }) => {
      switch (cmd.name) {
        case "Theme":
          widget.setTheme(themes.Themes[cmd.data]);
          return;
      }
    });

    api.react("zen.toggle", () => zen = !zen);
  },
  initDebug(): plugins.Debug {
    return {
      toggle(): void {
        widget.visible = !widget.visible;
      },
    };
  },
} satisfies plugins.Plugin;
