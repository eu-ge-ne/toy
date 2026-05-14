import * as events from "@libs/events";

export type DocSignals = {
  "change": (_: { modified: boolean; lineCount: number }) => void;
  "change.name": (_: string) => void;
};

export type Doc = {
  signals: events.SignalListener<DocSignals>;

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
