import { Command, CommandToShortcuts } from "@libs/commands";
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

export const options: Option<Command | ((_: plugins.Api) => Promise<void>)>[] =
  [
    new Option<Command>(
      "Edit: Copy",
      { name: "Copy" },
      CommandToShortcuts["Copy"],
    ),
    new Option<Command>(
      "Edit: Cut",
      { name: "Cut" },
      CommandToShortcuts["Cut"],
    ),
    new Option(
      "Global: Toggle Debug Panel",
      async (api: plugins.Api) => api.debug.toggle(),
    ),
    new Option(
      "Global: Exit",
      (api: plugins.Api) => api.emitStop(),
      ["F10"],
    ),
    new Option(
      "Edit: Select All",
      async (api: plugins.Api) => api.doc.selectAll(),
      ["⌃A", "⌘A"],
    ),
    new Option<Command>(
      "Edit: Paste",
      { name: "Paste" },
      CommandToShortcuts["Paste"],
    ),
    new Option<Command>(
      "Edit: Redo",
      { name: "Redo" },
      CommandToShortcuts["Redo"],
    ),
    new Option<Command>(
      "Global: Save",
      { name: "Save" },
      CommandToShortcuts["Save"],
    ),
    new Option(
      "Theme: Base16",
      async (api: plugins.Api) => api.emitSetTheme("Base16"),
    ),
    new Option(
      "Theme: Slate",
      async (api: plugins.Api) => api.emitSetTheme("Slate"),
    ),
    new Option(
      "Theme: Gray",
      async (api: plugins.Api) => api.emitSetTheme("Gray"),
    ),
    new Option(
      "Theme: Zinc",
      async (api: plugins.Api) => api.emitSetTheme("Zinc"),
    ),
    new Option(
      "Theme: Neutral",
      async (api: plugins.Api) => api.emitSetTheme("Neutral"),
    ),
    new Option(
      "Theme: Stone",
      async (api: plugins.Api) => api.emitSetTheme("Stone"),
    ),
    new Option(
      "Theme: Taupe",
      async (api: plugins.Api) => api.emitSetTheme("Taupe"),
    ),
    new Option(
      "Theme: Mauve",
      async (api: plugins.Api) => api.emitSetTheme("Mauve"),
    ),
    new Option(
      "Theme: Mist",
      async (api: plugins.Api) => api.emitSetTheme("Mist"),
    ),
    new Option(
      "Theme: Olive",
      async (api: plugins.Api) => api.emitSetTheme("Olive"),
    ),
    new Option<Command>(
      "Edit: Undo",
      { name: "Undo" },
      CommandToShortcuts["Undo"],
    ),
    new Option(
      "View: Toggle Render Whitespace",
      async (api: plugins.Api) => api.doc.toggleWhitespace(),
      ["F5"],
    ),
    new Option(
      "View: Toggle Line Wrap",
      async (api: plugins.Api) => api.doc.toggleWrap(),
      ["F6"],
    ),
    new Option(
      "Global: Toggle Zen Mode",
      async (api: plugins.Api) => api.emitToggleZen(),
      ["F11"],
    ),
  ].sort((a, b) => a.name.localeCompare(b.name));
