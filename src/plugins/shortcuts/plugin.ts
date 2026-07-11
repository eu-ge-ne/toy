import * as kitty from "@libs/kitty";

import * as buffer from "@plugins/buffer";
import * as core from "@plugins/core";
import * as file from "@plugins/file";
import * as palette from "@plugins/palette";
import * as view from "@plugins/view";
import * as zen from "@plugins/zen";

const shortcuts: Record<
  string,
  (_: core.API & palette.API & view.API & buffer.API & zen.API & file.API) => Promise<void>
> = {
  "F1": (x) => x.palette.open(),
  "⇧F1": (x) => x.palette.open(),
  "⌃F1": (x) => x.palette.open(),
  "⌥F1": (x) => x.palette.open(),
  "⌘F1": (x) => x.palette.open(),
  "F2": (x) => x.file.save(),
  "F5": async (x) => x.view.toggleWhitespace(),
  "F6": async (x) => x.view.toggleWrap(),
  "F10": (x) => x.core.stop(),
  "F11": async (x) => x.zen.toggle(),
  "⌃A": async (x) => x.view.selectAll(),
  "⌘A": async (x) => x.view.selectAll(),
  "⌃Z": async (x) => x.buffer.undoHistory(),
  "⌘Z": async (x) => x.buffer.undoHistory(),
  "⌃Y": async (x) => x.buffer.redoHistory(),
  "⌘Y": async (x) => x.buffer.redoHistory(),
  "⌃C": async (x) => x.view.copy(),
  "⌘C": async (x) => x.view.copy(),
  "⌃X": async (x) => x.view.cut(),
  "⌘X": async (x) => x.view.cut(),
  "⌃V": async (x) => x.view.paste(),
  "⌘V": async (x) => x.view.paste(),
};

export function Plugin(
  api: core.API & palette.API & view.API & buffer.API & zen.API & file.API,
): void {
  api.core.events.on("input", -1000)(async (data) => {
    const entry = shortcuts[kitty.shortcut(data.key)];

    if (entry) {
      data.cancel = true;

      await entry(api);
    }
  });
}
