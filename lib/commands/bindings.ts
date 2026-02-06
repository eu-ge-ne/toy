import { Command } from "./commands.ts";

export const ShortcutToCommand: Record<string, Command["name"]> = {
  "F1": "Palette",
  "⇧F1": "Palette",
  "⌃F1": "Palette",
  "⌥F1": "Palette",
  "⌘F1": "Palette",

  "F2": "Save",
  "F5": "Whitespace",
  "F6": "Wrap",
  "F10": "Exit",
  "F11": "Zen",

  "⌃A": "SelectAll",
  "⌘A": "SelectAll",

  "⌃C": "Copy",
  "⌘C": "Copy",

  "⌃X": "Cut",
  "⌘X": "Cut",

  "⌃V": "Paste",
  "⌘V": "Paste",

  "⌃Z": "Undo",
  "⌘Z": "Undo",

  "⌃Y": "Redo",
  "⌘Y": "Redo",
};

export const CommandToShortcuts = Object.fromEntries(
  Object.values(ShortcutToCommand).map((x) => [x, []]),
) as unknown as Record<Command["name"], string[]>;

for (const [shortcut, command] of Object.entries(ShortcutToCommand)) {
  CommandToShortcuts[command].push(shortcut);
}
