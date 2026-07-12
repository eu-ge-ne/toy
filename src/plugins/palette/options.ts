import * as buffer from "@plugins/buffer";
import * as core from "@plugins/core";
import * as debug from "@plugins/debug";
import * as file from "@plugins/file";
import * as themes from "@plugins/themes";
import * as view from "@plugins/view";
import * as zen from "@plugins/zen";

export type OptionResult = (
  _: core.API & view.API & buffer.API & themes.API & zen.API & file.API & debug.API,
) => Promise<void>;

export class Option {
  constructor(
    public readonly name: string,
    public readonly value: OptionResult,
    public readonly shortcuts: string[] = [],
  ) {
  }

  label(width: number): string {
    const shortcuts = this.shortcuts.join(" ");
    const w = width - shortcuts.length;
    return this.name.slice(0, w).padEnd(w, " ") + shortcuts;
  }
}

export const options: Option[] = [
  new Option(
    "Edit: Copy",
    async (api: view.API) => api.view.copy(),
    ["⌃C", "⌘C"],
  ),
  new Option(
    "Edit: Cut",
    async (api: view.API) => api.view.cut(),
    ["⌃X", "⌘X"],
  ),
  new Option(
    "Global: Toggle Debug Panel",
    async (api: debug.API) => api.debug.toggle(),
  ),
  new Option(
    "Global: Exit",
    (api: core.API) => api.core.stop(),
    ["F10"],
  ),
  new Option(
    "Edit: Select All",
    async (api: view.API) => api.view.selectAll(),
    ["⌃A", "⌘A"],
  ),
  new Option(
    "Edit: Paste",
    async (api: view.API) => api.view.paste(),
    ["⌃V", "⌘V"],
  ),
  new Option("Edit: Undo", async (api: buffer.API) => api.buffer.undoHistory(), ["⌃Z", "⌘Z"]),
  new Option("Edit: Redo", async (api: buffer.API) => api.buffer.redoHistory(), ["⌃Y", "⌘Y"]),
  new Option(
    "Global: Save",
    async (api: file.API) => api.file.save(),
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
    "View: Toggle Render Whitespace",
    async (api: view.API) => api.view.toggleWhitespace(),
    ["F5"],
  ),
  new Option(
    "View: Toggle Line Wrap",
    async (api: view.API) => api.view.toggleWrap(),
    ["F6"],
  ),
  new Option(
    "Global: Toggle Zen Mode",
    async (api: zen.API) => api.zen.toggle(),
    ["F11"],
  ),
].sort((a, b) => a.name.localeCompare(b.name));
