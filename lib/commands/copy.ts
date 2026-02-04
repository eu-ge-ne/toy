import { Key } from "@lib/kitty";

import { Command } from "./command.ts";

export class CopyCommand extends Command {
  id = "Copy";
  description = "Edit: Copy";
  shortcuts = [
    Key.create({ name: "c", ctrl: true }),
    Key.create({ name: "c", super: true }),
  ];
}
