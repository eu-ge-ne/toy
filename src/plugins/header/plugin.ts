import * as plugins from "@libs/plugins";
import * as themes from "@libs/themes";

import { HeaderWidget } from "./widget.ts";

export default {
  init(api: plugins.Api): void {
    const widget = new HeaderWidget();

    let visible = false;

    api.onReact("resize", () => {
      const { columns } = Deno.consoleSize();

      widget.resize(columns, 1, 0, 0);
    });

    api.onReact("render", () => {
      if (!visible) {
        return;
      }

      widget.render();
    });

    api.onReact("status.doc.name", (fileName) => widget.fileName = fileName);

    api.onReact(
      "status.doc.modified",
      ({ modified }) => widget.modified = modified,
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
