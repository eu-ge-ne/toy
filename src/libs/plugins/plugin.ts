import * as commands from "@libs/commands";
import * as kitty from "@libs/kitty";

import { Host } from "./host.ts";

export abstract class Plugin {
  constructor(protected readonly host: Host) {
  }

  start(): void {
  }

  exit(_?: PromiseRejectionEvent): void {
  }

  async handleKey(_: kitty.Key): Promise<boolean> {
    return false;
  }

  async handleCommand(_: commands.Command): Promise<boolean> {
    return false;
  }
}
