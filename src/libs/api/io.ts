import * as events from "@libs/events";
import * as kitty from "@libs/kitty";

export type IOInterceptorEvents = {
  "key.press": (_: events.DispatchedData<{ key: kitty.Key }>) => Promise<void>;
};

export type IOReactorEvents = {
  "resize": () => void;
  "render": () => void;
};

export type IO = {
  events: events.Listener<IOInterceptorEvents, IOReactorEvents>;
  runLoop(
    iter: (ctx: { continue: boolean; layoutChanged: boolean }) => void,
  ): Promise<void>;
};
