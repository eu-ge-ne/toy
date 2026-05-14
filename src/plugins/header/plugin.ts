import * as api from "@libs/api";
import * as plugins from "@libs/plugins";
import * as themes from "@libs/themes";

import { HeaderWidget } from "./widget.ts";

export default {
  init(host: api.Host): void {
    const widget = new HeaderWidget();

    host.doc.signals.on("change.name", (x) => widget.fileName = x);
    host.theme.signals.on("change", (x) => widget.setTheme(themes.Themes[x]));

    host.io.signals.on("resize", () => {
      const { columns } = Deno.consoleSize();

      widget.resize(columns, 1, 0, 0);
    });

    host.io.signals.on("render", () => {
      if (host.zen.enabled) {
        return;
      }

      widget.render();
    });

    host.doc.signals.on(
      "change",
      ({ modified }) => widget.modified = modified,
    );
  },
} satisfies plugins.Plugin;
