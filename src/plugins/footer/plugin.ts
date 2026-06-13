import * as libThemes from "@libs/themes";

import { BufferAPI } from "@plugins/buffer";
import { IOAPI } from "@plugins/io";
import { ThemesAPI } from "@plugins/themes";
import { ViewAPI } from "@plugins/view";
import { ZenAPI } from "@plugins/zen";

import { FooterWidget } from "./widget.ts";

export function FooterPlugin(api: IOAPI & ThemesAPI & BufferAPI & ZenAPI & ViewAPI): void {
  const widget = new FooterWidget();

  api.theme.signals.on("change")((x) => widget.setTheme(libThemes.Themes[x]));
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
}
