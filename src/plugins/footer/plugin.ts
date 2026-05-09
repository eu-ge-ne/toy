import * as plugins from "@libs/plugins";
import * as themes from "@libs/themes";

import { FooterWidget } from "./widget.ts";

export default {
  init(api: plugins.Api): void {
    const widget = new FooterWidget();

    let visible = false;

    api.onReact("resize", () => {
      const { columns, rows } = Deno.consoleSize();

      widget.resize(columns, 1, rows - 1, 0);
    });

    api.onReact("render", () => {
      if (!visible) {
        return;
      }

      widget.render();
    });

    api.onReact("status.doc.cursor", ({ ln, col }) => {
      widget.ln = ln;
      widget.col = col;
    });

    api.onReact(
      "status.doc.modified",
      ({ lineCount }) => widget.lineCount = lineCount,
    );

    api.onIntercept("command", async ({ cmd }) => {
      switch (cmd.name) {
        case "Zen":
          visible = !visible;
          return;

        case "Theme":
          widget.setTheme(themes.Themes[cmd.data]);
          return;
      }
    });
  },
} satisfies plugins.Plugin;
