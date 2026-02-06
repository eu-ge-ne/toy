import * as commands from "@lib/commands";

export interface Option {
  name: string;
  shortcuts?: string[];
  command: commands.Command;
}

export const options: Option[] = [
  {
    name: "Edit: Copy",
    shortcuts: commands.CommandToShortcuts.get(commands.Copy),
    command: commands.Copy,
  },
  {
    name: "Edit: Cut",
    shortcuts: commands.CommandToShortcuts.get(commands.Cut),
    command: commands.Cut,
  },
  {
    name: "Global: Toggle Debug Panel",
    shortcuts: commands.CommandToShortcuts.get(commands.Debug),
    command: commands.Debug,
  },
  {
    name: "Global: Exit",
    shortcuts: commands.CommandToShortcuts.get(commands.Exit),
    command: commands.Exit,
  },
  {
    name: "Edit: Select All",
    shortcuts: commands.CommandToShortcuts.get(commands.SelectAll),
    command: commands.SelectAll,
  },
  {
    name: "Edit: Paste",
    shortcuts: commands.CommandToShortcuts.get(commands.Paste),
    command: commands.Paste,
  },
  {
    name: "Edit: Redo",
    shortcuts: commands.CommandToShortcuts.get(commands.Redo),
    command: commands.Redo,
  },
  {
    name: "Global: Save",
    shortcuts: commands.CommandToShortcuts.get(commands.Save),
    command: commands.Save,
  },
  {
    name: "Theme: Base16",
    shortcuts: commands.CommandToShortcuts.get(commands.ThemeBase16),
    command: commands.ThemeBase16,
  },
  {
    name: "Theme: Gray",
    shortcuts: commands.CommandToShortcuts.get(commands.ThemeGray),
    command: commands.ThemeGray,
  },
  {
    name: "Theme: Neutral",
    shortcuts: commands.CommandToShortcuts.get(commands.ThemeNeutral),
    command: commands.ThemeNeutral,
  },
  {
    name: "Theme: Slate",
    shortcuts: commands.CommandToShortcuts.get(commands.ThemeSlate),
    command: commands.ThemeSlate,
  },
  {
    name: "Theme: Stone",
    shortcuts: commands.CommandToShortcuts.get(commands.ThemeStone),
    command: commands.ThemeStone,
  },
  {
    name: "Theme: Zinc",
    shortcuts: commands.CommandToShortcuts.get(commands.ThemeZinc),
    command: commands.ThemeZinc,
  },
  {
    name: "Edit: Undo",
    shortcuts: commands.CommandToShortcuts.get(commands.Undo),
    command: commands.Undo,
  },
  {
    name: "View: Toggle Render Whitespace",
    shortcuts: commands.CommandToShortcuts.get(commands.Whitespace),
    command: commands.Whitespace,
  },
  {
    name: "View: Toggle Line Wrap",
    shortcuts: commands.CommandToShortcuts.get(commands.Wrap),
    command: commands.Wrap,
  },
  {
    name: "Global: Toggle Zen Mode",
    shortcuts: commands.CommandToShortcuts.get(commands.Zen),
    command: commands.Zen,
  },
].sort((a, b) => a.name.localeCompare(b.name));
