import * as events from "@libs/events";
import * as kitty from "@libs/kitty";

export type IOEvents = {
  "key.press": (_: events.EventData<{ key: kitty.Key }>) => Promise<void>;
};

export type IOSignals = {
  "resize": () => void;
  "render": () => void;
};

export type IO = {
  events: events.Listener<IOEvents>;
  signals: events.Listener<IOSignals>;
  resize(): void;
  loop(_: () => unknown): Promise<void>;
};
