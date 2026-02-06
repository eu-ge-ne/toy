import { Command, CommandToShortcuts } from "@lib/commands";

export interface Option {
  name: string;
  shortcuts?: string[];
  command: Command;
}

export const options: Option[] = [
  {
    name: "Edit: Copy",
    shortcuts: CommandToShortcuts["Copy"],
    command: { name: "Copy" } as const,
  },
  {
    name: "Edit: Cut",
    shortcuts: CommandToShortcuts["Cut"],
    command: { name: "Cut" } as const,
  },
  {
    name: "Global: Toggle Debug Panel",
    shortcuts: CommandToShortcuts["Debug"],
    command: { name: "Debug" } as const,
  },
  {
    name: "Global: Exit",
    shortcuts: CommandToShortcuts["Exit"],
    command: { name: "Exit" } as const,
  },
  {
    name: "Edit: Select All",
    shortcuts: CommandToShortcuts["SelectAll"],
    command: { name: "SelectAll" } as const,
  },
  {
    name: "Edit: Paste",
    shortcuts: CommandToShortcuts["Paste"],
    command: { name: "Paste" } as const,
  },
  {
    name: "Edit: Redo",
    shortcuts: CommandToShortcuts["Redo"],
    command: { name: "Redo" } as const,
  },
  {
    name: "Global: Save",
    shortcuts: CommandToShortcuts["Save"],
    command: { name: "Save" } as const,
  },
  {
    name: "Theme: Base16",
    command: { name: "Theme", data: "Base16" } as const,
  },
  {
    name: "Theme: Gray",
    command: { name: "Theme", data: "Gray" } as const,
  },
  {
    name: "Theme: Neutral",
    command: { name: "Theme", data: "Neutral" } as const,
  },
  {
    name: "Theme: Slate",
    command: { name: "Theme", data: "Slate" } as const,
  },
  {
    name: "Theme: Stone",
    command: { name: "Theme", data: "Stone" } as const,
  },
  {
    name: "Theme: Zinc",
    command: { name: "Theme", data: "Zinc" } as const,
  },
  {
    name: "Edit: Undo",
    shortcuts: CommandToShortcuts["Undo"],
    command: { name: "Undo" } as const,
  },
  {
    name: "View: Toggle Render Whitespace",
    shortcuts: CommandToShortcuts["Whitespace"],
    command: { name: "Whitespace" } as const,
  },
  {
    name: "View: Toggle Line Wrap",
    shortcuts: CommandToShortcuts["Wrap"],
    command: { name: "Wrap" } as const,
  },
  {
    name: "Global: Toggle Zen Mode",
    shortcuts: CommandToShortcuts["Zen"],
    command: { name: "Zen" } as const,
  },
].sort((a, b) => a.name.localeCompare(b.name));
