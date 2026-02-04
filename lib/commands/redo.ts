import { Key } from "@lib/kitty";

import { Command } from "./command.ts";

export class RedoCommand extends Command {
  id = "Redo";
  description = "Edit: Redo";
  shortcuts = [
    Key.create({ name: "y", ctrl: true }),
    Key.create({ name: "y", super: true }),
  ];
}
