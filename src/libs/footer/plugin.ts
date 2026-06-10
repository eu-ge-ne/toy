import * as plugins from "@libs/plugins";
import * as themes from "@libs/themes";

import { FooterWidget } from "./widget.ts";

export default plugins.create((api: plugins.API) => {
  const widget = new FooterWidget();

  return {
    init(): void {
      api.theme.signals.on("change")((x) => widget.setTheme(themes.Themes[x]));
      api.buffer.signals.on("change")(() => widget.lineCount = api.buffer.lineCount);

      api.io.signals.on("resize")(() => {
        const { columns, rows } = Deno.consoleSize();

        widget.resize(columns, 1, rows - 1, 0);
      });

      api.io.signals.on("render")(() => {
        if (api.zen.enabled) {
          return;
        }

        widget.render();
      });

      api.view.signals.on("change.cursor")(({ ln, col }) => {
        widget.ln = ln;
        widget.col = col;
      });
    },
  };
});
