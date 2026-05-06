import * as plugins from "@libs/plugins";
import * as themes from "@libs/themes";

import { FooterWidget } from "./widget.ts";

export function register(host: plugins.Host): void {
  const widget = new FooterWidget();

  let disabled = true;

  host.onReact("resize", () => {
    const { columns, rows } = Deno.consoleSize();

    widget.resize(columns, 1, rows - 1, 0);
  });

  host.onReact("render", () => {
    if (disabled) {
      return;
    }

    widget.render();
  });

  host.onReact("status.doc.cursor", ({ ln, col }) => {
    widget.ln = ln;
    widget.col = col;
  });

  host.onReact(
    "status.doc.modified",
    ({ lineCount }) => widget.lineCount = lineCount,
  );

  host.onIntercept("command", async ({ cmd }) => {
    switch (cmd.name) {
      case "Zen":
        disabled = !disabled;
        host.resize();
        return;

      case "Theme":
        widget.setTheme(themes.Themes[cmd.data]);
        return;
    }
  });
}
