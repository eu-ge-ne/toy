import * as api from "@libs/api";
import * as plugins from "@libs/plugins";
import * as themes from "@libs/themes";

import { HeaderWidget } from "./widget.ts";

export default {
  init(host: api.Host): void {
    const widget = new HeaderWidget();

    host.doc.events.react("change.name", (x) => widget.fileName = x);
    host.theme.events.react("change", (x) => widget.setTheme(themes.Themes[x]));

    host.io.events.react("resize", () => {
      const { columns } = Deno.consoleSize();

      widget.resize(columns, 1, 0, 0);
    });

    host.io.events.react("render", () => {
      if (host.zen.enabled) {
        return;
      }

      widget.render();
    });

    host.doc.events.react(
      "change",
      ({ modified }) => widget.modified = modified,
    );
  },
} satisfies plugins.Plugin;
