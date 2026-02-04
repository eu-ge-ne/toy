import { Key } from "@lib/kitty";

import { Command } from "./command.ts";

export class ExitCommand extends Command {
  id = "Exit";
  description = "Global: Exit";
  shortcuts = [
    Key.create({ name: "F10" }),
  ];
}
