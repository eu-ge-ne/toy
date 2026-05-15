import * as api from "@libs/api";
import * as plugins from "@libs/plugins";
import * as themes from "@libs/themes";

import { FooterWidget } from "./widget.ts";

export default {
  init(toy: api.Toy): void {
    const widget = new FooterWidget();

    toy.theme.signals.on("change")((x) => widget.setTheme(themes.Themes[x]));
    toy.doc.signals.on("change")(({ lineCount }) => widget.lineCount = lineCount);

    toy.io.signals.on("resize")(() => {
      const { columns, rows } = Deno.consoleSize();

      widget.resize(columns, 1, rows - 1, 0);
    });

    toy.io.signals.on("render")(() => {
      if (toy.zen.enabled) {
        return;
      }

      widget.render();
    });

    toy.cursor.signals.on("change")(({ ln, col }) => {
      widget.ln = ln;
      widget.col = col;
    });
  },
} satisfies plugins.Plugin;
