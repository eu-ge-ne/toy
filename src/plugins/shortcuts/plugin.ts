import * as api from "@libs/api";
import * as kitty from "@libs/kitty";
import * as plugins from "@libs/plugins";

const shortcuts: Record<string, (_: api.Host) => Promise<void>> = {
  "F1": (x) => x.paletteModal.open(),
  "⇧F1": (x) => x.paletteModal.open(),
  "⌃F1": (x) => x.paletteModal.open(),
  "⌥F1": (x) => x.paletteModal.open(),
  "⌘F1": (x) => x.paletteModal.open(),
  "F2": (x) => x.doc.save(),
  "F5": async (x) => x.doc.toggleWhitespace(),
  "F6": async (x) => x.doc.toggleWrap(),
  "F10": (x) => x.runtime.stop(),
  "F11": async (x) => x.zen.toggle(),
  "⌃A": async (x) => x.doc.selectAll(),
  "⌘A": async (x) => x.doc.selectAll(),
  "⌃Z": async (x) => x.doc.undo(),
  "⌘Z": async (x) => x.doc.undo(),
  "⌃Y": async (x) => x.doc.redo(),
  "⌘Y": async (x) => x.doc.redo(),
  "⌃C": async (x) => x.doc.copy(),
  "⌘C": async (x) => x.doc.copy(),
  "⌃X": async (x) => x.doc.cut(),
  "⌘X": async (x) => x.doc.cut(),
  "⌃V": async (x) => x.doc.paste(),
  "⌘V": async (x) => x.doc.paste(),
};

export default {
  init(host: api.Host): void {
    host.io.events.on("key.press", -1000)(async (data) => {
      const entry = shortcuts[kitty.shortcut(data.key)];

      if (entry) {
        data.cancel = true;

        await entry(host);
      }
    });
  },
} satisfies plugins.Plugin;
