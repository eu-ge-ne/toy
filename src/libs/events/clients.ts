import { InterceptorEvents, ReactorEvents } from "./events.ts";

type Interceptors<Events extends InterceptorEvents> = {
  [Name in keyof Events]?: { fn: Events[Name]; order: number }[];
};

type Reactors<Events extends ReactorEvents> = {
  [Name in keyof Events]?: { fn: Events[Name]; order: number }[];
};

export class Clients<IE extends InterceptorEvents, RE extends ReactorEvents> {
  Interceptors: Interceptors<IE> = {};
  Reactors: Reactors<RE> = {};
}
