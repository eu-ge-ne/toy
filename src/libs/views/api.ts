import * as events from "@libs/events";

export type ViewSignals = {
  "change.cursor": (_: { ln: number; col: number }) => void;
};

export type ViewAPI = {
  signals: events.Listener<ViewSignals>;
  toggleWhitespace(): void;
  toggleWrap(): void;
  selectAll(): void;
  copy(): void;
  cut(): void;
  paste(): void;
};
