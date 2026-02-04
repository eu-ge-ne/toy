import { Key } from "@lib/kitty";

import { Command } from "./command.ts";

export const CopyCommand: Command = {
  id: "Copy",
  description: "Edit: Copy",
  shortcuts: [
    Key.create({ name: "c", ctrl: true }),
    Key.create({ name: "c", super: true }),
  ],
};
