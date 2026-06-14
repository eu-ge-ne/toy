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

  const updateModified = () => widget.modified = api.buffer.modified;
  api.buffer.signals.on("history.push")(updateModified);
  api.buffer.signals.on("history.undo")(updateModified);
  api.buffer.signals.on("history.redo")(updateModified);
  api.buffer.signals.on("history.reset")(updateModified);

  api.theme.signals.on("change")((x) => widget.setTheme(x));
}
