import { BroadcastedEvents, Events } from "./events.ts";

export class Clients<EE extends Events, BE extends BroadcastedEvents> {
  Interceptors: {
    [E in keyof EE]?: { fn: EE[E]; order: number }[];
  } = {};

  Reactors: {
    [E in keyof BE]?: { fn: BE[E]; order: number }[];
  } = {};
}
