import { Key } from "@lib/kitty";

import { Command } from "./command.ts";

export const WhitespaceCommand: Command = {
  id: "Whitespace",
  description: "View: Toggle Render Whitespace",
  shortcuts: [
    Key.create({ name: "F5" }),
  ],
};
