import { Key } from "@lib/kitty";

import { Command } from "./command.ts";

export const PaletteCommand: Command = {
  id: "Palette",
  description: "Global: Open Palette",
  shortcuts: [
    Key.create({ name: "F1" }),
    Key.create({ name: "F1", shift: true }),
    Key.create({ name: "F1", ctrl: true }),
    Key.create({ name: "F1", alt: true }),
    Key.create({ name: "F1", super: true }),
  ],
};
