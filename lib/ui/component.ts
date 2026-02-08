import { Command } from "@lib/commands";

import { Area } from "./area.ts";

export abstract class Component<P extends unknown[] = [], R = unknown>
  implements Area {
  y = 0;
  x = 0;
  w = 0;
  h = 0;

  abstract run(...params: P): Promise<R>;
  abstract layout(_: Area): void;
  abstract render(): void;
  abstract handle(_: Command): Promise<void>;
}
