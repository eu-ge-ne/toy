import * as commands from "@libs/commands";
import * as kitty from "@libs/kitty";

import { Host } from "./host.ts";

export abstract class Plugin {
  constructor(protected readonly host: Host) {
  }

  onStart(): void {
  }

  onRender(): void {
  }

  onExit(_?: PromiseRejectionEvent): void {
  }

  async onKey(_: kitty.Key): Promise<boolean> {
    return false;
  }

  async onCommand(_: commands.Command): Promise<boolean> {
    return false;
  }
}
