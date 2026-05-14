import * as api from "@libs/api";
import * as plugins from "@libs/plugins";
import * as themes from "@libs/themes";

import { FooterWidget } from "./widget.ts";

export default {
  init(api: api.Host): void {
    const widget = new FooterWidget();

    api.theme.events.react("change", (x) => widget.setTheme(themes.Themes[x]));

    api.io.events.react("resize", () => {
      const { columns, rows } = Deno.consoleSize();

      widget.resize(columns, 1, rows - 1, 0);
    });

    api.io.events.react("render", () => {
      if (api.zen.enabled) {
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
  },
} satisfies plugins.Plugin;
