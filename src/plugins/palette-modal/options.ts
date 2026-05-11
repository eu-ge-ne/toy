import * as api from "@libs/api";

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

export const options: Option<(_: api.Api) => Promise<void>>[] = [
  new Option(
    "Edit: Copy",
    async (api: api.Api) => api.doc.copy(),
    ["⌃C", "⌘C"],
  ),
  new Option(
    "Edit: Cut",
    async (api: api.Api) => api.doc.cut(),
    ["⌃X", "⌘X"],
  ),
  new Option(
    "Global: Toggle Debug Panel",
    async (api: api.Api) => api.debug.toggle(),
  ),
  new Option(
    "Global: Exit",
    (api: api.Api) => api.emitStop(),
    ["F10"],
  ),
  new Option(
    "Edit: Select All",
    async (api: api.Api) => api.doc.selectAll(),
    ["⌃A", "⌘A"],
  ),
  new Option(
    "Edit: Paste",
    async (api: api.Api) => api.doc.paste(),
    ["⌃V", "⌘V"],
  ),
  new Option(
    "Edit: Redo",
    async (api: api.Api) => api.doc.redo(),
    ["⌃Y", "⌘Y"],
  ),
  new Option(
    "Global: Save",
    async (api: api.Api) => api.doc.save(),
    ["F2"],
  ),
  new Option(
    "Theme: Base16",
    async (api: api.Api) => api.theme.set("Base16"),
  ),
  new Option(
    "Theme: Slate",
    async (api: api.Api) => api.theme.set("Slate"),
  ),
  new Option(
    "Theme: Gray",
    async (api: api.Api) => api.theme.set("Gray"),
  ),
  new Option(
    "Theme: Zinc",
    async (api: api.Api) => api.theme.set("Zinc"),
  ),
  new Option(
    "Theme: Neutral",
    async (api: api.Api) => api.theme.set("Neutral"),
  ),
  new Option(
    "Theme: Stone",
    async (api: api.Api) => api.theme.set("Stone"),
  ),
  new Option(
    "Theme: Taupe",
    async (api: api.Api) => api.theme.set("Taupe"),
  ),
  new Option(
    "Theme: Mauve",
    async (api: api.Api) => api.theme.set("Mauve"),
  ),
  new Option(
    "Theme: Mist",
    async (api: api.Api) => api.theme.set("Mist"),
  ),
  new Option(
    "Theme: Olive",
    async (api: api.Api) => api.theme.set("Olive"),
  ),
  new Option(
    "Edit: Undo",
    async (api: api.Api) => api.doc.undo(),
    ["⌃Z", "⌘Z"],
  ),
  new Option(
    "View: Toggle Render Whitespace",
    async (api: api.Api) => api.doc.toggleWhitespace(),
    ["F5"],
  ),
  new Option(
    "View: Toggle Line Wrap",
    async (api: api.Api) => api.doc.toggleWrap(),
    ["F6"],
  ),
  new Option(
    "Global: Toggle Zen Mode",
    async (api: api.Api) => api.emitToggleZen(),
    ["F11"],
  ),
].sort((a, b) => a.name.localeCompare(b.name));
