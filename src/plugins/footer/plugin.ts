import * as api from "@libs/api";
import * as plugins from "@libs/plugins";
import * as themes from "@libs/themes";

import { FooterWidget } from "./widget.ts";

export default {
  init(host: api.Host): void {
    const widget = new FooterWidget();

    host.theme.signals.on("change")((x) => widget.setTheme(themes.Themes[x]));
    host.doc.signals.on("change")(({ lineCount }) => widget.lineCount = lineCount);

    host.io.signals.on("resize")(() => {
      const { columns, rows } = Deno.consoleSize();

      widget.resize(columns, 1, rows - 1, 0);
    });

    host.io.signals.on("render")(() => {
      if (host.zen.enabled) {
        return;
      }

      widget.render();
    });

    host.cursor.signals.on("change")(({ ln, col }) => {
      widget.ln = ln;
      widget.col = col;
    });
  },
} satisfies plugins.Plugin;
