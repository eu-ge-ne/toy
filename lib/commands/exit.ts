import { Key } from "@lib/kitty";

import { Command } from "./command.ts";

export const ExitCommand: Command = {
  id: "Exit",
  description: "Global: Exit",
  shortcuts: [
    Key.create({ name: "F10" }),
  ],
};
