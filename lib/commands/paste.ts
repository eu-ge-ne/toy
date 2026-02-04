import { Key } from "@lib/kitty";

import { Command } from "./command.ts";

export const PasteCommand: Command = {
  id: "Paste",
  description: "Edit: Paste",
  shortcuts: [
    Key.create({ name: "v", ctrl: true }),
    Key.create({ name: "v", super: true }),
  ],
};
