import { Command } from "./command.ts";

export class DebugCommand extends Command {
  id = "Debug";
  description = "Global: Toggle Debug Panel";
  shortcuts = [];
}
