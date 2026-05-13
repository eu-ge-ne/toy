import * as events from "@libs/events";

export type ZenInterceptorEvents = Record<PropertyKey, never>;

export type ZenReactorEvents = {
  "toggle": () => void;
};

export type ZenAPI = {
  events: events.Listener<ZenInterceptorEvents, ZenReactorEvents>;
  enabled(): boolean;
  toggle(): void;
};
