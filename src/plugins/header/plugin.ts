import * as plugins from "@libs/plugins";
import * as themes from "@libs/themes";

import { HeaderWidget } from "./widget.ts";

export function register(host: plugins.Host): void {
  const widget = new HeaderWidget();

  let disabled = true;

  host.onReact("resize", () => {
    const { columns } = Deno.consoleSize();

    widget.resize(columns, 1, 0, 0);
  });

  host.onReact("render", () => {
    if (disabled) {
      return;
    }

    widget.render();
  });

  host.onReact("status.doc.name", (fileName) => widget.fileName = fileName);

  host.onReact(
    "status.doc.modified",
    ({ modified }) => widget.modified = modified,
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
