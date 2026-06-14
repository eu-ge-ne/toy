import * as themes from "@libs/themes";

import { BufferAPI } from "@plugins/buffer";
import { IOAPI } from "@plugins/io";
import { ThemesAPI } from "@plugins/themes";
import { ZenAPI } from "@plugins/zen";

import { HeaderWidget } from "./widget.ts";

export function HeaderPlugin(api: BufferAPI & ThemesAPI & IOAPI & ZenAPI): void {
  const widget = new HeaderWidget();

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
}
