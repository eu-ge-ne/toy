import * as libThemes from "@libs/themes";

import { BufferAPI } from "@plugins/buffer";
import { IOAPI } from "@plugins/io";
import * as themes from "@plugins/themes";
import * as zen from "@plugins/zen";

import { HeaderWidget } from "./widget.ts";

export function HeaderPlugin(api: BufferAPI & themes.API & IOAPI & zen.API): void {
  const widget = new HeaderWidget();

  api.buffer.signals.on("change.name")(() => widget.fileName = api.buffer.name);
  api.buffer.signals.on("change")(() => widget.modified = api.buffer.modified);
  api.theme.signals.on("change")((x) => widget.setTheme(libThemes.Themes[x]));

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
}
