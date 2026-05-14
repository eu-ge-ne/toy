import * as api from "@libs/api";
import * as plugins from "@libs/plugins";
import * as themes from "@libs/themes";

import { FooterWidget } from "./widget.ts";

export default {
  init(host: api.Host): void {
    const widget = new FooterWidget();

    host.theme.events.react("change", (x) => widget.setTheme(themes.Themes[x]));

    host.io.events.react("resize", () => {
      const { columns, rows } = Deno.consoleSize();

      widget.resize(columns, 1, rows - 1, 0);
    });

    host.io.events.react("render", () => {
      if (host.zen.enabled) {
        return;
      }

      widget.render();
    });

    host.cursor.events.react("change", ({ ln, col }) => {
      widget.ln = ln;
      widget.col = col;
    });

    host.doc.events.react(
      "change",
      ({ lineCount }) => widget.lineCount = lineCount,
    );
  },
} satisfies plugins.Plugin;
