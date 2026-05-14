import * as events from "@libs/events";

export type ZenInterceptorEvents = Record<PropertyKey, never>;

export type ZenReactorEvents = {
  "toggle": () => void;
};

export type Zen = {
  events: events.Listener<ZenInterceptorEvents, ZenReactorEvents>;
  get enabled(): boolean;
  toggle(): void;
};
