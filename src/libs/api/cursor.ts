import * as events from "@libs/events";

export type CursorEvents = Record<PropertyKey, never>;

export type CursorNotifications = {
  "change": (_: { ln: number; col: number }) => void;
};

export type Cursor = {
  events: events.Listener<CursorEvents, CursorNotifications>;
};
