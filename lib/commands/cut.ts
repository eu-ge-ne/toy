import { Key } from "@lib/kitty";

import { Command } from "./command.ts";

export const CutCommand: Command = {
  id: "Cut",
  description: "Edit: Cut",
  shortcuts: [
    Key.create({ name: "x", ctrl: true }),
    Key.create({ name: "x", super: true }),
  ],
};
