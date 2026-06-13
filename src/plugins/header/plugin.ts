import * as themes from "@libs/themes";
import * as plugins from "@plugins/plugins";

import { HeaderWidget } from "./widget.ts";

export function plugin(api: plugins.API): plugins.Result {
  const widget = new HeaderWidget();

  return {
    init(): void {
      api.buffer.signals.on("change.name")(() => widget.fileName = api.buffer.name);
      api.buffer.signals.on("change")(() => widget.modified = api.buffer.modified);
      api.theme.signals.on("change")((x) => widget.setTheme(themes.Themes[x]));

      api.io.signals.on("resize")(() => {
        const { columns } = Deno.consoleSize();

        widget.resize(columns, 1, 0, 0);
      });

      api.io.signals.on("render")(() => {
        if (api.zen.enabled) {
          return;
        }

        widget.render();
      });
    },
  };
}
