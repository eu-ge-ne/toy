import { Command } from "@lib/commands";

import { Area } from "./area.ts";

export abstract class Component<P extends unknown[] = [], R = void> {
  area: Area = { y: 0, x: 0, w: 0, h: 0 };

  constructor(protected renderTree: () => void) {}

  abstract run(...params: P): Promise<R>;
  abstract resize(_: Area): void;
  abstract renderComponent(): void;
  abstract handleCommand(_: Command): Promise<boolean>;
}
