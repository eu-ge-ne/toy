import { Key } from "@lib/kitty";

import { Command } from "./command.ts";

export const RedoCommand: Command = {
  id: "Redo",
  description: "Edit: Redo",
  shortcuts: [
    Key.create({ name: "y", ctrl: true }),
    Key.create({ name: "y", super: true }),
  ],
};
