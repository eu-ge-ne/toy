import * as api from "@libs/api";
import * as plugins from "@libs/plugins";
import * as themes from "@libs/themes";

import { HeaderWidget } from "./widget.ts";

export default {
  init(api: api.Host): void {
    const widget = new HeaderWidget();

    api.doc.events.react("change.name", (x) => widget.fileName = x);
    api.theme.events.react("change", (x) => widget.setTheme(themes.Themes[x]));

    api.io.events.react("resize", () => {
      const { columns } = Deno.consoleSize();

      widget.resize(columns, 1, 0, 0);
    });

    api.io.events.react("render", () => {
      if (api.zen.enabled) {
        return;
      }

      widget.render();
    });

    api.doc.events.react(
      "change",
      ({ modified }) => widget.modified = modified,
    );
  },
} satisfies plugins.Plugin;
