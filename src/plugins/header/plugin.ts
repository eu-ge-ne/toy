import * as plugins from "@libs/plugins";
import * as themes from "@libs/themes";

import { HeaderWidget } from "./widget.ts";

export default {
  init(api: plugins.Api): void {
    const widget = new HeaderWidget();

    let visible = false;

    api.react("resize", () => {
      const { columns } = Deno.consoleSize();

      widget.resize(columns, 1, 0, 0);
    });

    api.react("render", () => {
      if (!visible) {
        return;
      }

      widget.render();
    });

    api.react("status.doc.name", (x) => widget.fileName = x);

    api.react(
      "status.doc.modified",
      ({ modified }) => widget.modified = modified,
    );

    api.react("theme.set", (name) => widget.setTheme(themes.Themes[name]));
    api.react("zen.toggle", () => visible = !visible);
  },
} satisfies plugins.Plugin;
