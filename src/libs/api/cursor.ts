import * as events from "@libs/events";

export type CursorEvents = Record<PropertyKey, never>;

export type CursorReactorEvents = {
  "change": (_: { ln: number; col: number }) => void;
};

export type Cursor = {
  events: events.Listener<CursorEvents, CursorReactorEvents>;
};
