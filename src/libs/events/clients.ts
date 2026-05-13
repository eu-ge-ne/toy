import { BroadcastedEvents, DispatchedEvents } from "./events.ts";

export class Clients<
  DE extends DispatchedEvents,
  BE extends BroadcastedEvents,
> {
  Interceptors: {
    [E in keyof DE]?: { fn: DE[E]; order: number }[];
  } = {};

  Reactors: {
    [E in keyof BE]?: { fn: BE[E]; order: number }[];
  } = {};
}
