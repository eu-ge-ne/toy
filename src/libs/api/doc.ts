import * as events from "@libs/events";

export type DocSignals = {
  "change": (_: { modified: boolean; lineCount: number }) => void;
  "change.name": (_: string) => void;
  "change.cursor": (_: { ln: number; col: number }) => void;
};

export type Doc = {
  signals: events.Listener<DocSignals>;

  open(_: string): Promise<void>;
  save(): Promise<void>;
  saveAs(): Promise<void>;

  toggleWhitespace(): void;
  toggleWrap(): void;
  selectAll(): void;
  undo(): void;
  redo(): void;
  copy(): void;
  cut(): void;
  paste(): void;
};
