import * as api from "@libs/api";
import * as plugins from "@libs/plugins";
import * as themes from "@libs/themes";

import { HeaderWidget } from "./widget.ts";

export default {
  init(toy: api.Toy): void {
    const widget = new HeaderWidget();

    toy.doc.signals.on("change.name")((x) => widget.fileName = x);
    toy.theme.signals.on("change")((x) => widget.setTheme(themes.Themes[x]));
    toy.doc.signals.on("change")(({ modified }) => widget.modified = modified);

    toy.io.signals.on("resize")(() => {
      const { columns } = Deno.consoleSize();

      widget.resize(columns, 1, 0, 0);
    });

    toy.io.signals.on("render")(() => {
      if (toy.zen.enabled) {
        return;
      }

      widget.render();
    });
  },
} satisfies plugins.Plugin;
