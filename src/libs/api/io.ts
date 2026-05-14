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
  events: events.EventListener<IOEvents>;
  signals: events.SignalListener<IOSignals>;
  runLoop(
    iter: (ctx: { continue: boolean; layoutChanged: boolean }) => void,
  ): Promise<void>;
};
