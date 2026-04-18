import { Command, CommandToShortcuts } from "@libs/commands";

export class Option {
  constructor(
    public readonly name: string,
    public readonly shortcuts: string[] = [],
    public readonly value: Command,
  ) {
  }

  string(width: number): string {
    const shortcuts = this.shortcuts.join(" ");
    const w = width - shortcuts.length;
    return this.name.slice(0, w).padEnd(w, " ") + shortcuts;
  }
}

export const options: Option[] = [
  new Option("Edit: Copy", CommandToShortcuts["Copy"], { name: "Copy" }),
  new Option("Edit: Cut", CommandToShortcuts["Cut"], { name: "Cut" }),
  new Option("Global: Toggle Debug Panel", CommandToShortcuts["Debug"], {
    name: "Debug",
  }),
  new Option("Global: Exit", CommandToShortcuts["Exit"], { name: "Exit" }),
  new Option("Edit: Select All", CommandToShortcuts["SelectAll"], {
    name: "SelectAll",
  }),
  new Option("Edit: Paste", CommandToShortcuts["Paste"], { name: "Paste" }),
  new Option("Edit: Redo", CommandToShortcuts["Redo"], { name: "Redo" }),
  new Option("Global: Save", CommandToShortcuts["Save"], { name: "Save" }),
  new Option("Theme: Base16", undefined, { name: "Theme", data: "Base16" }),
  new Option("Theme: Slate", undefined, { name: "Theme", data: "Slate" }),
  new Option("Theme: Gray", undefined, { name: "Theme", data: "Gray" }),
  new Option("Theme: Zinc", undefined, { name: "Theme", data: "Zinc" }),
  new Option("Theme: Neutral", undefined, { name: "Theme", data: "Neutral" }),
  new Option("Theme: Stone", undefined, { name: "Theme", data: "Stone" }),
  new Option("Theme: Taupe", undefined, { name: "Theme", data: "Taupe" }),
  new Option("Theme: Mauve", undefined, { name: "Theme", data: "Mauve" }),
  new Option("Theme: Mist", undefined, { name: "Theme", data: "Mist" }),
  new Option("Theme: Olive", undefined, { name: "Theme", data: "Olive" }),
  new Option("Edit: Undo", CommandToShortcuts["Undo"], { name: "Undo" }),
  new Option(
    "View: Toggle Render Whitespace",
    CommandToShortcuts["Whitespace"],
    { name: "Whitespace" },
  ),
  new Option("View: Toggle Line Wrap", CommandToShortcuts["Wrap"], {
    name: "Wrap",
  }),
  new Option("Global: Toggle Zen Mode", CommandToShortcuts["Zen"], {
    name: "Zen",
  }),
].sort((a, b) => a.name.localeCompare(b.name));
