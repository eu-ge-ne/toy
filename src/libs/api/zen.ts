import * as events from "@libs/events";

export type ZenEvents = Record<PropertyKey, never>;

export type ZenNotifications = {
  "toggle": () => void;
};

export type Zen = {
  events: events.Listener<ZenEvents, ZenNotifications>;
  get enabled(): boolean;
  toggle(): void;
};
