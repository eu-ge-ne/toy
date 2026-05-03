import {
  AsyncInterceptorEvents,
  ReactorEvents,
  SyncInterceptorEvents,
} from "./events.ts";

export type SyncInterceptors<Events extends SyncInterceptorEvents> = {
  [Name in keyof Events]?: { fn: Events[Name]; order: number }[];
};

export type AsyncInterceptors<Events extends AsyncInterceptorEvents> = {
  [Name in keyof Events]?: { fn: Events[Name]; order: number }[];
};

export type Reactors<Events extends ReactorEvents> = {
  [Name in keyof Events]?: { fn: Events[Name]; order: number }[];
};
