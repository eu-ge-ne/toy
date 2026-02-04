import { Key } from "@lib/kitty";

import { Command } from "./command.ts";

export const SaveCommand: Command = {
  id: "Save",
  description: "Global: Save",
  shortcuts: [
    Key.create({ name: "F2" }),
  ],
};
