import { Command } from "@lib/commands";

import { Area } from "./area.ts";

export abstract class Control {
  area: Area = { y: 0, x: 0, w: 0, h: 0 };

  constructor(protected renderTree: () => void) {}

  abstract layout(_: Area): void;
  abstract render(): void;
  abstract handleCommand(_: Command): Promise<boolean>;
}
