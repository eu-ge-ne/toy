import * as events from "@libs/events";

export type CursorSignals = {
  "change": (_: { ln: number; col: number }) => void;
};

export type Cursor = {
  signals: events.Listener<CursorSignals>;
};
