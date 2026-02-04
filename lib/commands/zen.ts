import { Key } from "@lib/kitty";

import { Command } from "./command.ts";

export const ZenCommand: Command = {
  id: "Zen",
  description: "Global: Toggle Zen Mode",
  shortcuts: [
    Key.create({ name: "F11" }),
  ],
};
