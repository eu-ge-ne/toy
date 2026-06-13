import * as plugins from "@libs/plugins";

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

export const options: Option<(_: plugins.API) => Promise<void>>[] = [
  new Option(
    "Edit: Copy",
    async (api: plugins.API) => api.view.copy(),
    ["⌃C", "⌘C"],
  ),
  new Option(
    "Edit: Cut",
    async (api: plugins.API) => api.view.cut(),
    ["⌃X", "⌘X"],
  ),
  new Option(
    "Global: Toggle Debug Panel",
    async (api: plugins.API) => api.debug.toggle(),
  ),
  new Option(
    "Global: Exit",
    (api: plugins.API) => api.runtime.stop(),
    ["F10"],
  ),
  new Option(
    "Edit: Select All",
    async (api: plugins.API) => api.view.selectAll(),
    ["⌃A", "⌘A"],
  ),
  new Option(
    "Edit: Paste",
    async (api: plugins.API) => api.view.paste(),
    ["⌃V", "⌘V"],
  ),
  new Option(
    "Edit: Redo",
    async (api: plugins.API) => api.buffer.redo(),
    ["⌃Y", "⌘Y"],
  ),
  new Option(
    "Global: Save",
    async (api: plugins.API) => api.runtime.save(),
    ["F2"],
  ),
  new Option(
    "Theme: Base16",
    async (api: plugins.API) => api.theme.set("Base16"),
  ),
  new Option(
    "Theme: Slate",
    async (api: plugins.API) => api.theme.set("Slate"),
  ),
  new Option(
    "Theme: Gray",
    async (api: plugins.API) => api.theme.set("Gray"),
  ),
  new Option(
    "Theme: Zinc",
    async (api: plugins.API) => api.theme.set("Zinc"),
  ),
  new Option(
    "Theme: Neutral",
    async (api: plugins.API) => api.theme.set("Neutral"),
  ),
  new Option(
    "Theme: Stone",
    async (api: plugins.API) => api.theme.set("Stone"),
  ),
  new Option(
    "Theme: Taupe",
    async (api: plugins.API) => api.theme.set("Taupe"),
  ),
  new Option(
    "Theme: Mauve",
    async (api: plugins.API) => api.theme.set("Mauve"),
  ),
  new Option(
    "Theme: Mist",
    async (api: plugins.API) => api.theme.set("Mist"),
  ),
  new Option(
    "Theme: Olive",
    async (api: plugins.API) => api.theme.set("Olive"),
  ),
  new Option(
    "Edit: Undo",
    async (api: plugins.API) => api.buffer.undo(),
    ["⌃Z", "⌘Z"],
  ),
  new Option(
    "View: Toggle Render Whitespace",
    async (api: plugins.API) => api.view.toggleWhitespace(),
    ["F5"],
  ),
  new Option(
    "View: Toggle Line Wrap",
    async (api: plugins.API) => api.view.toggleWrap(),
    ["F6"],
  ),
  new Option(
    "Global: Toggle Zen Mode",
    async (api: plugins.API) => api.zen.toggle(),
    ["F11"],
  ),
].sort((a, b) => a.name.localeCompare(b.name));
