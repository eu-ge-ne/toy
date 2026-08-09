import * as buffer from "@plugins/buffer";
import * as core from "@plugins/core";
import * as themes from "@plugins/themes";
import * as zen from "@plugins/zen";

import { HeaderWidget } from "./widget.ts";

export function Plugin(
  api: core.API & buffer.API & themes.API & zen.API,
): void {
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

  api.buffer.signals.on("name.change")(() => widget.fileName = api.buffer.name);

  api.buffer.signals.on("history.reset")(updateModified);
  api.buffer.signals.on("history.undo")(updateModified);
  api.buffer.signals.on("history.redo")(updateModified);
  api.buffer.signals.on("history.push")(updateModified);

  api.theme.signals.on("change")((x) => widget.setTheme(x));

  function updateModified(): void {
    widget.modified = api.buffer.modified;
  }
}
