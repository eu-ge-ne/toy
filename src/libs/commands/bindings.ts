import { Command } from "./commands.ts";

export const ShortcutToCommand: Record<string, Command["name"]> = {
  "F2": "Save",
};

export const CommandToShortcuts = Object.fromEntries(
  Object.values(ShortcutToCommand).map((x) => [x, []]),
) as unknown as Record<Command["name"], string[]>;

for (const [shortcut, command] of Object.entries(ShortcutToCommand)) {
  CommandToShortcuts[command].push(shortcut);
}
