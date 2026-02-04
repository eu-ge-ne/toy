import { Key } from "@lib/kitty";

import { Command } from "./command.ts";

export class SaveCommand extends Command {
  id = "Save";
  description = "Global: Save";
  shortcuts = [
    Key.create({ name: "F2" }),
  ];
}
