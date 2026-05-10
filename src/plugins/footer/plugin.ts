import * as plugins from "@libs/plugins";
import * as themes from "@libs/themes";

import { FooterWidget } from "./widget.ts";

export default {
  init(api: plugins.Api): void {
    const widget = new FooterWidget();

    let visible = false;

    api.react("resize", () => {
      const { columns, rows } = Deno.consoleSize();

      widget.resize(columns, 1, rows - 1, 0);
    });

    api.react("render", () => {
      if (!visible) {
        return;
      }

      widget.render();
    });

    api.react("status.doc.cursor", ({ ln, col }) => {
      widget.ln = ln;
      widget.col = col;
    });

    api.react(
      "status.doc.modified",
      ({ lineCount }) => widget.lineCount = lineCount,
    );

    api.intercept("command", async ({ cmd }) => {
      switch (cmd.name) {
        case "Theme":
          widget.setTheme(themes.Themes[cmd.data]);
          return;
      }
    });

    api.react("zen.toggle", () => visible = !visible);
  },
} satisfies plugins.Plugin;
