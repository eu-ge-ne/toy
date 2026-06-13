import * as kitty from "@libs/kitty";

import * as buffers from "@plugins/buffers";
import * as io from "@plugins/io";
import * as main from "@plugins/main";
import * as paletteModal from "@plugins/palette-modal";
import * as runtime from "@plugins/runtime";
import * as views from "@plugins/views";
import * as zen from "@plugins/zen";

const shortcuts: Record<
  string,
  (
    _: paletteModal.API & runtime.API & views.API & buffers.API & zen.API & main.API,
  ) => Promise<void>
> = {
  "F1": (x) => x.paletteModal.open(),
  "⇧F1": (x) => x.paletteModal.open(),
  "⌃F1": (x) => x.paletteModal.open(),
  "⌥F1": (x) => x.paletteModal.open(),
  "⌘F1": (x) => x.paletteModal.open(),
  "F2": (x) => x.main.save(),
  "F5": async (x) => x.view.toggleWhitespace(),
  "F6": async (x) => x.view.toggleWrap(),
  "F10": (x) => x.runtime.stop(),
  "F11": async (x) => x.zen.toggle(),
  "⌃A": async (x) => x.view.selectAll(),
  "⌘A": async (x) => x.view.selectAll(),
  "⌃Z": async (x) => x.buffer.undo(),
  "⌘Z": async (x) => x.buffer.undo(),
  "⌃Y": async (x) => x.buffer.redo(),
  "⌘Y": async (x) => x.buffer.redo(),
  "⌃C": async (x) => x.view.copy(),
  "⌘C": async (x) => x.view.copy(),
  "⌃X": async (x) => x.view.cut(),
  "⌘X": async (x) => x.view.cut(),
  "⌃V": async (x) => x.view.paste(),
  "⌘V": async (x) => x.view.paste(),
};

export function plugin(
  api: io.API & paletteModal.API & runtime.API & views.API & buffers.API & zen.API & main.API,
): void {
  api.io.events.on("key.press", -1000)(async (data) => {
    const entry = shortcuts[kitty.shortcut(data.key)];

    if (entry) {
      data.cancel = true;

      await entry(api);
    }
  });
}
