import * as events from "@libs/events";

export type ZenSignals = {
  "toggle": () => void;
};

export type Zen = {
  signals: events.SignalListener<ZenSignals>;
  get enabled(): boolean;
  toggle(): void;
};
