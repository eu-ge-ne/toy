import { Key } from "@lib/kitty";

import { Command } from "./command.ts";

export class CutCommand extends Command {
  id = "Cut";
  description = "Edit: Cut";
  shortcuts = [
    Key.create({ name: "x", ctrl: true }),
    Key.create({ name: "x", super: true }),
  ];
}
