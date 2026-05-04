import { Command, CommandToShortcuts } from "@libs/commands";

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

export const options: Option<Command>[] = [
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
  new Option<Command>(
    "Global: Toggle Debug Panel",
    CommandToShortcuts["Debug"],
    { name: "Debug" },
  ),
  new Option<Command>(
    "Global: Exit",
    CommandToShortcuts["Exit"],
    { name: "Exit" },
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
  new Option<Command>(
    "Theme: Base16",
    undefined,
    { name: "Theme", data: "Base16" },
  ),
  new Option<Command>(
    "Theme: Slate",
    undefined,
    { name: "Theme", data: "Slate" },
  ),
  new Option<Command>(
    "Theme: Gray",
    undefined,
    { name: "Theme", data: "Gray" },
  ),
  new Option<Command>(
    "Theme: Zinc",
    undefined,
    { name: "Theme", data: "Zinc" },
  ),
  new Option<Command>(
    "Theme: Neutral",
    undefined,
    { name: "Theme", data: "Neutral" },
  ),
  new Option<Command>(
    "Theme: Stone",
    undefined,
    { name: "Theme", data: "Stone" },
  ),
  new Option<Command>(
    "Theme: Taupe",
    undefined,
    { name: "Theme", data: "Taupe" },
  ),
  new Option<Command>(
    "Theme: Mauve",
    undefined,
    { name: "Theme", data: "Mauve" },
  ),
  new Option<Command>(
    "Theme: Mist",
    undefined,
    { name: "Theme", data: "Mist" },
  ),
  new Option<Command>(
    "Theme: Olive",
    undefined,
    { name: "Theme", data: "Olive" },
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
  new Option<Command>(
    "Global: Toggle Zen Mode",
    CommandToShortcuts["Zen"],
    { name: "Zen" },
  ),
].sort((a, b) => a.name.localeCompare(b.name));
