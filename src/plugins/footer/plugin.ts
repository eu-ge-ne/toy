import { BufferAPI } from "@plugins/buffer";
import { CoreAPI } from "@plugins/core";
import { ThemesAPI } from "@plugins/themes";
import { ViewAPI } from "@plugins/view";
import { ZenAPI } from "@plugins/zen";

import { FooterWidget } from "./widget.ts";

export function FooterPlugin(api: CoreAPI & ThemesAPI & BufferAPI & ZenAPI & ViewAPI): void {
  const widget = new FooterWidget();

  api.core.signals.on("resize")(() => {
    const { columns, rows } = Deno.consoleSize();

    widget.resize(columns, 1, rows - 1, 0);
  });

  api.core.signals.on("render")(() => {
    if (api.zen.enabled) {
      return;
    }

    widget.render();
  });

  api.theme.signals.on("change")((x) => widget.setTheme(x));

  const updateLineCount = () => widget.lineCount = api.buffer.lineCount;
  api.buffer.signals.on("history.push")(updateLineCount);
  api.buffer.signals.on("history.undo")(updateLineCount);
  api.buffer.signals.on("history.redo")(updateLineCount);
  api.buffer.signals.on("history.reset")(updateLineCount);

  api.view.signals.on("change.cursor")(({ ln, col }) => {
    widget.ln = ln;
    widget.col = col;
  });
}
