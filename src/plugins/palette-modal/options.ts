import { BufferAPI } from "@plugins/buffer";
import { DebugAPI } from "@plugins/debug";
import { FileAPI } from "@plugins/file";
import { RuntimeAPI } from "@plugins/runtime";
import { ThemesAPI } from "@plugins/themes";
import { ViewAPI } from "@plugins/view";
import { ZenAPI } from "@plugins/zen";

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
      & ViewAPI
      & DebugAPI
      & RuntimeAPI
      & BufferAPI
      & ThemesAPI
      & ZenAPI
      & FileAPI,
  ) => Promise<void>
>[] = [
  new Option(
    "Edit: Copy",
    async (api: ViewAPI) => api.view.copy(),
    ["⌃C", "⌘C"],
  ),
  new Option(
    "Edit: Cut",
    async (api: ViewAPI) => api.view.cut(),
    ["⌃X", "⌘X"],
  ),
  new Option(
    "Global: Toggle Debug Panel",
    async (api: DebugAPI) => api.debug.toggle(),
  ),
  new Option(
    "Global: Exit",
    (api: RuntimeAPI) => api.runtime.stop(),
    ["F10"],
  ),
  new Option(
    "Edit: Select All",
    async (api: ViewAPI) => api.view.selectAll(),
    ["⌃A", "⌘A"],
  ),
  new Option(
    "Edit: Paste",
    async (api: ViewAPI) => api.view.paste(),
    ["⌃V", "⌘V"],
  ),
  new Option(
    "Edit: Redo",
    async (api: BufferAPI) => api.buffer.redo(),
    ["⌃Y", "⌘Y"],
  ),
  new Option(
    "Global: Save",
    async (api: FileAPI) => api.file.save(),
    ["F2"],
  ),
  new Option(
    "Theme: Base16",
    async (api: ThemesAPI) => api.theme.set("Base16"),
  ),
  new Option(
    "Theme: Slate",
    async (api: ThemesAPI) => api.theme.set("Slate"),
  ),
  new Option(
    "Theme: Gray",
    async (api: ThemesAPI) => api.theme.set("Gray"),
  ),
  new Option(
    "Theme: Zinc",
    async (api: ThemesAPI) => api.theme.set("Zinc"),
  ),
  new Option(
    "Theme: Neutral",
    async (api: ThemesAPI) => api.theme.set("Neutral"),
  ),
  new Option(
    "Theme: Stone",
    async (api: ThemesAPI) => api.theme.set("Stone"),
  ),
  new Option(
    "Theme: Taupe",
    async (api: ThemesAPI) => api.theme.set("Taupe"),
  ),
  new Option(
    "Theme: Mauve",
    async (api: ThemesAPI) => api.theme.set("Mauve"),
  ),
  new Option(
    "Theme: Mist",
    async (api: ThemesAPI) => api.theme.set("Mist"),
  ),
  new Option(
    "Theme: Olive",
    async (api: ThemesAPI) => api.theme.set("Olive"),
  ),
  new Option(
    "Edit: Undo",
    async (api: BufferAPI) => api.buffer.undo(),
    ["⌃Z", "⌘Z"],
  ),
  new Option(
    "View: Toggle Render Whitespace",
    async (api: ViewAPI) => api.view.toggleWhitespace(),
    ["F5"],
  ),
  new Option(
    "View: Toggle Line Wrap",
    async (api: ViewAPI) => api.view.toggleWrap(),
    ["F6"],
  ),
  new Option(
    "Global: Toggle Zen Mode",
    async (api: ZenAPI) => api.zen.toggle(),
    ["F11"],
  ),
].sort((a, b) => a.name.localeCompare(b.name));
