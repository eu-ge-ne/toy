import { Events } from "./events.ts";
import { Signals } from "./signals.ts";

export type EventClients<T extends Events> = {
  [K in keyof T]?: { fn: T[K]; order: number }[];
};

export type SignalClients<T extends Signals> = {
  [K in keyof T]?: { fn: T[K]; order: number }[];
};
