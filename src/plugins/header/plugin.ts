import * as themes from "@libs/themes";

import { BufferAPI } from "@plugins/buffer";
import { CoreAPI } from "@plugins/core";
import { ThemesAPI } from "@plugins/themes";
import { ZenAPI } from "@plugins/zen";

import { HeaderWidget } from "./widget.ts";

export function HeaderPlugin(api: CoreAPI & BufferAPI & ThemesAPI & ZenAPI): void {
  const widget = new HeaderWidget();

  api.core.signals.on("resize")(() => {
    const { columns } = Deno.consoleSize();

    widget.resize(columns, 1, 0, 0);
  });

  api.core.signals.on("render")(() => {
    if (api.zen.enabled) {
      return;
    }

    widget.render();
  });

  api.buffer.signals.on("change.name")(() => widget.fileName = api.buffer.name);
  api.buffer.signals.on("change")(() => widget.modified = api.buffer.modified);
  api.theme.signals.on("change")((x) => widget.setTheme(themes.Themes[x]));
}
