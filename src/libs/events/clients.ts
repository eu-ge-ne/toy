import { BroadcastedEvents, DispatchedEvents } from "./events.ts";

export class Clients<
  IE extends DispatchedEvents,
  RE extends BroadcastedEvents,
> {
  Interceptors: {
    [Name in keyof IE]?: { fn: IE[Name]; order: number }[];
  } = {};

  Reactors: {
    [Name in keyof RE]?: { fn: RE[Name]; order: number }[];
  } = {};
}
