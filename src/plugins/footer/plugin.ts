import * as libThemes from "@libs/themes";

import { BufferAPI } from "@plugins/buffer";
import { IOAPI } from "@plugins/io";
import * as themes from "@plugins/themes";
import * as views from "@plugins/views";
import * as zen from "@plugins/zen";

import { FooterWidget } from "./widget.ts";

export function FooterPlugin(api: IOAPI & themes.API & BufferAPI & zen.API & views.API): void {
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
