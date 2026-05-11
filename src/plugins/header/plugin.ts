import * as api from "@libs/api";
import * as plugins from "@libs/plugins";
import * as themes from "@libs/themes";

import { HeaderWidget } from "./widget.ts";

export default {
  init(api: api.Api): void {
    const widget = new HeaderWidget();

    let visible = false;

    api.io.events.react("resize", () => {
      const { columns } = Deno.consoleSize();

      widget.resize(columns, 1, 0, 0);
    });

    api.io.events.react("render", () => {
      if (!visible) {
        return;
      }

      widget.render();
    });

    api.doc.events.react("change.name", (x) => widget.fileName = x);

    api.doc.events.react(
      "change",
      ({ modified }) => widget.modified = modified,
    );

    api.react("theme.set", (name) => widget.setTheme(themes.Themes[name]));
    api.react("zen.toggle", () => visible = !visible);
  },
} satisfies plugins.Plugin;
