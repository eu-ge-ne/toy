import * as kitty from "@libs/kitty";
import * as plugins from "@libs/plugins";

const shortcuts: Record<string, (_: plugins.Api) => Promise<void>> = {
  "F1": (api) => api.palette.open(),
  "⇧F1": (api) => api.palette.open(),
  "⌃F1": (api) => api.palette.open(),
  "⌥F1": (api) => api.palette.open(),
  "⌘F1": (api) => api.palette.open(),
  "F2": (api) => api.doc.save(),
  "F5": async (api) => api.doc.toggleWhitespace(),
  "F6": async (api) => api.doc.toggleWrap(),
  "F10": (api) => api.emitStop(),
  "F11": async (api) => api.emitToggleZen(),
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
  init(api: plugins.Api): void {
    api.interceptOrdered("key.press", -1000, async (data) => {
      const apiEntry = shortcuts[kitty.shortcut(data.key)];
      if (!apiEntry) {
        return;
      }

      data.cancel = true;

      await apiEntry(api);
    });
  },
} satisfies plugins.Plugin;
