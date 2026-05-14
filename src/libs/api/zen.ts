import * as events from "@libs/events";

export type ZenEvents = Record<PropertyKey, never>;

export type ZenReactorEvents = {
  "toggle": () => void;
};

export type Zen = {
  events: events.Listener<ZenEvents, ZenReactorEvents>;
  get enabled(): boolean;
  toggle(): void;
};
