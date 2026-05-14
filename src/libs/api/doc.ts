import * as events from "@libs/events";

export type DocEvents = Record<PropertyKey, never>;

export type DocNotifications = {
  "change": (_: { modified: boolean; lineCount: number }) => void;
  "change.name": (_: string) => void;
};

export type Doc = {
  events: events.Listener<DocEvents, DocNotifications>;

  open(_: string): Promise<void>;
  save(): Promise<void>;
  saveAs(): Promise<void>;

  reset(): void;
  write(_: string): void;
  read(): Iterable<string>;

  toggleWhitespace(): void;
  toggleWrap(): void;

  selectAll(): void;
  undo(): void;
  redo(): void;
  copy(): void;
  cut(): void;
  paste(): void;
};
