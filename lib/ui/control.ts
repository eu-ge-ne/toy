import * as commands from "@lib/commands";

import { Area } from "./area.ts";

export abstract class Control {
  enabled = false;

  y = 0;
  x = 0;
  w = 0;
  h = 0;

  constructor(protected parent?: Control) {
  }

  abstract layout(_: Area): void;

  abstract render(): void;

  abstract handleCommand(cmd: commands.Command): Promise<boolean>;
}
