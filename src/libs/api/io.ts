import * as events from "@libs/events";
import * as kitty from "@libs/kitty";

export type IOEvents = {
  "key.press": (_: events.EventData<{ key: kitty.Key }>) => Promise<void>;
};

export type IOReactorEvents = {
  "resize": () => void;
  "render": () => void;
};

export type IO = {
  events: events.Listener<IOEvents, IOReactorEvents>;
  runLoop(
    iter: (ctx: { continue: boolean; layoutChanged: boolean }) => void,
  ): Promise<void>;
};
