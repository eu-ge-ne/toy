import { Key } from "@lib/kitty";

import { Command } from "./command.ts";

export const SelectAllCommand: Command = {
  id: "Select All",
  description: "Edit: Select All",
  shortcuts: [
    Key.create({ name: "a", ctrl: true }),
    Key.create({ name: "a", super: true }),
  ],
};
