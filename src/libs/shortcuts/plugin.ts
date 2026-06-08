import * as api from "@libs/api";
import * as kitty from "@libs/kitty";
import * as plugins from "@libs/plugins";

const shortcuts: Record<string, (_: api.Toy) => Promise<void>> = {
  "F1": (x) => x.paletteModal.open(),
  "⇧F1": (x) => x.paletteModal.open(),
  "⌃F1": (x) => x.paletteModal.open(),
  "⌥F1": (x) => x.paletteModal.open(),
  "⌘F1": (x) => x.paletteModal.open(),
  "F2": (x) => x.runtime.save(),
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

export const plugin = {
  init(toy: api.Toy): void {
    toy.io.events.on("key.press", -1000)(async (data) => {
      const entry = shortcuts[kitty.shortcut(data.key)];

      if (entry) {
        data.cancel = true;

        await entry(toy);
      }
    });
  },
} satisfies plugins.Plugin;
