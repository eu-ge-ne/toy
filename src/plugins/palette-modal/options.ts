import * as buffers from "@plugins/buffers";
import * as debug from "@plugins/debug";
import * as main from "@plugins/main";
import * as runtime from "@plugins/runtime";
import * as themes from "@plugins/themes";
import * as views from "@plugins/views";
import * as zen from "@plugins/zen";

export class Option<T> {
  constructor(
    public readonly name: string,
    public readonly value: T,
    public readonly shortcuts: string[] = [],
  ) {
  }

  label(width: number): string {
    const shortcuts = this.shortcuts.join(" ");
    const w = width - shortcuts.length;
    return this.name.slice(0, w).padEnd(w, " ") + shortcuts;
  }
}

export const options: Option<
  (
    _:
      & views.API
      & debug.API
      & runtime.API
      & views.API
      & buffers.API
      & themes.API
      & zen.API
      & main.API,
  ) => Promise<void>
>[] = [
  new Option(
    "Edit: Copy",
    async (api: views.API) => api.view.copy(),
    ["⌃C", "⌘C"],
  ),
  new Option(
    "Edit: Cut",
    async (api: views.API) => api.view.cut(),
    ["⌃X", "⌘X"],
  ),
  new Option(
    "Global: Toggle Debug Panel",
    async (api: debug.API) => api.debug.toggle(),
  ),
  new Option(
    "Global: Exit",
    (api: runtime.API) => api.runtime.stop(),
    ["F10"],
  ),
  new Option(
    "Edit: Select All",
    async (api: views.API) => api.view.selectAll(),
    ["⌃A", "⌘A"],
  ),
  new Option(
    "Edit: Paste",
    async (api: views.API) => api.view.paste(),
    ["⌃V", "⌘V"],
  ),
  new Option(
    "Edit: Redo",
    async (api: buffers.API) => api.buffer.redo(),
    ["⌃Y", "⌘Y"],
  ),
  new Option(
    "Global: Save",
    async (api: main.API) => api.main.save(),
    ["F2"],
  ),
  new Option(
    "Theme: Base16",
    async (api: themes.API) => api.theme.set("Base16"),
  ),
  new Option(
    "Theme: Slate",
    async (api: themes.API) => api.theme.set("Slate"),
  ),
  new Option(
    "Theme: Gray",
    async (api: themes.API) => api.theme.set("Gray"),
  ),
  new Option(
    "Theme: Zinc",
    async (api: themes.API) => api.theme.set("Zinc"),
  ),
  new Option(
    "Theme: Neutral",
    async (api: themes.API) => api.theme.set("Neutral"),
  ),
  new Option(
    "Theme: Stone",
    async (api: themes.API) => api.theme.set("Stone"),
  ),
  new Option(
    "Theme: Taupe",
    async (api: themes.API) => api.theme.set("Taupe"),
  ),
  new Option(
    "Theme: Mauve",
    async (api: themes.API) => api.theme.set("Mauve"),
  ),
  new Option(
    "Theme: Mist",
    async (api: themes.API) => api.theme.set("Mist"),
  ),
  new Option(
    "Theme: Olive",
    async (api: themes.API) => api.theme.set("Olive"),
  ),
  new Option(
    "Edit: Undo",
    async (api: buffers.API) => api.buffer.undo(),
    ["⌃Z", "⌘Z"],
  ),
  new Option(
    "View: Toggle Render Whitespace",
    async (api: views.API) => api.view.toggleWhitespace(),
    ["F5"],
  ),
  new Option(
    "View: Toggle Line Wrap",
    async (api: views.API) => api.view.toggleWrap(),
    ["F6"],
  ),
  new Option(
    "Global: Toggle Zen Mode",
    async (api: zen.API) => api.zen.toggle(),
    ["F11"],
  ),
].sort((a, b) => a.name.localeCompare(b.name));
