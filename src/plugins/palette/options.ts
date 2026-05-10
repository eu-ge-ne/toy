import { Command, CommandToShortcuts } from "@libs/commands";
import * as plugins from "@libs/plugins";

export class Option<T> {
  constructor(
    public readonly name: string,
    public readonly shortcuts: string[] = [],
    public readonly value: T,
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
      CommandToShortcuts["Copy"],
      { name: "Copy" },
    ),
    new Option<Command>(
      "Edit: Cut",
      CommandToShortcuts["Cut"],
      { name: "Cut" },
    ),
    new Option(
      "Global: Toggle Debug Panel",
      undefined,
      async (api: plugins.Api) => api.debug.toggle(),
    ),
    new Option(
      "Global: Exit",
      ["F10"],
      (api: plugins.Api) => api.emitStop(),
    ),
    new Option<Command>(
      "Edit: Select All",
      CommandToShortcuts["SelectAll"],
      { name: "SelectAll" },
    ),
    new Option<Command>(
      "Edit: Paste",
      CommandToShortcuts["Paste"],
      { name: "Paste" },
    ),
    new Option<Command>(
      "Edit: Redo",
      CommandToShortcuts["Redo"],
      { name: "Redo" },
    ),
    new Option<Command>(
      "Global: Save",
      CommandToShortcuts["Save"],
      { name: "Save" },
    ),
    new Option(
      "Theme: Base16",
      undefined,
      async (api: plugins.Api) => api.emitSetTheme("Base16"),
    ),
    new Option(
      "Theme: Slate",
      undefined,
      async (api: plugins.Api) => api.emitSetTheme("Slate"),
    ),
    new Option(
      "Theme: Gray",
      undefined,
      async (api: plugins.Api) => api.emitSetTheme("Gray"),
    ),
    new Option(
      "Theme: Zinc",
      undefined,
      async (api: plugins.Api) => api.emitSetTheme("Zinc"),
    ),
    new Option(
      "Theme: Neutral",
      undefined,
      async (api: plugins.Api) => api.emitSetTheme("Neutral"),
    ),
    new Option(
      "Theme: Stone",
      undefined,
      async (api: plugins.Api) => api.emitSetTheme("Stone"),
    ),
    new Option(
      "Theme: Taupe",
      undefined,
      async (api: plugins.Api) => api.emitSetTheme("Taupe"),
    ),
    new Option(
      "Theme: Mauve",
      undefined,
      async (api: plugins.Api) => api.emitSetTheme("Mauve"),
    ),
    new Option(
      "Theme: Mist",
      undefined,
      async (api: plugins.Api) => api.emitSetTheme("Mist"),
    ),
    new Option(
      "Theme: Olive",
      undefined,
      async (api: plugins.Api) => api.emitSetTheme("Olive"),
    ),
    new Option<Command>(
      "Edit: Undo",
      CommandToShortcuts["Undo"],
      { name: "Undo" },
    ),
    new Option<Command>(
      "View: Toggle Render Whitespace",
      CommandToShortcuts["Whitespace"],
      { name: "Whitespace" },
    ),
    new Option<Command>(
      "View: Toggle Line Wrap",
      CommandToShortcuts["Wrap"],
      { name: "Wrap" },
    ),
    new Option(
      "Global: Toggle Zen Mode",
      ["F11"],
      async (api: plugins.Api) => api.emitToggleZen(),
    ),
  ].sort((a, b) => a.name.localeCompare(b.name));
