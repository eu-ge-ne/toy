import { InterceptorEvents, ReactorEvents } from "./events.ts";

export class Clients<IE extends InterceptorEvents, RE extends ReactorEvents> {
  Interceptors: {
    [Name in keyof IE]?: { fn: IE[Name]; order: number }[];
  } = {};

  Reactors: {
    [Name in keyof RE]?: { fn: RE[Name]; order: number }[];
  } = {};
}
