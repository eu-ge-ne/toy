import * as commands from "@libs/commands";

import { Host } from "./host.ts";

export abstract class Plugin {
  constructor(protected readonly host: Host) {
  }

  async onCommand?(_: commands.Command): Promise<void>;
}
