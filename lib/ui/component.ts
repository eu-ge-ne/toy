import { Command } from "@lib/commands";

import { Area } from "./area.ts";

export abstract class Component<G, P extends unknown[] = [], R = unknown> {
  area: Area = { y: 0, x: 0, w: 0, h: 0 };

  constructor(protected globals: G) {}

  abstract run(...params: P): Promise<R>;
  abstract resize(_: Area): void;
  abstract render(): void;
  abstract handle(_: Command): Promise<void>;
}
