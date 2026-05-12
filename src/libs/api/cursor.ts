import * as events from "@libs/events";

export type CursorInterceptorEvents = Record<PropertyKey, never>;

export type CursorReactorEvents = {
  "change": (_: { ln: number; col: number }) => void;
};

export type CursorAPI = {
  events: events.Listener<CursorInterceptorEvents, CursorReactorEvents>;
};
