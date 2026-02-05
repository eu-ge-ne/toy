import { Command } from "@lib/commands";
import { shortcut } from "@lib/kitty";

export class Option {
  shortcuts: string;

  constructor(public command: Command) {
    this.shortcuts = command.keys.map(shortcut).join(" ");
  }
}
