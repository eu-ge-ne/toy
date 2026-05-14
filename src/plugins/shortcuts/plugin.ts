import * as api from "@libs/api";
import * as kitty from "@libs/kitty";
import * as plugins from "@libs/plugins";

const shortcuts: Record<string, (_: api.Host) => Promise<void>> = {
  "F1": (api) => api.paletteModal.open(),
  "⇧F1": (api) => api.paletteModal.open(),
  "⌃F1": (api) => api.paletteModal.open(),
  "⌥F1": (api) => api.paletteModal.open(),
  "⌘F1": (api) => api.paletteModal.open(),
  "F2": (api) => api.doc.save(),
  "F5": async (api) => api.doc.toggleWhitespace(),
  "F6": async (api) => api.doc.toggleWrap(),
  "F10": (api) => api.runtime.stop(),
  "F11": async (api) => api.zen.toggle(),
  "⌃A": async (api) => api.doc.selectAll(),
  "⌘A": async (api) => api.doc.selectAll(),
  "⌃Z": async (api) => api.doc.undo(),
  "⌘Z": async (api) => api.doc.undo(),
  "⌃Y": async (api) => api.doc.redo(),
  "⌘Y": async (api) => api.doc.redo(),
  "⌃C": async (api) => api.doc.copy(),
  "⌘C": async (api) => api.doc.copy(),
  "⌃X": async (api) => api.doc.cut(),
  "⌘X": async (api) => api.doc.cut(),
  "⌃V": async (api) => api.doc.paste(),
  "⌘V": async (api) => api.doc.paste(),
};

export default {
  init(host: api.Host): void {
    host.io.events.interceptOrdered("key.press", -1000, async (data) => {
      const entry = shortcuts[kitty.shortcut(data.key)];

      if (entry) {
        data.cancel = true;

        await entry(host);
      }
    });
  },
} satisfies plugins.Plugin;
