import * as commands from "@libs/commands";
import * as kitty from "@libs/kitty";

import { Host } from "./host.ts";

export abstract class Plugin {
  constructor(protected readonly host: Host) {
  }

  async onKey?(_: kitty.Key): Promise<boolean>;
  async onCommand?(_: commands.Command): Promise<void>;
}
