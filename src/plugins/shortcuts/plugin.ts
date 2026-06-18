import * as kitty from "@libs/kitty";

import { BufferAPI } from "@plugins/buffer";
import { CoreAPI } from "@plugins/core";
import { FileAPI } from "@plugins/file";
import { PaletteAPI } from "@plugins/palette";
import { ViewAPI } from "@plugins/view";
import { ZenAPI } from "@plugins/zen";

const shortcuts: Record<
  string,
  (_: CoreAPI & PaletteAPI & ViewAPI & BufferAPI & ZenAPI & FileAPI) => Promise<void>
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

export function ShortcutsPlugin(
  api: CoreAPI & PaletteAPI & ViewAPI & BufferAPI & ZenAPI & FileAPI,
): void {
  api.core.events.on("input", -1000)(async (data) => {
    const entry = shortcuts[kitty.shortcut(data.key)];

    if (entry) {
      data.cancel = true;

      await entry(api);
    }
  });
}
