import * as commands from "./commands.ts";

export const ShortcutToCommand = new Map<string, commands.Command>([
  ["F1", commands.Palette],
  ["⇧F1", commands.Palette],
  ["⌃F1", commands.Palette],
  ["⌥F1", commands.Palette],
  ["⌘F1", commands.Palette],

  ["F2", commands.Save],
  ["F5", commands.Whitespace],
  ["F6", commands.Wrap],
  ["F10", commands.Exit],
  ["F11", commands.Zen],

  ["⌃A", commands.SelectAll],
  ["⌘A", commands.SelectAll],

  ["⌃C", commands.Copy],
  ["⌘C", commands.Copy],

  ["⌃X", commands.Cut],
  ["⌘X", commands.Cut],

  ["⌃V", commands.Paste],
  ["⌘V", commands.Paste],

  ["⌃Z", commands.Undo],
  ["⌘Z", commands.Undo],

  ["⌃Y", commands.Redo],
  ["⌘Y", commands.Redo],
]);

export const CommandToShortcuts = new Map<commands.Command, string[]>();

for (const [shortcut, command] of ShortcutToCommand) {
  let shortcuts = CommandToShortcuts.get(command);

  if (typeof shortcuts === "undefined") {
    shortcuts = [];
    CommandToShortcuts.set(command, shortcuts);
  }

  shortcuts.push(shortcut);
}
