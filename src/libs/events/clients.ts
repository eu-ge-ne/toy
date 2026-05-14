import { Events } from "./events.ts";
import { Signals } from "./signals.ts";

export type Clients<T extends Events | Signals> = {
  [K in keyof T]?: { fn: T[K]; order: number }[];
};
