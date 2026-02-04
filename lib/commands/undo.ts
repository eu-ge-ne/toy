import { Key } from "@lib/kitty";

import { Command } from "./command.ts";

export const UndoCommand: Command = {
  id: "Undo",
  description: "Edit: Undo",
  shortcuts: [
    Key.create({ name: "z", ctrl: true }),
    Key.create({ name: "z", super: true }),
  ],
};
