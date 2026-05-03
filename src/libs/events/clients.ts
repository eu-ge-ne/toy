import { InterceptorEvents, ReactorEvents } from "./events.ts";

export type Interceptors<Events extends InterceptorEvents> = {
  [Name in keyof Events]?: { fn: Events[Name]; order: number }[];
};

export type Reactors<Events extends ReactorEvents> = {
  [Name in keyof Events]?: { fn: Events[Name]; order: number }[];
};
