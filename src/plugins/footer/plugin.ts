import * as api from "@libs/api";
import * as plugins from "@libs/plugins";
import * as themes from "@libs/themes";

import { FooterWidget } from "./widget.ts";

export default {
  init(api: api.Api): void {
    const widget = new FooterWidget();

    let visible = false;

    api.io.events.react("resize", () => {
      const { columns, rows } = Deno.consoleSize();

      widget.resize(columns, 1, rows - 1, 0);
    });

    api.io.events.react("render", () => {
      if (!visible) {
        return;
      }

      widget.render();
    });

    api.cursor.events.react("change", ({ ln, col }) => {
      widget.ln = ln;
      widget.col = col;
    });

    api.doc.events.react(
      "change",
      ({ lineCount }) => widget.lineCount = lineCount,
    );

    api.react("theme.set", (name) => widget.setTheme(themes.Themes[name]));
    api.react("zen.toggle", () => visible = !visible);
  },
} satisfies plugins.Plugin;
