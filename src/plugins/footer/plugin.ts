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

  api.buffer.signals.on("buffer.change")(() => widget.lineCount = api.buffer.lineCount);

  api.view.cursor.signals.on("cursor.change")(() => {
    widget.pos = api.view.cursor.pos;
    widget.from = api.view.cursor.from;
    widget.to = api.view.cursor.to;
  });
}
