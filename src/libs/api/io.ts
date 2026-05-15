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
  loop(_: (ctx: { continue: boolean; layoutChanged: boolean }) => void): Promise<void>;
};
