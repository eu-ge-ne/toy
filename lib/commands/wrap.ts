import { Key } from "@lib/kitty";

import { Command } from "./command.ts";

export const WrapCommand: Command = {
  id: "Wrap",
  description: "View: Toggle Line Wrap",
  shortcuts: [
    Key.create({ name: "F6" }),
  ],
};
